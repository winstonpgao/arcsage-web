# Collector verification

Verified at 2026-10-13T19:57:16+08:00 (Asia/Shanghai).

`python3 -m unittest -v`: **24 tests passed**. HTTP tests used temporary loopback listeners; a sandbox escalation was required because sandboxed execution could not bind a local socket. No external network requests were made.

| Boundary | Observed test result |
|---|---|
| Empty real store | A/B visitors 0, intent counts 0, rates null, no significance |
| HTTP server restart | Exposure persisted; same event ID returned duplicate 200 after stop/start; later intent attributed; persisted events remained 2 |
| SQLite reopen | Repeated exposures/intents persisted but report counted one exposed visitor and one intent visitor |
| Concurrent identical retries | 24 attempts from 12 workers produced exactly one stored event |
| Concurrent A/B conflict | Same visitor with competing variants became conflicted and was counted in neither final variant |
| Attribution order | Unexposed intents and occurrence-before-exposure intents remained invalid |
| Report access | Disabled report 404; missing/wrong token 401; valid bearer 200; URL token rejected |
| Browser access | Allowed-origin POST/preflight accepted; missing/unapproved origin rejected; unsupported preflight headers rejected |
| Input/storage boundary | Size/type/JSON-key validation passed; parameterized SQL intact; storage error returned 503 without claiming acceptance |
| Direct contact/IP data | Extra email payload rejected; forwarded IP absent from persisted records |

The tests' fabricated events existed only in temporary test databases. No production database was created or seeded. Docker build/run, durable-volume provisioning, backup/restore operation, reverse-proxy TLS/rate limits, and cloud deployment were not performed. Cloud Run durability is explicitly unsupported by the current local SQLite backend.
