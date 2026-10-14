# Durable A/B telemetry collector

This Python service persists actual browser-supplied experiment events in an explicitly selected backend: local SQLite (default, standard library only) or Firestore (official pinned SDK). It has no seeded metrics or model calls. Backend development/tests used only the local emulator; no cloud records were created. Python 3.12 is the Docker runtime. The browser owns stable assignment and ordered transport.

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

For `STORAGE_BACKEND=sqlite`, each operation opens its own SQLite connection. Writes use `BEGIN IMMEDIATE`, parameterized SQL, WAL mode, `synchronous=FULL`, a 10-second busy timeout, and atomic deduplication/assignment/event insertion. Threads are bounded (32 by default), sockets have timeouts, and SQLite contention returns 503 rather than a false acceptance. SIGINT/SIGTERM request orderly server shutdown; already-running request threads are joined. Event schema versions newer than 1 fail startup until a migration is supplied.

For SQLite, use **one collector instance with a durable local filesystem** that supports SQLite locking/WAL correctly. Do not point this at a shared SMB/NFS filesystem or object-store FUSE mount and assume equivalent correctness. Do not run independently stored replicas and combine their reports as if assignment/deduplication were shared.

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

**Cloud Run must explicitly select Firestore; the default SQLite backend remains unsuitable there.** Its ordinary container filesystem is ephemeral, and separate instances would have separate SQLite databases. A mounted object-store filesystem is not a verified SQLite WAL solution. Firestore code and emulator parity tests are now implemented, but a cloud release still requires real service-identity/IAM, region/database selection, deployment configuration, failure/restore checks, and an approved test-traffic plan. No cloud durability or deployment has been verified in this task. For the SQLite implementation, use a VM/container with suitable persistent local disk.

Back up an active store with SQLite's backup API, rather than copying only its main file while WAL writes may be active. Verify a restore into a separate path, then restart using that path and check event counts/deduplication. Restrict database and backups to the service/operator. Startup uses umask 077 for newly created application files; deployment-mounted directory permissions still need to be correct. Choose retention and deletion rules for pseudonymous visitor identifiers in the lab's privacy policy.

## Data retained and data omitted

Persisted event columns are exactly: event UUID, experiment ID, variant, pseudonymous visitor UUID, event name, normalized client occurrence timestamp, server receipt timestamp, approved static route, normalized-content hash, and attribution status. The visitor table stores experiment/visitor UUID, variant, first exposure time/event ID, and conflict flag.

No direct contact data, names, email, phone, IP, forwarded IP, user-agent, referrer, cookies, authentication token, or request headers are stored. Unknown body fields are rejected. Application request/error logs are suppressed so the stdlib server does not log remote addresses or request lines. Infrastructure proxies/platforms may log request metadata independently; configure them separately. UUIDs are pseudonymous identifiers, and this service makes no claim that they are legally anonymous or outside privacy requirements.

## Verification

```sh
python3 -m unittest -v
```

Tests use temporary databases and temporary loopback HTTP servers; their fabricated events are never inserted into a real experiment store. Coverage includes restart/reopen persistence, retry deduplication, concurrent writes/competing assignments, exposure-before-intent ordering, timezone ordering, visitor conflicts, parameterized SQL, empty report semantics, CORS/preflight, payload limits/types, protected reports, storage failure responses, and omission of direct contact/IP data.


## Explicit Firestore backend

Install `requirements.txt` in a dedicated environment if running outside Docker. SQLite operation does not import or require the SDK. The Dockerfile installs the pinned official SDK and copies both backend modules, but the image was not built here.

```sh
export STORAGE_BACKEND='firestore'
export GOOGLE_CLOUD_PROJECT='<explicit-approved-test-project-id>'
export FIRESTORE_COLLECTION_PREFIX='arcsage_cta_v1_test'
export FIRESTORE_DATABASE='(default)'
# Configure ALLOWED_ORIGINS, ALLOWED_PATHS, and protected-report settings separately.
python3 collector.py
```

The project and collection prefix are required; no target is inferred from ambient gcloud configuration. The prefix must be dedicated to this experiment/test, with 3–64 lowercase letters/digits/underscore/hyphen. Firestore paths are:

```text
<prefix>_experiments/arcsage-contact-cta-v1
  events/<event-UUID>
  visitors/<visitor-UUID>
  statistics/current
```

