"""Firestore backend. SDK imports are lazy, so SQLite remains standard-library only."""
from __future__ import annotations

import copy
import hashlib
import json
import re
import threading
import weakref
from datetime import datetime, timezone

EXPERIMENT_ID = "arcsage-contact-cta-v1"
STATUSES = {"valid_exposure", "attributed_intent", "variant_conflict", "conflicted_visitor", "intent_without_exposure", "intent_before_exposure"}
INVALID_STATUSES = {"conflicted_visitor", "intent_without_exposure", "intent_before_exposure"}
_NAMESPACE_LOCKS = weakref.WeakValueDictionary()
_NAMESPACE_LOCKS_GUARD = threading.Lock()


def namespace_lock(project, database, prefix):
    key = (project, database, prefix)
    with _NAMESPACE_LOCKS_GUARD:
        lock = _NAMESPACE_LOCKS.get(key)
        if lock is None:
            lock = threading.Lock()
            _NAMESPACE_LOCKS[key] = lock
        return lock


class FirestoreEventConflict(ValueError):
    pass


class StorageUnavailable(RuntimeError):
    """Safe storage failure exposed as HTTP 503; never switch storage backends."""


def validate_target(project, prefix, database="(default)"):
    if not isinstance(project, str) or not project or project != project.strip() or "/" in project or any(c.isspace() for c in project):
        raise ValueError("Firestore requires an explicit GOOGLE_CLOUD_PROJECT.")
    if not isinstance(prefix, str) or not re.fullmatch(r"[a-z][a-z0-9_-]{2,63}", prefix):
        raise ValueError("Firestore requires a dedicated FIRESTORE_COLLECTION_PREFIX (3–64 lowercase letters, digits, '_' or '-').")
    if not isinstance(database, str) or not database or "/" in database or any(c.isspace() for c in database):
        raise ValueError("Invalid FIRESTORE_DATABASE.")


def empty_counters():
    return {"schema_version": 1,
            "variants": {v: {"exposed_visitors": 0, "intent_visitors": 0} for v in ["A", "B"]},
            "persisted_events": 0, "conflicted_visitors": 0, "events_excluded_due_to_visitor_conflict": 0,
            "attribution_status_counts": {}}


def checked_counters(data):
    state = copy.deepcopy(data) if data is not None else empty_counters()
    try:
        if type(state["schema_version"]) is not int or state["schema_version"] != 1:
            raise ValueError()
        numeric = [state[k] for k in ["persisted_events", "conflicted_visitors", "events_excluded_due_to_visitor_conflict"]]
        for variant in ["A", "B"]:
            exposed, intents = [state["variants"][variant][k] for k in ["exposed_visitors", "intent_visitors"]]
            numeric.extend([exposed, intents])
            if intents > exposed:
                raise ValueError()
        counts = state["attribution_status_counts"]
        if not isinstance(counts, dict) or not set(counts) <= STATUSES:
            raise ValueError()
        numeric.extend(counts.values())
        if any(type(n) is not int or n < 0 for n in numeric) or sum(counts.values()) != state["persisted_events"]:
            raise ValueError()
        exposed = sum(state["variants"][v]["exposed_visitors"] for v in ["A", "B"])
        intents = sum(state["variants"][v]["intent_visitors"] for v in ["A", "B"])
        conflicts = state["conflicted_visitors"]
        excluded = state["events_excluded_due_to_visitor_conflict"]
        exposure_events = counts.get("valid_exposure", 0)
        intent_events = counts.get("attributed_intent", 0)
        later_conflict_events = counts.get("conflicted_visitor", 0)
        # Raw status totals include repeats and withdrawn outcomes. These are
        # necessary inequalities, not equality between events and unique visitors.
        if exposed + conflicts > exposure_events or intents > intent_events:
            raise ValueError()
        if conflicts != counts.get("variant_conflict", 0):
            raise ValueError()
        # Each conflict has its exposure + first conflicting event. Every later
        # conflicted event is also excluded; pre-exposure invalid intents may add more.
        if excluded < 2 * conflicts + later_conflict_events:
            raise ValueError()
        if excluded + exposed + intents > state["persisted_events"]:
            raise ValueError()
        if not conflicts and (excluded or later_conflict_events):
            raise ValueError()
        if exposure_events and not (exposed + conflicts):
            raise ValueError()
        if intent_events and not (intents + conflicts):
            raise ValueError()
        if counts.get("intent_before_exposure", 0) and not exposure_events:
            raise ValueError()
        return state
    except (KeyError, TypeError, ValueError):
        raise StorageUnavailable("Telemetry aggregate is inconsistent; repair or migration required.") from None


