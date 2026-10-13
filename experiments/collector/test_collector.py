"""Meaningful persistence, concurrency, attribution, and HTTP boundary tests."""
import http.client
import json
import os
import sqlite3
import tempfile
import threading
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from collector import CollectorServer, Config, EventConflict, EventStore, ValidationError, validate_event

ORIGIN = "http://127.0.0.1:8000"
TOKEN = "test-only-not-production-token-0123456789"


def event(visitor=None, variant="A", event_name="exposure", occurred_at="2026-10-13T01:00:00Z", **overrides):
    payload = {"experiment_id": "arcsage-contact-cta-v1", "variant": variant, "visitor_id": visitor or str(uuid.uuid4()),
               "event_id": str(uuid.uuid4()), "event_name": event_name, "occurred_at": occurred_at, "path": "/contact"}
    payload.update(overrides)
    return validate_event(payload, frozenset({"/contact"}))


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.path = Path(self.folder.name) / "events.sqlite3"
        self.store = EventStore(self.path)

    def tearDown(self):
        self.folder.cleanup()

    def test_empty_real_store_has_zero_counts_null_rates_and_no_significance(self):
        report = self.store.report()
        self.assertEqual(report["quality"]["persisted_events"], 0)
        for metrics in report["variants"].values():
            self.assertEqual(metrics["exposed_visitors"], 0)
            self.assertEqual(metrics["intent_visitors"], 0)
            self.assertIsNone(metrics["intent_rate"])
        self.assertEqual(report["statistical_inference"]["status"], "not_planned")
        self.assertNotIn("p_value", report)

    def test_unique_visitors_and_intents_survive_reopening_database(self):
        visitor = str(uuid.uuid4())
        for _ in range(2):
            self.store.record(event(visitor))
            self.store.record(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"))
        report = EventStore(self.path).report()
        self.assertEqual(report["quality"]["persisted_events"], 4)
        self.assertEqual(report["variants"]["A"], {"exposed_visitors": 1, "intent_visitors": 1, "intent_rate": 1})

    def test_dedup_retries_are_atomic_under_concurrency(self):
        payload = event()
        with ThreadPoolExecutor(max_workers=12) as pool:
            results = list(pool.map(self.store.record, [payload] * 24))
        self.assertEqual(sum(not result["duplicate"] for result in results), 1)
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 1)

    def test_reused_event_id_with_different_content_is_rejected(self):
        payload = event()
        self.store.record(payload)
        changed = dict(payload, variant="B")
        with self.assertRaises(EventConflict):
            self.store.record(changed)
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 1)
        self.assertEqual(self.store.report()["quality"]["conflicted_visitors"], 0)

    def test_intent_before_received_exposure_never_becomes_attributed_later(self):
        visitor = str(uuid.uuid4())
        result = self.store.record(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"))
        self.assertEqual(result["attribution_status"], "intent_without_exposure")
        self.store.record(event(visitor))
        report = self.store.report()
        self.assertEqual(report["variants"]["A"]["intent_visitors"], 0)
        self.assertEqual(report["quality"]["invalid_attribution_events"], 1)

    def test_intent_occurring_before_exposure_is_invalid_even_if_received_later(self):
        visitor = str(uuid.uuid4())
        self.store.record(event(visitor))
        result = self.store.record(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T00:59:00Z"))
        self.assertEqual(result["attribution_status"], "intent_before_exposure")
        self.assertEqual(self.store.report()["variants"]["A"]["intent_visitors"], 0)

    def test_timezone_normalization_makes_ordering_chronological(self):
        visitor = str(uuid.uuid4())
        self.store.record(event(visitor, occurred_at="2026-10-13T09:00:00+08:00"))
        self.store.record(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:00:00.000001Z"))
        self.assertEqual(self.store.report()["variants"]["A"]["intent_visitors"], 1)

    def test_conflicts_remove_visitor_from_both_final_variant_counts(self):
        visitor = str(uuid.uuid4())
        self.store.record(event(visitor))
        self.store.record(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z"))
        result = self.store.record(event(visitor, variant="B"))
        self.assertEqual(result["attribution_status"], "variant_conflict")
        self.store.record(event(visitor, event_name="contact_intent", occurred_at="2026-10-13T01:02:00Z"))
        report = self.store.report()
        self.assertEqual(report["quality"]["conflicted_visitors"], 1)
        self.assertEqual(report["quality"]["variant_conflict_events"], 1)
        self.assertEqual(report["quality"]["invalid_attribution_events"], 1)
        self.assertEqual(report["quality"]["events_excluded_due_to_visitor_conflict"], 4)
        self.assertEqual(report["variants"]["A"]["exposed_visitors"], 0)
        self.assertEqual(report["variants"]["B"]["exposed_visitors"], 0)

    def test_concurrent_competing_assignments_do_not_double_count(self):
        visitor = str(uuid.uuid4())
        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(self.store.record, [event(visitor, variant="A"), event(visitor, variant="B")]))
        report = self.store.report()
        self.assertEqual(report["quality"]["conflicted_visitors"], 1)
        self.assertEqual(sum(v["exposed_visitors"] for v in report["variants"].values()), 0)

    def test_sql_injection_text_is_parameterized(self):
        payload = event()
        payload["path"] = "/'); DROP TABLE events; --"
        self.store.record(payload)
        self.assertTrue(self.store.healthy())
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 1)

    def test_future_schema_version_requires_migration(self):
        with sqlite3.connect(self.path) as conn:
            conn.execute("PRAGMA user_version=2")
        with self.assertRaises(RuntimeError):
            EventStore(self.path)


class ValidationTests(unittest.TestCase):
    def test_unknown_fields_direct_pii_queries_and_bad_types_are_rejected(self):
        valid = event()
        variants = [dict(valid, email="private@example.test"), dict(valid, path="/?email=private@example.test"),
                    dict(valid, visitor_id="not-a-uuid"), dict(valid, occurred_at="2026-10-13"),
                    dict(valid, variant=True), dict(valid, experiment_id="unknown"), dict(valid, event_name="purchase")]
        for payload in variants:
            with self.subTest(payload_keys=list(payload)):
                with self.assertRaises(ValidationError):
                    validate_event(payload, frozenset({"/contact"}))

    def test_protected_report_has_no_empty_token_configuration(self):
        with patch.dict(os.environ, {"REPORT_ENABLED": "1"}, clear=True):
            with self.assertRaises(ValueError):
                Config.from_env()

    def test_direct_configuration_cannot_enable_an_empty_report_token(self):
        with self.assertRaises(ValueError):
            Config(Path("unused.sqlite3"), frozenset({ORIGIN}), frozenset({"/contact"}), True, "")

    def test_production_origin_allowlist_is_explicit_https_and_not_wildcard(self):
        for values in [{"APP_ENV": "production"}, {"APP_ENV": "production", "ALLOWED_ORIGINS": "*"},
                       {"APP_ENV": "production", "ALLOWED_ORIGINS": "http://example.test"}]:
            with patch.dict(os.environ, values, clear=True):
                with self.assertRaises(ValueError):
                    Config.from_env()


class HttpTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        config = Config(Path(self.folder.name) / "events.sqlite3", frozenset({ORIGIN}), frozenset({"/contact"}), True, TOKEN)
        self.store = EventStore(config.db_path)
        self.server = CollectorServer(("127.0.0.1", 0), config, self.store)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": .01})
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.folder.cleanup()

    def request(self, method, path, body=None, headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        try:
            conn.request(method, path, body=body, headers=headers or {})
            response = conn.getresponse()
            raw = response.read()
            return response.status, dict(response.getheaders()), json.loads(raw) if raw else None
        finally:
            conn.close()

    def post(self, payload, **headers):
        return self.request("POST", "/events", json.dumps(payload).encode(), {"Origin": ORIGIN, "Content-Type": "application/json", **headers})

    def test_health_is_not_an_unprotected_analytics_report(self):
        status, headers, body = self.request("GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ok"})
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(self.request("GET", "/report")[0], 401)
        self.assertEqual(self.request("GET", "/report", headers={"Authorization": "Bearer wrong"})[0], 401)
        self.assertEqual(self.request("GET", "/report", headers={"Authorization": "Bearer " + TOKEN})[0], 200)

    def test_allowed_origin_post_dedup_and_conflicting_event_id(self):
        payload = event()
        status, headers, body = self.post(payload)
        self.assertEqual(status, 201)
        self.assertEqual(headers["Access-Control-Allow-Origin"], ORIGIN)
        self.assertFalse(body["duplicate"])
        self.assertEqual(self.post(payload)[0], 200)
        self.assertEqual(self.post(dict(payload, variant="B"))[0], 409)

    def test_http_restart_preserves_dedup_and_attribution(self):
        exposure = event()
        self.assertEqual(self.post(exposure)[0], 201)
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        config = self.server.config
        self.store = EventStore(config.db_path)
        self.server = CollectorServer(("127.0.0.1", 0), config, self.store)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": .01})
        self.thread.start()
        self.assertEqual(self.post(exposure)[0], 200)
        intent = event(exposure["visitor_id"], event_name="contact_intent", occurred_at="2026-10-13T01:01:00Z")
        self.assertEqual(self.post(intent)[0], 201)
        status, _, report = self.request("GET", "/report", headers={"Authorization": "Bearer " + TOKEN})
        self.assertEqual(status, 200)
        self.assertEqual(report["quality"]["persisted_events"], 2)
        self.assertEqual(report["variants"]["A"], {"exposed_visitors": 1, "intent_visitors": 1, "intent_rate": 1})

    def test_disallowed_and_missing_origins_have_no_cors_permission(self):
        for origin in ["https://unapproved.test", None]:
            headers = {"Content-Type": "application/json"}
            if origin:
                headers["Origin"] = origin
            status, response_headers, body = self.request("POST", "/events", json.dumps(event()).encode(), headers)
            self.assertEqual(status, 403)
            self.assertNotIn("Access-Control-Allow-Origin", response_headers)
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 0)

    def test_preflight_only_allows_documented_method_and_headers(self):
        headers = {"Origin": ORIGIN, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"}
        self.assertEqual(self.request("OPTIONS", "/events", headers=headers)[0], 204)
        self.assertEqual(self.request("OPTIONS", "/events", headers={**headers, "Access-Control-Request-Headers": "authorization"})[0], 400)
        self.assertEqual(self.request("OPTIONS", "/events", headers={**headers, "Origin": "https://unapproved.test"})[0], 403)

    def test_size_content_type_invalid_json_and_duplicate_json_keys(self):
        headers = {"Origin": ORIGIN, "Content-Type": "application/json"}
        self.assertEqual(self.request("POST", "/events", b"x" * 5000, headers)[0], 413)
        self.assertEqual(self.post(event(), **{"Content-Type": "text/plain"})[0], 415)
        self.assertEqual(self.request("POST", "/events", b"not-json", headers)[0], 400)
        self.assertEqual(self.request("POST", "/events", b'{"variant":"A","variant":"B"}', headers)[0], 400)
        self.assertEqual(self.store.report()["quality"]["persisted_events"], 0)

    def test_store_errors_return_503_and_do_not_claim_acceptance(self):
        with patch.object(self.store, "record", side_effect=sqlite3.OperationalError("private detail")):
            status, _, body = self.post(event())
        self.assertEqual(status, 503)
        self.assertNotIn("private detail", json.dumps(body))
        self.assertNotIn("accepted", body)

    def test_report_can_be_disabled_and_token_cannot_be_sent_in_query(self):
        self.assertEqual(self.request("GET", "/report?token=" + TOKEN)[0], 401)
        object.__setattr__(self.server.config, "report_enabled", False)
        self.assertEqual(self.request("GET", "/report", headers={"Authorization": "Bearer " + TOKEN})[0], 404)

    def test_request_ip_headers_and_body_pii_are_not_retained(self):
        payload = event()
        self.assertEqual(self.post(payload, **{"X-Forwarded-For": "203.0.113.9"})[0], 201)
        self.assertEqual(self.post(dict(event(), email="private@example.test"))[0], 400)
        with sqlite3.connect(self.store.db_path) as conn:
            stored = str(conn.execute("SELECT * FROM events").fetchall())
            columns = [row[1] for row in conn.execute("PRAGMA table_info(events)")]
        self.assertNotIn("203.0.113.9", stored)
        self.assertNotIn("private@example.test", stored)
        self.assertNotIn("ip", columns)
        self.assertNotIn("user_agent", columns)


if __name__ == "__main__":
    unittest.main()
