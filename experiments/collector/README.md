# Durable A/B telemetry collector

This standard-library Python service persists actual browser-supplied experiment events in SQLite. It has no seeded metrics, model calls, cloud calls, or third-party Python dependencies. Python 3.12 is the Docker runtime. The browser owns stable assignment and ordered transport.

The experiment is `arcsage-contact-cta-v1` on `/contact`. Variant A is **“Email us”**; variant B is **“Discuss lead qualification.”** Factual copy is identical. Server rendering starts at A, then the browser restores or chooses its persistent assignment after hydration. Emit exposure only after the assigned CTA is actually presented, rather than counting the initial server-rendered A for every visitor.

## Local run

From this directory, with the web app served at `http://127.0.0.1:8000`:

```sh
export ALLOWED_ORIGINS='http://127.0.0.1:8000'
export ALLOWED_PATHS='/contact'
export DB_PATH="$PWD/data/telemetry.sqlite3"
export BIND_HOST='127.0.0.1'
export PORT='8767'
python3 collector.py
```

`REPORT_ENABLED` defaults to `0`; `/report` then returns 404. Enable administrative reports only with a secret token:

```sh
export REPORT_ENABLED='1'
export REPORT_TOKEN="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
python3 collector.py
```

Keep the token in the operator's environment or deployment secret store. Do not put it in browser code, public runtime configuration, a URL, the Git repository, or application logs.

```sh
curl --fail --silent http://127.0.0.1:8767/health
curl --fail --silent \
  -H "Authorization: Bearer $REPORT_TOKEN" \
  http://127.0.0.1:8767/report
```

These are operator commands; they do not insert events. A fresh store reports zero visitors/events and `intent_rate: null` for both variants. There are no sample events in a production database.

## HTTP contract

`POST /events` requires an exact allowed `Origin`, `Content-Type: application/json`, and one `Content-Length`. Maximum body size defaults to 4,096 bytes. Transfer encoding, unknown fields, duplicate JSON keys, malformed IDs/timestamps, unapproved paths, and wrong field types are rejected.

```json
{
  "experiment_id": "arcsage-contact-cta-v1",
  "variant": "A",
  "visitor_id": "a canonical nonzero UUID supplied by the browser",
  "event_id": "a new canonical nonzero UUID for this event",
  "event_name": "exposure",
  "occurred_at": "2026-10-13T10:00:00.000Z",
  "path": "/contact"
}
```

The descriptive strings shown for UUID fields are schema descriptions, not valid example IDs. Every field must be a string. `variant` is `A` or `B`; `event_name` is `exposure` or `contact_intent`; timestamps require a timezone and normalize to UTC. Routes are static allowlisted values: queries, fragments, email addresses, contact content, and dynamic visitor routes must not be sent as paths.

Successful insert returns 201 and `{accepted:true,duplicate:false,attribution_status:...}`. Retrying identical normalized content with the same `event_id` returns 200 and `duplicate:true`, without another stored event. Reusing the ID with different normalized content returns 409. Accepted persistence does not imply valid experimental attribution; inspect `attribution_status`.

`OPTIONS /events` permits only an allowed origin, POST, and Content-Type. Origin matching is exact, including scheme and non-default port; no wildcard or credentials-based CORS is emitted. Missing or duplicated Origin headers are rejected for event writes.

`GET /health` reports storage-schema availability, without exposing counts, visitor IDs, paths, or secret settings. It does not certify filesystem durability or every possible write operation.

`GET /report` requires `REPORT_ENABLED=1` and `Authorization: Bearer <REPORT_TOKEN>`. The token is compared with `hmac.compare_digest`; query-string tokens are not accepted. Reports return `Cache-Control: no-store`. Browser-based administrative reporting is not implemented: report preflight/Authorization CORS is deliberately absent. Use an operator or authorized server-side request.

## Attribution and report definitions

- A visitor's first accepted exposure assigns its variant in this experiment. Additional same-variant exposures are persisted but do not increase the unique exposed-visitor count.
- A contact-intent event needs an exposure already persisted for that visitor and variant, and its `occurred_at` must be at or after that exposure. An intent arriving before exposure stays invalid even if an exposure arrives later. A timestamp before the recorded exposure is also invalid.
- The browser transport must **wait for exposure acknowledgment, then send intent**, retaining original event IDs on retries. The collector cannot correct a client clock or validate that the browser really displayed the CTA.
- A different variant for an already exposed visitor marks the visitor conflicted. That visitor is excluded from both variants' final exposure and intent counts, including earlier events; conflict counts remain visible. Never repair an A/B conflict by silently reassigning the visitor.
- Unique intent visitors are unique valid exposed visitors with at least one attributed intent. Repeated clicks do not increase this numerator. `intent_rate = intent_visitors / exposed_visitors`; an empty denominator yields null.
- Contact intent is a button/link action supplied by the browser. It is not a completed enquiry, qualified lead, or sale.

Report fields:

```text
experiment_id
variants.A/B.exposed_visitors
variants.A/B.intent_visitors
variants.A/B.intent_rate
quality.persisted_events
quality.variant_conflict_events
quality.conflicted_visitors
quality.events_excluded_due_to_visitor_conflict
quality.invalid_attribution_events
quality.attribution_status_counts
statistical_inference.status = "not_planned"
```

`variant_conflict_events` and `invalid_attribution_events` are separate, disjoint event-status counts. Invalid attribution includes `intent_without_exposure`, `intent_before_exposure`, and later `conflicted_visitor` events. `events_excluded_due_to_visitor_conflict` counts all events attached to a now-conflicted visitor and therefore overlaps status counts; do not add these fields together. An unchanged retry does not add an event. An event-ID content conflict is an HTTP rejection and is not counted as a stored event.

Reports use a single SQLite read transaction for a consistent snapshot. No sample size, stopping rule, significance threshold, p-value, confidence interval, or “winning variant” is invented. Plan those before interpreting a difference.

## Storage, concurrency, and deployment

Each operation opens its own SQLite connection. Writes use `BEGIN IMMEDIATE`, parameterized SQL, WAL mode, `synchronous=FULL`, a 10-second busy timeout, and atomic deduplication/assignment/event insertion. Threads are bounded (32 by default), sockets have timeouts, and SQLite contention returns 503 rather than a false acceptance. SIGINT/SIGTERM request orderly server shutdown; already-running request threads are joined. Event schema versions newer than 1 fail startup until a migration is supplied.

Use **one collector instance with a durable local filesystem** that supports SQLite locking/WAL correctly. Do not point this at a shared SMB/NFS filesystem or object-store FUSE mount and assume equivalent correctness. Do not run independently stored replicas and combine their reports as if assignment/deduplication were shared.

Docker build/run instructions are supplied; this task did not build or deploy the image:

```sh
docker build -t arcsage-ab-collector .
docker volume create arcsage-ab-data
docker run --rm -p 127.0.0.1:8767:8080 \
  --mount source=arcsage-ab-data,target=/data \
  -e ALLOWED_ORIGINS='http://127.0.0.1:8000' \
  -e ALLOWED_PATHS='/contact' \
  arcsage-ab-collector
```

The image runs as UID/GID 10001. A bind-mounted directory must allow that UID to write; a named volume initialized from the image preserves `/data` ownership. Use an explicitly managed volume and retain it across container replacement. The Docker volume and its backup are the persistence boundary, not the container image. The Docker default reports remain disabled.

For an internet-facing VM/container deployment, put TLS and request/rate limits in a maintained reverse proxy. Set `APP_ENV=production` and an explicit HTTPS `ALLOWED_ORIGINS` list. If reports are enabled, configure the secret token through the deployment environment/secret store. Source-origin restrictions reduce unintended browser access; **they are not caller authentication**. A direct client can spoof Origin and fabricate valid-looking events. Production abuse controls and bot/automation review must be handled at the boundary; this service cannot establish real-human traffic.

**Cloud Run is not ready with this SQLite backend.** Its ordinary container filesystem is ephemeral, and separate instances would have separate databases. A mounted object-store filesystem is not a verified SQLite WAL solution. Select and implement a durable shared transactional backend, such as a suitable managed database, and test assignment/deduplication/report transactions there before a Cloud Run release. The current code does not implement that backend or claim cloud durability. Use a VM/container with a suitable persistent local disk for the current SQLite implementation.

Back up an active store with SQLite's backup API, rather than copying only its main file while WAL writes may be active. Verify a restore into a separate path, then restart using that path and check event counts/deduplication. Restrict database and backups to the service/operator. Startup uses umask 077 for newly created application files; deployment-mounted directory permissions still need to be correct. Choose retention and deletion rules for pseudonymous visitor identifiers in the lab's privacy policy.

## Data retained and data omitted

Persisted event columns are exactly: event UUID, experiment ID, variant, pseudonymous visitor UUID, event name, normalized client occurrence timestamp, server receipt timestamp, approved static route, normalized-content hash, and attribution status. The visitor table stores experiment/visitor UUID, variant, first exposure time/event ID, and conflict flag.

No direct contact data, names, email, phone, IP, forwarded IP, user-agent, referrer, cookies, authentication token, or request headers are stored. Unknown body fields are rejected. Application request/error logs are suppressed so the stdlib server does not log remote addresses or request lines. Infrastructure proxies/platforms may log request metadata independently; configure them separately. UUIDs are pseudonymous identifiers, and this service makes no claim that they are legally anonymous or outside privacy requirements.

## Verification

```sh
python3 -m unittest -v
```

Tests use temporary databases and temporary loopback HTTP servers; their fabricated events are never inserted into a real experiment store. Coverage includes restart/reopen persistence, retry deduplication, concurrent writes/competing assignments, exposure-before-intent ordering, timezone ordering, visitor conflicts, parameterized SQL, empty report semantics, CORS/preflight, payload limits/types, protected reports, storage failure responses, and omission of direct contact/IP data.