The root document is an initialization/schema marker. The first actual event creates it and its aggregate in the same transaction. Starting the backend, health checks, and empty reports do not seed documents. SDK absence, missing credentials, denied access, timeout, corrupt/missing initialized aggregate, or exhausted retries fail explicitly; none switch to local SQLite or fabricate a zero report for a known initialized experiment.

A new-event transaction point-reads the event ID, aggregate, marker, and visitor, then creates the event and updates visitor/aggregate atomically. Identical-ID retries validate namespace state before returning the original persisted status; different-content reuse returns 409. A visitor carries its earlier event count and whether it has an attributed intent, so its first variant conflict withdraws earlier A/B exposure/intent counts and includes its earlier events in the exclusion count. Reports and health checks always read the aggregate and marker together in a read-only transaction. The marker requires integer schema version 1 and the exact experiment identity. Only both documents absent means a fresh experiment; a missing document, invalid marker, or initialized aggregate with zero events fails closed. No event/report scans the database or event collection.

The point-read budget per transaction attempt is four documents for a new event, three for an identical-ID retry, and two for a report or health check. These are application read counts, not a billing estimate: Firestore retries, writes, and transaction behavior can add work. Aggregate validation also checks necessary relationships between live unique visitors, raw status counts, conflicts, excluded events, and persisted events. Repeated events can increase raw status counts without increasing unique visitors; withdrawn outcomes remain in those status counts. These checks detect impossible counters but do not independently audit every stored event or protect against coherent edits/deletion of the complete namespace.

The transaction callback only transforms the state read in that attempt. It has no mutable global counters and can safely rerun when Firestore retries. [Official transaction behavior](https://cloud.google.com/firestore/docs/manage-data/transactions), [Python transaction API](https://docs.cloud.google.com/python/docs/reference/firestore/latest/google.cloud.firestore_v1.transaction.Transaction).

A bounded namespace-wide local write lock serializes this small pilot's writers within one process, including multiple SDK/backend objects targeting the same project/database/prefix. Firestore transactions protect atomicity across independent processes, but multi-replica throughput is not certified. Cap the initial pilot at one collector instance until managed-service load/retry/recovery checks or a sharded-counter design are validated. The single aggregate is an intentional contention limit, not a high-throughput architecture; startup locks and concurrent writer pressure can cause 503, and clients must retain IDs on retry. Read RPCs use 10-second timeouts; write transaction attempts are limited to 10, while report transactions have one read-only attempt and fail with 503 on storage errors. SDK transaction commit/retry behavior also applies. This is not a hard 10-second total request deadline. Plan a small, bounded pilot and verify actual traffic/latency before raising instance/concurrency limits. [Official contention guidance](https://cloud.google.com/firestore/docs/transaction-data-contention).

For cloud deployment, use an attached service identity with approved Firestore permissions and the intended database's configured region. Do not embed service-account key files in images. Collection naming is an application namespace, not an IAM isolation boundary. Server SDK access is controlled by IAM and does not make browser Security Rules a substitute for service identity. Do not independently TTL/delete event, visitor, marker, or aggregate documents: deleting dedup records can permit replay, and partial deletion breaks the counters. Retention/export/restore must preserve or deliberately retire the complete experiment state under an approved policy.

## Firestore emulator verification

The official emulator, portable Java, and SDK were prepared in temporary storage, with checksum verification of downloaded runtime files. Tests refuse a non-loopback emulator and always use `demo-geo-arcsage-lab` with isolated generated prefixes. They never use the approved cloud test project.

```sh
export FIRESTORE_EMULATOR_HOST='127.0.0.1:8789'
python3 -m unittest -v test_collector test_firestore_store
```

The SDK honors the emulator environment variable; do not include a URL scheme. Production mode rejects that variable so a local emulator cannot silently replace the intended durable backend. [Official emulator setup](https://firebase.google.com/docs/emulator-suite/connect_firestore).

Without an emulator, integration tests explicitly skip; mocked/state-only checks are not backend certification. The optional actual-process-restart test uses `FIRESTORE_RESTART_FIXTURE_PATH` after exporting, stopping, and importing an emulator. Its synthetic fixture belongs only in temporary emulator evidence, never production telemetry. See `FIRESTORE_TEST_RESULTS.md` for verified outcomes and remaining gates. Emulator behavior does not certify production IAM, managed-service contention/latency, backup, or recovery.