def checked_namespace(marker, aggregate):
    """Validate both documents from one snapshot; only both absent is fresh."""
    if (marker is None) != (aggregate is None):
        raise StorageUnavailable("Telemetry initialization marker/aggregate mismatch; repair required.")
    if marker is None:
        return None
    if (not isinstance(marker, dict) or type(marker.get("schema_version")) is not int
            or marker["schema_version"] != 1 or marker.get("experiment_id") != EXPERIMENT_ID):
        raise StorageUnavailable("Telemetry marker schema or experiment identity is invalid.")
    state = checked_counters(aggregate)
    # The marker is created atomically with the first actual event. A present
    # marker with zero events is a reset/corruption, never a fresh experiment.
    if not state["persisted_events"]:
        raise StorageUnavailable("Initialized telemetry aggregate has no events; repair required.")
    return state


def evolve(event, visitor_data, aggregate_data):
    """Pure transition; called anew on every transaction retry, without global mutation."""
    counters = checked_counters(aggregate_data)
    visitor = copy.deepcopy(visitor_data) if visitor_data is not None else {
        "schema_version": 1, "variant": None, "exposed_at": None, "first_exposure_event_id": None,
        "conflicted": False, "has_attributed_intent": False, "event_count": 0}
    try:
        if type(visitor["schema_version"]) is not int or visitor["schema_version"] != 1 or type(visitor["event_count"]) is not int or visitor["event_count"] < 0:
            raise ValueError()
        if type(visitor["conflicted"]) is not bool or type(visitor["has_attributed_intent"]) is not bool:
            raise ValueError()
        assigned = visitor["variant"]
        if assigned not in {None, "A", "B"} or (assigned is None and (visitor["conflicted"] or visitor["has_attributed_intent"])):
            raise ValueError()
        if assigned is not None and not isinstance(visitor["exposed_at"], str):
            raise ValueError()
    except (KeyError, TypeError, ValueError):
        raise StorageUnavailable("Telemetry visitor state is inconsistent; repair required.") from None
    variant = event["variant"]
    if visitor["conflicted"]:
        status = "conflicted_visitor"
        counters["events_excluded_due_to_visitor_conflict"] += 1
    elif assigned is not None and assigned != variant:
        status = "variant_conflict"
        visitor["conflicted"] = True
        counters["conflicted_visitors"] += 1
        counters["events_excluded_due_to_visitor_conflict"] += visitor["event_count"] + 1
        counters["variants"][assigned]["exposed_visitors"] -= 1
        if visitor["has_attributed_intent"]:
            counters["variants"][assigned]["intent_visitors"] -= 1
    elif event["event_name"] == "exposure":
        status = "valid_exposure"
        if assigned is None:
            visitor["variant"] = variant
            visitor["exposed_at"] = event["occurred_at"]
            visitor["first_exposure_event_id"] = event["event_id"]
            counters["variants"][variant]["exposed_visitors"] += 1
    elif assigned is None:
        status = "intent_without_exposure"
    elif event["occurred_at"] < visitor["exposed_at"]:
        status = "intent_before_exposure"
    else:
        status = "attributed_intent"
        if not visitor["has_attributed_intent"]:
            visitor["has_attributed_intent"] = True
            counters["variants"][variant]["intent_visitors"] += 1
    visitor["event_count"] += 1
    counters["persisted_events"] += 1
    counts = counters["attribution_status_counts"]
    counts[status] = counts.get(status, 0) + 1
    checked_counters(counters)
    return status, visitor, counters


def render_report(aggregate):
    state = checked_counters(aggregate)
    counts = state["attribution_status_counts"]
    return {
        "experiment_id": EXPERIMENT_ID,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="microseconds"),
        "variants": {variant: {**state["variants"][variant], "intent_rate": state["variants"][variant]["intent_visitors"] / state["variants"][variant]["exposed_visitors"] if state["variants"][variant]["exposed_visitors"] else None} for variant in ["A", "B"]},
        "quality": {"persisted_events": state["persisted_events"], "variant_conflict_events": counts.get("variant_conflict", 0),
                    "conflicted_visitors": state["conflicted_visitors"], "events_excluded_due_to_visitor_conflict": state["events_excluded_due_to_visitor_conflict"],
                    "invalid_attribution_events": sum(counts.get(status, 0) for status in INVALID_STATUSES), "attribution_status_counts": counts},
        "statistical_inference": {"status": "not_planned", "reason": "No sample size or stopping rule has been planned; no significance or confidence interval is calculated."},
        "definitions": {"exposed_visitors": "Unique visitor UUIDs with a persisted exposure and no variant conflict.",
                        "intent_visitors": "Unique exposed visitors with a same-variant intent received after exposure, with occurred_at at or after exposure; conflicted visitors excluded.",
                        "contact_intent": "A supplied contact-intent event; it is not proof of a submitted enquiry, qualified lead, or sale.",
                        "invalid_attribution_events": "Disjoint event-status count excluding variant_conflict events; event exclusion due to a conflicted visitor overlaps these status counts."}}


