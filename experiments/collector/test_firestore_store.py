"""Pure checks and real emulator tests. Never connect tests to a cloud project."""
import copy
import http.client
import json
import os
import tempfile
import threading
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch
from urllib.parse import urlsplit
from collector import Config, CollectorServer, EventConflict, EventStore, create_store
from firestore_store import FirestoreEventConflict, FirestoreEventStore, StorageUnavailable, empty_counters, evolve, render_report, checked_namespace
from test_collector import event, ORIGIN, TOKEN


def comparable(report):
    result = copy.deepcopy(report)
    result.pop("generated_at", None)
    return result


class FirestoreUnitTests(unittest.TestCase):
    def test_missing_cloud_target_namespace_or_invalid_backend_fails(self):
        for env in [{"STORAGE_BACKEND": "unknown"}, {"STORAGE_BACKEND": "firestore"},
                    {"STORAGE_BACKEND": "firestore", "GOOGLE_CLOUD_PROJECT": "demo-geo-arcsage-lab"}]:
            with patch.dict(os.environ, env, clear=True):
                with self.assertRaises(ValueError): Config.from_env()

    def test_requested_firestore_never_falls_back_to_sqlite(self):
        config = Config(Path("must-not-create.sqlite3"), frozenset({ORIGIN}), frozenset({"/contact"}),
                        storage_backend="firestore", cloud_project="demo-geo-arcsage-lab", firestore_prefix="lab_isolated")
        with patch("firestore_store.FirestoreEventStore", side_effect=RuntimeError("SDK unavailable")), patch("collector.EventStore") as sqlite:
            with self.assertRaises(RuntimeError): create_store(config)
            sqlite.assert_not_called()

    def test_production_cannot_silently_target_emulator(self):
        env = {"APP_ENV": "production", "ALLOWED_ORIGINS": "https://example.test", "STORAGE_BACKEND": "firestore", "GOOGLE_CLOUD_PROJECT": "demo-geo-arcsage-lab", "FIRESTORE_COLLECTION_PREFIX": "lab_isolated", "FIRESTORE_EMULATOR_HOST": "127.0.0.1:8789"}
        with patch.dict(os.environ, env, clear=True):
            with self.assertRaises(ValueError): Config.from_env()

    def test_conflict_withdrawal_is_pure_and_includes_preexposure_events(self):
        visitor = str(uuid.uuid4())
        inputs = empty_counters()
        _, state, counts = evolve(event(visitor, event_name="contact_intent"), None, inputs)
        self.assertEqual(inputs, empty_counters())
        _, state, counts = evolve(event(visitor), state, counts)
        _, state, counts = evolve(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"), state, counts)
        old_state, old_counts = copy.deepcopy(state), copy.deepcopy(counts)
        status, next_state, next_counts = evolve(event(visitor, variant="B"), state, counts)
        self.assertEqual(status, "variant_conflict")
        self.assertEqual(state, old_state)
        self.assertEqual(counts, old_counts)
        self.assertEqual(next_counts["events_excluded_due_to_visitor_conflict"], 4)
        self.assertEqual(next_counts["variants"]["A"], {"exposed_visitors": 0, "intent_visitors": 0})

    def test_corruption_is_not_reported_as_zero(self):
        for modify in [lambda x: x.update(schema_version=2), lambda x: x.update(persisted_events=-1), lambda x: x["variants"]["A"].update(intent_visitors=1)]:
            counts = empty_counters(); modify(counts)
            with self.assertRaises(StorageUnavailable): render_report(counts)


    def test_marker_pair_schema_and_identity_are_required(self):
        good = {"schema_version": 1, "experiment_id": "arcsage-contact-cta-v1"}
        self.assertIsNone(checked_namespace(None, None))
        _, _, initialized = evolve(event(str(uuid.uuid4())), None, None)
        self.assertEqual(checked_namespace(good, initialized), initialized)
        for marker in [None, {}, {**good, "schema_version": 999}, {**good, "schema_version": True}, {**good, "schema_version": 1.0}, {**good, "experiment_id": "other"}]:
            with self.subTest(marker=marker):
                with self.assertRaises(StorageUnavailable): checked_namespace(marker, initialized)
        with self.assertRaises(StorageUnavailable): checked_namespace(good, None)
        with self.assertRaises(StorageUnavailable): checked_namespace(good, empty_counters())

    def test_impossible_cross_counter_histories_are_rejected(self):
        visitor = str(uuid.uuid4())
        _, one, exposed = evolve(event(visitor), None, None)
        _, one, converted = evolve(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"), one, exposed)
        _, conflicted, withdrawn = evolve(event(visitor, variant="B"), one, converted)
        _, conflicted, later = evolve(event(visitor), conflicted, withdrawn)
        cases = []
        def changed(source, mutate):
            state = copy.deepcopy(source); mutate(state); cases.append(state)
        changed(empty_counters(), lambda s: s["variants"]["A"].update(exposed_visitors=1))
        changed(exposed, lambda s: s["variants"]["A"].update(intent_visitors=1))
        changed(exposed, lambda s: s["variants"]["A"].update(exposed_visitors=0))
        changed(converted, lambda s: s["variants"]["A"].update(intent_visitors=0))
        changed(withdrawn, lambda s: s.update(conflicted_visitors=0))
        changed(withdrawn, lambda s: s.update(events_excluded_due_to_visitor_conflict=1))
        changed(later, lambda s: s.update(events_excluded_due_to_visitor_conflict=2))
        changed(exposed, lambda s: s.update(events_excluded_due_to_visitor_conflict=1))
        # A live exposure and intent need two non-excluded events in addition to
        # another visitor's withdrawn exposure/conflict pair.
        other = str(uuid.uuid4())
        _, other_state, mixed = evolve(event(other, variant="B"), None, withdrawn)
        _, other_state, mixed = evolve(event(other, variant="B", event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"), other_state, mixed)
        changed(mixed, lambda s: s.update(events_excluded_due_to_visitor_conflict=s["persisted_events"]-1))
        for state in cases:
            with self.subTest(state=state):
                with self.assertRaises(StorageUnavailable): render_report(state)
        self.assertEqual(render_report(mixed)["variants"]["B"]["intent_visitors"], 1)


@unittest.skipUnless(os.environ.get("FIRESTORE_EMULATOR_HOST"), "Official Firestore emulator required; no mocked certification.")
class FirestoreIntegrationTests(unittest.TestCase):
    def setUp(self):
        host = urlsplit("http://" + os.environ["FIRESTORE_EMULATOR_HOST"]).hostname
        if host not in {"127.0.0.1", "localhost", "::1"}: raise RuntimeError("Tests refuse non-loopback emulators.")
        self.project, self.prefix = "demo-geo-arcsage-lab", "lab_" + uuid.uuid4().hex
        self.store = FirestoreEventStore(self.project, self.prefix)
        self.folder = tempfile.TemporaryDirectory()
        self.sqlite = EventStore(Path(self.folder.name) / "comparison.sqlite3")

    def tearDown(self):
        self.store.close(); self.folder.cleanup()

    def record_both(self, payload):
        self.assertEqual(self.store.record(payload), self.sqlite.record(payload))
        self.assertEqual(comparable(self.store.report()), comparable(self.sqlite.report()))

    def test_empty_backend_does_not_seed_documents_or_metrics(self):
        self.assertEqual(comparable(self.store.report()), comparable(self.sqlite.report()))
        self.assertFalse(self.store.aggregate_ref.get().exists)
        self.assertFalse(self.store.root.get().exists)
        self.assertTrue(self.store.healthy())

    def test_attribution_cases_match_sqlite_after_every_event(self):
        visitor = str(uuid.uuid4())
        sequence = [event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"), event(visitor, occurred_at="2026-10-13T09:00:00+08:00"),
                    event(visitor), event(visitor, event_name="contact_intent", occurred_at="2026-10-13T00:59:00Z"),
                    event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"), event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:02:00Z"),
                    event(variant="B"), event(visitor, variant="B"), event(visitor, event_name="contact_intent"), event(visitor)]
        for payload in sequence: self.record_both(payload)
        self.record_both(sequence[0])

    def test_id_hash_conflict_is_rejected_without_new_count(self):
        payload = event(); self.record_both(payload)
        with self.assertRaises(FirestoreEventConflict): self.store.record(dict(payload, variant="B"))
        with self.assertRaises(EventConflict): self.sqlite.record(dict(payload, variant="B"))
        self.assertEqual(comparable(self.store.report()), comparable(self.sqlite.report()))

    def test_client_reopen_preserves_counts_and_dedup(self):
        exposure = event(); self.record_both(exposure)
        self.store.close(); self.store = FirestoreEventStore(self.project, self.prefix)
        self.record_both(exposure)
        self.record_both(event(exposure["visitor_id"], event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"))
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 2)

    def test_real_concurrent_duplicate_ids_are_atomic(self):
        payload = event()
        with ThreadPoolExecutor(max_workers=8) as pool: results = list(pool.map(self.store.record, [payload] * 16))
        self.assertEqual(sum(not result["duplicate"] for result in results), 1)
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 1)

    def test_two_clients_in_one_process_share_namespace_gate_and_counts(self):
        other = FirestoreEventStore(self.project, self.prefix)
        try:
            payloads = [event(variant="A" if i%2 else "B") for i in range(12)]
            def write(item):
                i, payload = item
                return (self.store if i%2 else other).record(payload)
            with ThreadPoolExecutor(max_workers=4) as pool:
                results = list(pool.map(write, enumerate(payloads)))
            self.assertTrue(all(not result["duplicate"] for result in results))
            report = self.store.report()
            self.assertEqual(report["quality"]["persisted_events"], 12)
            self.assertEqual(sum(v["exposed_visitors"] for v in report["variants"].values()), 12)
            self.assertEqual(comparable(other.report()), comparable(report))
        finally:
            other.close()

    def test_real_concurrent_variant_conflict_excludes_visitor(self):
        visitor = str(uuid.uuid4())
        with ThreadPoolExecutor(max_workers=2) as pool: list(pool.map(self.store.record, [event(visitor, variant="A"), event(visitor, variant="B")]))
        report = self.store.report()
        self.assertEqual(report["quality"]["conflicted_visitors"], 1)
        self.assertEqual(report["quality"]["events_excluded_due_to_visitor_conflict"], 2)
        self.assertEqual(sum(v["exposed_visitors"] for v in report["variants"].values()), 0)

    def test_reports_remain_consistent_during_independent_writers(self):
        done, observations, failures = threading.Event(), [], []
        def reader():
            while not done.is_set():
                try:
                    report = self.store.report()
                    if any(v["intent_visitors"] > v["exposed_visitors"] for v in report["variants"].values()): failures.append("Invalid denominator")
                    if report["quality"]["persisted_events"] != sum(report["quality"]["attribution_status_counts"].values()): failures.append("Mixed snapshot")
                    observations.append(report)
                except StorageUnavailable: pass
        thread = threading.Thread(target=reader); thread.start()
        try:
            visitors = [str(uuid.uuid4()) for _ in range(12)]
            with ThreadPoolExecutor(max_workers=4) as pool:
                list(pool.map(self.store.record, [event(v, variant="A" if i%2 else "B") for i,v in enumerate(visitors)]))
                list(pool.map(self.store.record, [event(v, variant="A" if i%2 else "B", event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z") for i,v in enumerate(visitors)]))
        finally: done.set(); thread.join()
        self.assertTrue(observations); self.assertEqual(failures, [])
        report = self.store.report()
        self.assertEqual(report["quality"]["persisted_events"], 24)
        self.assertEqual(sum(v["intent_visitors"] for v in report["variants"].values()), 12)

    def test_missing_initialized_aggregate_fails_closed(self):
        self.store.record(event()); self.store.aggregate_ref.delete()
        with self.assertRaises(StorageUnavailable): self.store.report()
        with self.assertRaises(StorageUnavailable): self.store.record(event())

    def test_marker_corruption_blocks_reports_health_new_writes_and_retries(self):
        exposure = event(); self.record_both(exposure)
        good = self.store.root.get().to_dict()
        original = self.store.aggregate_ref.get().to_dict()
        for bad in [None, {}, {**good, "schema_version": 999}, {**good, "schema_version": True}, {**good, "experiment_id": "other"}]:
            with self.subTest(marker=bad):
                if bad is None: self.store.root.delete()
                else: self.store.root.set(bad)
                with self.assertRaises(StorageUnavailable): self.store.report()
                with self.assertRaises(StorageUnavailable): self.store.healthy()
                with self.assertRaises(StorageUnavailable): self.store.record(event())
                with self.assertRaises(StorageUnavailable): self.store.record(exposure)
                self.assertEqual(self.store.aggregate_ref.get().to_dict(), original)
        self.store.root.set(good)
        self.assertEqual(comparable(self.store.report()), comparable(self.sqlite.report()))

    def test_phantom_exposure_in_real_aggregate_fails_closed(self):
        self.store.record(event())
        ghost = empty_counters(); ghost["variants"]["A"]["exposed_visitors"] = 1
        self.store.aggregate_ref.set(ghost)
        with self.assertRaises(StorageUnavailable): self.store.report()
        with self.assertRaises(StorageUnavailable): self.store.healthy()
        with self.assertRaises(StorageUnavailable): self.store.record(event())
        self.assertEqual(self.store.aggregate_ref.get().to_dict(), ghost)

    def test_initialized_aggregate_reset_to_empty_fails_closed(self):
        original = event(str(uuid.uuid4()))
        self.record_both(original)
        self.store.aggregate_ref.set(empty_counters())
        for operation in [self.store.report, self.store.healthy,
                          lambda: self.store.record(event(str(uuid.uuid4()))),
                          lambda: self.store.record(original)]:
            with self.assertRaises(StorageUnavailable): operation()
        self.assertEqual(self.store.aggregate_ref.get().to_dict(), empty_counters())

    def test_report_marker_and_aggregate_share_readonly_snapshot(self):
        self.store.record(event())
        original_get = self.store.root.get
        mutated = []
        def update_between_reads(*args, **kwargs):
            if not mutated:
                mutated.append(True)
                self.store.root.set({"schema_version": 999, "experiment_id": "arcsage-contact-cta-v1"}, retry=None, timeout=2)
            return original_get(*args, **kwargs)
        # Mutation after aggregate read must not mix a later marker into this report.
        with patch.object(self.store.root, "get", side_effect=update_between_reads):
            report = self.store.report()
        self.assertEqual(report["quality"]["persisted_events"], 1)
        with self.assertRaises(StorageUnavailable): self.store.report()

    def test_http_dedup_409_auth_and_no_sqlite_fallback(self):
        config = Config(Path(self.folder.name)/"unused.sqlite3", frozenset({ORIGIN}), frozenset({"/contact"}), True, TOKEN, storage_backend="firestore", cloud_project=self.project, firestore_prefix=self.prefix)
        server = CollectorServer(("127.0.0.1",0), config, self.store)
        thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": .01}); thread.start()
        def request(method,path,payload=None,authorized=False):
            conn = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=30)
            try:
                headers = {"Origin": ORIGIN, "Content-Type": "application/json"}
                if authorized: headers["Authorization"] = "Bearer " + TOKEN
                conn.request(method,path,json.dumps(payload).encode() if payload is not None else None,headers)
                response=conn.getresponse(); return response.status,json.loads(response.read())
            finally: conn.close()
        try:
            payload=event()
            self.assertEqual(request("POST","/events",payload)[0],201)
            self.assertEqual(request("POST","/events",payload)[0],200)
            self.assertEqual(request("POST","/events",dict(payload,variant="B"))[0],409)
            self.assertEqual(request("GET","/report")[0],401)
            self.assertEqual(request("GET","/report",authorized=True)[0],200)
            self.assertFalse(config.db_path.exists())
            with patch.object(self.store,"record",side_effect=StorageUnavailable("private detail")):
                status,body=request("POST","/events",event()); self.assertEqual(status,503); self.assertNotIn("accepted",body)
        finally: server.shutdown(); server.server_close(); thread.join()



@unittest.skipUnless(os.environ.get("FIRESTORE_RESTART_FIXTURE_PATH"), "Opt-in actual emulator export/import restart fixture required.")
class FirestoreProcessRestartTests(unittest.TestCase):
    def test_exported_emulator_state_survives_actual_process_restart(self):
        host = urlsplit("http://" + os.environ.get("FIRESTORE_EMULATOR_HOST", "")).hostname
        if host not in {"127.0.0.1", "localhost", "::1"}:
            raise RuntimeError("Restart test requires a loopback emulator.")
        fixture = json.loads(Path(os.environ["FIRESTORE_RESTART_FIXTURE_PATH"]).read_text())
        if fixture["project"] != "demo-geo-arcsage-lab" or not fixture["prefix"].startswith("lab_restart_"):
            raise RuntimeError("Restart fixture must belong to the dedicated demo emulator namespace.")
        store = FirestoreEventStore(fixture["project"], fixture["prefix"])
        try:
            self.assertEqual(comparable(store.report()), fixture["before_restart"])
            retry = store.record(fixture["exposure"])
            self.assertTrue(retry["duplicate"])
            self.assertEqual(comparable(store.report()), fixture["before_restart"])
            result = store.record(event(fixture["visitor_b"], variant="B", event_name="contact_intent", occurred_at="2026-10-13T01:02:00Z"))
            self.assertEqual(result["attribution_status"], "attributed_intent")
            report = store.report()
            self.assertEqual(report["quality"]["persisted_events"], 4)
            self.assertEqual(report["variants"]["A"]["intent_visitors"], 1)
            self.assertEqual(report["variants"]["B"]["intent_visitors"], 1)
        finally:
            store.close()


if __name__ == "__main__": unittest.main()
