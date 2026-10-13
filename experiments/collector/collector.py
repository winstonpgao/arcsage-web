#!/usr/bin/env python3
"""Durable local A/B event collector. Python stdlib; no external services or fake data."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import signal
import sqlite3
import threading
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

EXPERIMENT_ID = "arcsage-contact-cta-v1"
FIELDS = {"experiment_id", "variant", "visitor_id", "event_id", "event_name", "occurred_at", "path"}
ATTRIBUTED = ("valid_exposure", "attributed_intent")


class ValidationError(ValueError):
    pass


class EventConflict(ValueError):
    pass


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def validate_event(payload, allowed_paths):
    if not isinstance(payload, dict) or set(payload) != FIELDS:
        raise ValidationError("Expected exactly the documented event fields.")
    if any(not isinstance(payload[field], str) for field in FIELDS):
        raise ValidationError("Every event field must be a string.")
    if payload["experiment_id"] != EXPERIMENT_ID:
        raise ValidationError("Unknown experiment.")
    if payload["variant"] not in {"A", "B"}:
        raise ValidationError("Variant must be A or B.")
    if payload["event_name"] not in {"exposure", "contact_intent"}:
        raise ValidationError("Unknown event name.")
    result = dict(payload)
    for field in ["visitor_id", "event_id"]:
        try:
            parsed = uuid.UUID(payload[field])
            if str(parsed) != payload[field].lower() or parsed.int == 0:
                raise ValueError()
            result[field] = str(parsed)
        except (ValueError, AttributeError):
            raise ValidationError("Visitor and event IDs must be canonical, nonzero UUIDs.") from None
    if len(payload["occurred_at"]) > 64:
        raise ValidationError("Invalid timestamp.")
    try:
        timestamp = datetime.fromisoformat(payload["occurred_at"].replace("Z", "+00:00"))
        if timestamp.tzinfo is None or timestamp.utcoffset() is None or "T" not in payload["occurred_at"]:
            raise ValueError()
        result["occurred_at"] = timestamp.astimezone(timezone.utc).isoformat(timespec="microseconds")
    except (ValueError, OverflowError):
        raise ValidationError("occurred_at must be a timezone-aware ISO8601 timestamp.") from None
    if len(payload["path"]) > 512 or payload["path"] not in allowed_paths:
        raise ValidationError("Path is not an approved static route.")
    return result


def _csv_env(name, default):
    return frozenset(item.strip() for item in os.environ.get(name, default).split(",") if item.strip())


@dataclass(frozen=True)
class Config:
    db_path: Path
    allowed_origins: frozenset[str]
    allowed_paths: frozenset[str]
    report_enabled: bool = False
    report_token: str = ""
    max_body_bytes: int = 4096
    request_timeout: float = 10.0
    max_threads: int = 32

    def __post_init__(self):
        if self.report_enabled and (len(self.report_token) < 32 or len(self.report_token) > 512 or any(c.isspace() for c in self.report_token)):
            raise ValueError("Enabled reports require a secret token of at least 32 characters, without whitespace.")

    @classmethod
    def from_env(cls):
        production = os.environ.get("APP_ENV", "local") == "production"
        if production and not os.environ.get("ALLOWED_ORIGINS", "").strip():
            raise ValueError("Production requires an explicit ALLOWED_ORIGINS allowlist.")
        origins = _csv_env("ALLOWED_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000")
        if not origins:
            raise ValueError("ALLOWED_ORIGINS must not be empty.")
        for origin in origins:
            parsed = urlsplit(origin)
            try:
                parsed.port
            except ValueError:
                raise ValueError("ALLOWED_ORIGINS contains an invalid port.") from None
            if (not parsed.hostname or parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path or parsed.query
                    or parsed.fragment or parsed.username or parsed.password or "*" in origin):
                raise ValueError("ALLOWED_ORIGINS must contain exact HTTP(S) origins, without paths or wildcards.")
            if production and parsed.scheme != "https":
                raise ValueError("Production ALLOWED_ORIGINS must use HTTPS.")
        paths = _csv_env("ALLOWED_PATHS", "/contact")
        if not paths or any(not path.startswith("/") or "?" in path or "#" in path or len(path) > 512 for path in paths):
            raise ValueError("ALLOWED_PATHS must contain approved static paths without queries or fragments.")
        enabled_value = os.environ.get("REPORT_ENABLED", "0").lower()
        if enabled_value not in {"0", "1", "false", "true"}:
            raise ValueError("REPORT_ENABLED must be 0 or 1.")
        enabled = enabled_value in {"1", "true"}
        token = os.environ.get("REPORT_TOKEN", "")
        if enabled and (len(token) < 32 or len(token) > 512 or any(c.isspace() for c in token)):
            raise ValueError("Enabled reports require a REPORT_TOKEN of at least 32 characters, without whitespace.")
        max_bytes = int(os.environ.get("MAX_EVENT_BYTES", "4096"))
        timeout = float(os.environ.get("REQUEST_TIMEOUT_SECONDS", "10"))
        threads = int(os.environ.get("MAX_THREADS", "32"))
        if not 256 <= max_bytes <= 65536 or not 1 <= timeout <= 60 or not 1 <= threads <= 256:
            raise ValueError("Event size, timeout, or thread limit is outside supported bounds.")
        db_value = os.environ.get("DB_PATH", str(Path(__file__).parent / "data" / "telemetry.sqlite3"))
        if db_value == ":memory:":
            raise ValueError("DB_PATH must be a persisted filesystem database.")
        return cls(Path(db_value).expanduser().resolve(), origins, paths, enabled, token, max_bytes, timeout, threads)


class EventStore:
    """One connection per operation, WAL, FULL sync, and atomic write transactions."""
    def __init__(self, db_path):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = self._connect()
        try:
            version = conn.execute("PRAGMA user_version").fetchone()[0]
            if version not in {0, 1}:
                raise RuntimeError("Unsupported telemetry schema version; migration required.")
            mode = conn.execute("PRAGMA journal_mode=WAL").fetchone()[0]
            if mode.lower() != "wal":
                raise RuntimeError("SQLite WAL support is required on the chosen local filesystem.")
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id TEXT PRIMARY KEY,
                    experiment_id TEXT NOT NULL,
                    variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
                    visitor_id TEXT NOT NULL,
                    event_name TEXT NOT NULL CHECK (event_name IN ('exposure', 'contact_intent')),
                    occurred_at TEXT NOT NULL,
                    received_at TEXT NOT NULL,
                    path TEXT NOT NULL,
                    payload_hash TEXT NOT NULL,
                    attribution_status TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS visitors (
                    experiment_id TEXT NOT NULL,
                    visitor_id TEXT NOT NULL,
                    variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
                    exposed_at TEXT NOT NULL,
                    first_exposure_event_id TEXT NOT NULL,
                    conflicted INTEGER NOT NULL DEFAULT 0 CHECK (conflicted IN (0, 1)),
                    PRIMARY KEY (experiment_id, visitor_id)
                );
                CREATE INDEX IF NOT EXISTS events_attribution
                    ON events (experiment_id, event_name, attribution_status, variant, visitor_id);
                PRAGMA user_version=1;
            """)
        finally:
            conn.close()

    def _connect(self):
        conn = sqlite3.connect(str(self.db_path), timeout=10, isolation_level=None)
        conn.execute("PRAGMA busy_timeout=10000")
        conn.execute("PRAGMA synchronous=FULL")
        return conn

    def record(self, event):
        fingerprint = hashlib.sha256(json.dumps(event, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        conn = self._connect()
        try:
            conn.execute("BEGIN IMMEDIATE")
            existing = conn.execute("SELECT payload_hash, attribution_status FROM events WHERE event_id=?", (event["event_id"],)).fetchone()
            if existing:
                if existing[0] != fingerprint:
                    raise EventConflict("Event ID was already used with different event content.")
                conn.commit()
                return {"accepted": True, "duplicate": True, "attribution_status": existing[1]}
            visitor = conn.execute("SELECT variant, exposed_at, conflicted FROM visitors WHERE experiment_id=? AND visitor_id=?",
                                   (event["experiment_id"], event["visitor_id"])).fetchone()
            if visitor and visitor[2]:
                status = "conflicted_visitor"
            elif visitor and visitor[0] != event["variant"]:
                status = "variant_conflict"
                conn.execute("UPDATE visitors SET conflicted=1 WHERE experiment_id=? AND visitor_id=?",
                             (event["experiment_id"], event["visitor_id"]))
            elif event["event_name"] == "exposure":
                status = "valid_exposure"
                if not visitor:
                    conn.execute("INSERT INTO visitors (experiment_id,visitor_id,variant,exposed_at,first_exposure_event_id) VALUES (?,?,?,?,?)",
                                 (event["experiment_id"], event["visitor_id"], event["variant"], event["occurred_at"], event["event_id"]))
            elif not visitor:
                status = "intent_without_exposure"
            elif event["occurred_at"] < visitor[1]:
                status = "intent_before_exposure"
            else:
                status = "attributed_intent"
            conn.execute("INSERT INTO events (event_id,experiment_id,variant,visitor_id,event_name,occurred_at,received_at,path,payload_hash,attribution_status) VALUES (?,?,?,?,?,?,?,?,?,?)",
                         (event["event_id"], event["experiment_id"], event["variant"], event["visitor_id"], event["event_name"], event["occurred_at"], utc_now(), event["path"], fingerprint, status))
            conn.commit()
            return {"accepted": True, "duplicate": False, "attribution_status": status}
        except BaseException:
            conn.rollback()
            raise
        finally:
            conn.close()

    def healthy(self):
        conn = self._connect()
        try:
            return conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='events'").fetchone() is not None
        finally:
            conn.close()

    def report(self):
        conn = self._connect()
        try:
            conn.execute("BEGIN")
            exposed = dict(conn.execute("SELECT variant,COUNT(*) FROM visitors WHERE experiment_id=? AND conflicted=0 GROUP BY variant", (EXPERIMENT_ID,)))
            intents = dict(conn.execute("""SELECT e.variant,COUNT(DISTINCT e.visitor_id) FROM events e
                JOIN visitors v ON v.experiment_id=e.experiment_id AND v.visitor_id=e.visitor_id
                WHERE e.experiment_id=? AND e.event_name='contact_intent' AND e.attribution_status='attributed_intent'
                AND v.conflicted=0 AND v.variant=e.variant GROUP BY e.variant""", (EXPERIMENT_ID,)))
            statuses = dict(conn.execute("SELECT attribution_status,COUNT(*) FROM events WHERE experiment_id=? GROUP BY attribution_status", (EXPERIMENT_ID,)))
            conflict_visitors = conn.execute("SELECT COUNT(*) FROM visitors WHERE experiment_id=? AND conflicted=1", (EXPERIMENT_ID,)).fetchone()[0]
            excluded_events = conn.execute("""SELECT COUNT(*) FROM events e JOIN visitors v
                ON v.experiment_id=e.experiment_id AND v.visitor_id=e.visitor_id
                WHERE e.experiment_id=? AND v.conflicted=1""", (EXPERIMENT_ID,)).fetchone()[0]
            conn.commit()
            return {
                "experiment_id": EXPERIMENT_ID,
                "generated_at": utc_now(),
                "variants": {variant: {"exposed_visitors": exposed.get(variant, 0), "intent_visitors": intents.get(variant, 0),
                                        "intent_rate": intents.get(variant, 0) / exposed[variant] if exposed.get(variant, 0) else None} for variant in ["A", "B"]},
                "quality": {"persisted_events": sum(statuses.values()), "variant_conflict_events": statuses.get("variant_conflict", 0),
                            "conflicted_visitors": conflict_visitors, "events_excluded_due_to_visitor_conflict": excluded_events,
                            "invalid_attribution_events": sum(statuses.get(status, 0) for status in ["intent_without_exposure", "intent_before_exposure", "conflicted_visitor"]),
                            "attribution_status_counts": statuses},
                "statistical_inference": {"status": "not_planned", "reason": "No sample size or stopping rule has been planned; no significance or confidence interval is calculated."},
                "definitions": {"exposed_visitors": "Unique visitor UUIDs with a persisted exposure and no variant conflict.",
                                "intent_visitors": "Unique exposed visitors with a same-variant intent received after exposure, with occurred_at at or after exposure; conflicted visitors excluded.",
                                "contact_intent": "A supplied contact-intent event; it is not proof of a submitted enquiry, qualified lead, or sale.",
                                "invalid_attribution_events": "Disjoint event-status count excluding variant_conflict events; event exclusion due to a conflicted visitor overlaps these status counts."},
            }
        finally:
            conn.close()


class CollectorServer(ThreadingHTTPServer):
    daemon_threads = False
    block_on_close = True
    allow_reuse_address = True

    def __init__(self, address, config, store):
        self.config = config
        self.store = store
        self.thread_slots = threading.BoundedSemaphore(config.max_threads)
        super().__init__(address, CollectorHandler)

    def get_request(self):
        request, address = super().get_request()
        request.settimeout(self.config.request_timeout)
        return request, address

    def process_request(self, request, client_address):
        if not self.thread_slots.acquire(blocking=False):
            try:
                request.sendall(b"HTTP/1.1 503 Service Unavailable\r\nContent-Length: 0\r\nConnection: close\r\n\r\n")
            finally:
                self.shutdown_request(request)
            return
        try:
            super().process_request(request, client_address)
        except BaseException:
            self.thread_slots.release()
            raise

    def process_request_thread(self, request, client_address):
        try:
            super().process_request_thread(request, client_address)
        finally:
            self.thread_slots.release()

    def handle_error(self, request, client_address):
        # Suppress stdlib tracebacks that include remote addresses/request details.
        pass


class CollectorHandler(BaseHTTPRequestHandler):
    server_version = "Collector"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    def log_message(self, format, *args):
        # No application access logs: do not retain IPs, URLs, tokens, or request bodies.
        pass

    def _allowed_origin(self):
        origins = self.headers.get_all("Origin", [])
        return len(origins) == 1 and origins[0] in self.server.config.allowed_origins

    def _respond(self, status, body):
        encoded = json.dumps(body, separators=(",", ":"), allow_nan=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Vary", "Origin")
        if self._allowed_origin():
            self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin"))
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True
        self.wfile.write(encoded)

    def do_OPTIONS(self):
        if urlsplit(self.path).path != "/events":
            return self._respond(404, {"error": "Not found."})
        if not self._allowed_origin():
            return self._respond(403, {"error": "Origin is not allowed."})
        if self.headers.get("Access-Control-Request-Method") != "POST":
            return self._respond(405, {"error": "Only POST is supported."})
        requested = {header.strip().lower() for header in self.headers.get("Access-Control-Request-Headers", "").split(",") if header.strip()}
        if not requested <= {"content-type"}:
            return self._respond(400, {"error": "Unsupported request headers."})
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin"))
        self.send_header("Access-Control-Allow-Methods", "POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.send_header("Content-Length", "0")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True

    def do_GET(self):
        route = urlsplit(self.path).path
        if route == "/health":
            try:
                if self.server.store.healthy():
                    return self._respond(200, {"status": "ok"})
            except sqlite3.Error:
                pass
            return self._respond(503, {"status": "unavailable"})
        if route != "/report" or not self.server.config.report_enabled:
            return self._respond(404, {"error": "Not found."})
        authorization = self.headers.get("Authorization", "")
        scheme, separator, candidate = authorization.partition(" ")
        if not separator or scheme.lower() != "bearer" or not hmac.compare_digest(candidate.encode(), self.server.config.report_token.encode()):
            return self._respond(401, {"error": "Authorization required."})
        try:
            return self._respond(200, self.server.store.report())
        except sqlite3.Error:
            return self._respond(503, {"error": "Storage temporarily unavailable."})

    def do_POST(self):
        if urlsplit(self.path).path != "/events":
            return self._respond(404, {"error": "Not found."})
        if not self._allowed_origin():
            return self._respond(403, {"error": "Origin is not allowed."})
        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type != "application/json":
            return self._respond(415, {"error": "Content-Type must be application/json."})
        lengths = self.headers.get_all("Content-Length", [])
        if self.headers.get("Transfer-Encoding") or len(lengths) != 1:
            return self._respond(411, {"error": "One Content-Length is required; transfer encoding is unsupported."})
        try:
            length = int(lengths[0])
        except ValueError:
            return self._respond(400, {"error": "Invalid Content-Length."})
        if length > self.server.config.max_body_bytes:
            return self._respond(413, {"error": "Event body is too large."})
        if length <= 0:
            return self._respond(400, {"error": "Event body is empty."})
        try:
            raw = self.rfile.read(length)
            if len(raw) != length:
                return self._respond(400, {"error": "Incomplete event body."})
            payload = json.loads(raw.decode("utf-8"), object_pairs_hook=_unique_object)
            event = validate_event(payload, self.server.config.allowed_paths)
            result = self.server.store.record(event)
            return self._respond(200 if result["duplicate"] else 201, result)
        except TimeoutError:
            return self._respond(408, {"error": "Request timed out."})
        except (UnicodeDecodeError, json.JSONDecodeError, ValidationError):
            return self._respond(400, {"error": "Invalid event payload."})
        except EventConflict:
            return self._respond(409, {"error": "Event ID content conflict."})
        except sqlite3.Error:
            return self._respond(503, {"error": "Storage temporarily unavailable."})


def _unique_object(pairs):
    obj = {}
    for key, value in pairs:
        if key in obj:
            raise ValidationError("Duplicate JSON keys are ambiguous.")
        obj[key] = value
    return obj


def main():
    os.umask(0o077)
    config = Config.from_env()
    host = os.environ.get("BIND_HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8767"))
    if not 1 <= port <= 65535:
        raise ValueError("PORT is outside supported bounds.")
    server = CollectorServer((host, port), config, EventStore(config.db_path))
    def stop(signum, frame):
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    print("Collector ready; report " + ("enabled" if config.report_enabled else "disabled") + ".", flush=True)
    try:
        server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