class FirestoreEventStore:
    """Point reads/writes per new event; a consistent aggregate per report.

    This aggregate transaction favors exact pilot counts over high write throughput.
    Every SDK failure is surfaced; no disk/memory/SQLite fallback exists.
    """
    def __init__(self, project, collection_prefix, database="(default)", *, client=None):
        validate_target(project, collection_prefix, database)
        try:
            from google.cloud import firestore
            from google.api_core.exceptions import GoogleAPIError, RetryError
        except ImportError:
            raise RuntimeError("Firestore backend requires the pinned SDK in requirements.txt.") from None
        self.firestore = firestore
        self._write_lock = namespace_lock(project, database, collection_prefix)
        self.api_errors = (GoogleAPIError, RetryError)
        self.client = client or firestore.Client(project=project, database=database)
        self.root = self.client.collection(collection_prefix + "_experiments").document(EXPERIMENT_ID)
        self.aggregate_ref = self.root.collection("statistics").document("current")

    def record(self, event):
        # Serialize this pilot's local writers to avoid aggregate upgrade contention.
        # Firestore transactions still guard independent instances; they may return
        # 503 under contention, which callers retry with the same event IDs.
        if not self._write_lock.acquire(timeout=10):
            raise StorageUnavailable("Firestore write queue is busy; retry the same event ID.")
        try:
            return self._record(event)
        finally:
            self._write_lock.release()

    def _record(self, event):
        # HTTP validation already canonicalizes IDs/times and rejects unknown/PII fields.
        if event["experiment_id"] != EXPERIMENT_ID:
            raise ValueError("Unknown experiment.")
        fingerprint = hashlib.sha256(json.dumps(event, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        received_at = datetime.now(timezone.utc).isoformat(timespec="microseconds")
        event_ref = self.root.collection("events").document(event["event_id"])
        visitor_ref = self.root.collection("visitors").document(event["visitor_id"])
        transaction = self.client.transaction(max_attempts=10)

        @self.firestore.transactional
        def persist(tx):
            existing = event_ref.get(transaction=tx, retry=None, timeout=10)
            # Read the aggregate before marker/visitor to preserve shared lock order.
            aggregate = self.aggregate_ref.get(transaction=tx, retry=None, timeout=10)
            marker = self.root.get(transaction=tx, retry=None, timeout=10)
            state = checked_namespace(marker.to_dict() if marker.exists else None,
                                      aggregate.to_dict() if aggregate.exists else None)
            if existing.exists:
                if state is None:
                    raise StorageUnavailable("Persisted event has no initialized experiment state.")
                data = existing.to_dict()
                if data.get("payload_hash") != fingerprint:
                    raise FirestoreEventConflict("Event ID was already used with different event content.")
                return {"accepted": True, "duplicate": True, "attribution_status": data["attribution_status"]}
            visitor = visitor_ref.get(transaction=tx, retry=None, timeout=10)
            if state is None and visitor.exists:
                raise StorageUnavailable("Persisted visitor has no initialized experiment state.")
            status, next_visitor, next_aggregate = evolve(event, visitor.to_dict() if visitor.exists else None, state)
            if not marker.exists:
                tx.create(self.root, {"schema_version": 1, "experiment_id": EXPERIMENT_ID})
            tx.create(event_ref, {**event, "received_at": received_at, "payload_hash": fingerprint, "attribution_status": status, "schema_version": 1})
            tx.set(visitor_ref, next_visitor)
            tx.set(self.aggregate_ref, next_aggregate)
            return {"accepted": True, "duplicate": False, "attribution_status": status}

        try:
            return persist(transaction)
        except self.api_errors:
            raise StorageUnavailable("Firestore temporarily unavailable.") from None
        except ValueError as error:
            # The official transaction decorator raises ValueError on exhausted retries.
            if isinstance(error.__cause__, self.api_errors):
                raise StorageUnavailable("Firestore transaction retry limit reached.") from None
            raise

    def report(self):
        transaction = self.client.transaction(read_only=True, max_attempts=1)

        @self.firestore.transactional
        def read_snapshot(tx):
            aggregate = self.aggregate_ref.get(transaction=tx, retry=None, timeout=10)
            marker = self.root.get(transaction=tx, retry=None, timeout=10)
            return checked_namespace(marker.to_dict() if marker.exists else None,
                                     aggregate.to_dict() if aggregate.exists else None)

        try:
            return render_report(read_snapshot(transaction))
        except self.api_errors:
            raise StorageUnavailable("Firestore temporarily unavailable.") from None
        except ValueError as error:
            if isinstance(error.__cause__, self.api_errors):
                raise StorageUnavailable("Firestore read transaction failed.") from None
            raise

    def healthy(self):
        # A read of an absent aggregate is valid for an empty experiment; no seeding.
        self.report()
        return True

    def close(self):
        self.client.close()
