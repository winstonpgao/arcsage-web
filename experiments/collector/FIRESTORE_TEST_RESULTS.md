# Firestore backend verification and remaining gates

Baseline verified at 2026-10-14T00:07:49+08:00; focused review repairs verified at 2026-10-14T00:23:43+08:00 (Asia/Shanghai). No cloud project records, production telemetry, deployments, commits, or pushes were created.

## Scope and artifacts

- `firestore_store.py`: lazy SDK loading, explicit target, transactional event/visitor/counter state, atomic two-document report snapshot with strict initialization marker validation, bounded namespace-wide local write gate.
- `collector.py`: explicit `STORAGE_BACKEND=sqlite` default or `firestore`; missing project/prefix fails startup; cloud storage errors return 503, ID-content mismatch409, no fallback.
- `requirements.txt`: official `google-cloud-firestore==2.34.1`.
- `Dockerfile`: installs SDK and copies both backend modules. Image build remains unverified.
- `test_firestore_store.py`: state/config checks and guarded real-emulator parity/concurrency/restart tests. Existing `test_collector.py` was not modified.

## Earlier baseline results

Command:

```sh
FIRESTORE_EMULATOR_HOST=127.0.0.1:8789 \
  /private/tmp/geo-firestore-runtime-20261013/venv/bin/python \
  -m unittest -v test_collector test_firestore_store
```

**40 tests run: 39 passed, one opt-in process-restart test skipped in that run.** Breakdown: existing 24 SQLite tests, 5 state/config checks, 10 real Firestore-emulator tests. Following explicit export, emulator process shutdown, import, and a new process launch, the opt-in process-restart test **passed separately**:

```sh
FIRESTORE_EMULATOR_HOST=127.0.0.1:8789 \
FIRESTORE_RESTART_FIXTURE_PATH=/private/tmp/geo-firestore-runtime-20261013/restart_case.json \
  /private/tmp/geo-firestore-runtime-20261013/venv/bin/python \
  -m unittest -v test_firestore_store.FirestoreProcessRestartTests
```

| Check | Observed result |
|---|---|
| Empty Firestore namespace | Zero counts, null rates; marker/aggregate still absent; no seed documents |
| Parity | Firestore and SQLite reports/statuses match after each event across exposure, pre-exposure intent, earlier timestamp, repeated clicks, conflicts, and retries |
| ID behavior | Exact normalized ID retry returns duplicate; same ID/different hash rejects without another stored event |
| Same-process concurrency |16 duplicate attempts / 8 workers persist one event; competing variant assignment excludes visitor;24 independent events / 4 writers plus report reader preserve consistent denominators/status totals |
| Multiple client objects | Two clients in the same process share namespace gate and correct aggregate counts |
| Report/HTTP behavior | Auth enforced; duplicate200/new201/hash409; cloud-storage failure503 without acceptance; no SQLite file appears |
| Partial deletion/corruption | Missing initialized aggregate or inconsistent counter state fails closed, rather than resetting metrics |
| Real emulator process restart | Export contained3 canary events; imported report matched exactly; duplicate retry remained duplicate; subsequent B intent attributed, yielding 4 events and one intent visitor per variant |

Tests use only loopback and project `demo-geo-arcsage-lab` with generated `lab_*` prefixes. Their synthetic records are local fixtures, not business outcomes or GEO measurements.

## Focused review repair results

Independent review identified two material gaps in the earlier baseline: reports accepted invalid/missing initialization markers when an aggregate existed, and counter validation accepted a live exposure despite zero exposure events. Both are repaired. Reports/health now read marker and aggregate in the same read-only transaction; writes and duplicate acknowledgements validate the pair too. The marker requires exact schema/experiment identity. A present marker with an empty aggregate is also rejected because initialization happens atomically with the first actual event.

Counter checks enforce necessary event/unique relationships: live exposures plus conflicted visitors cannot exceed exposure-event count; live intents cannot exceed attributed-intent events; first-conflict status count equals conflicted visitors; each conflict requires its prior exposure and conflicting event in exclusions; later conflicted events are excluded; remaining live outcomes require non-excluded events. These inequalities preserve repeated-event and withdrawn-outcome histories. They detect impossible state, not a full historical integrity audit.

**15 focused tests passed: seven state/config checks and eight real-emulator tests.** No stress suite or process-restart cycle was repeated after this focused repair; earlier restart and stress results above remain historical evidence. The source now contains six additional regression tests compared with that earlier 40-test baseline; a new full 46-test-suite pass is not claimed.

```sh
FIRESTORE_EMULATOR_HOST=127.0.0.1:8789 GOOGLE_CLOUD_PROJECT=demo-geo-arcsage-lab \
  /private/tmp/geo-firestore-runtime-20261013/venv/bin/python -B -m unittest -v \
  test_firestore_store.FirestoreUnitTests \
  test_firestore_store.FirestoreIntegrationTests.test_empty_backend_does_not_seed_documents_or_metrics \
  test_firestore_store.FirestoreIntegrationTests.test_attribution_cases_match_sqlite_after_every_event \
  test_firestore_store.FirestoreIntegrationTests.test_missing_initialized_aggregate_fails_closed \
  test_firestore_store.FirestoreIntegrationTests.test_marker_corruption_blocks_reports_health_new_writes_and_retries \
  test_firestore_store.FirestoreIntegrationTests.test_phantom_exposure_in_real_aggregate_fails_closed \
  test_firestore_store.FirestoreIntegrationTests.test_initialized_aggregate_reset_to_empty_fails_closed \
  test_firestore_store.FirestoreIntegrationTests.test_report_marker_and_aggregate_share_readonly_snapshot \
  test_firestore_store.FirestoreIntegrationTests.test_http_dedup_409_auth_and_no_sqlite_fallback
```

The real-emulator snapshot test mutates the marker after the aggregate read and before the marker read: the in-flight report returns the prior valid snapshot, while the next report rejects the current corrupted marker. Marker deletion, missing fields, future/bool schema, and wrong experiment identity fail report, health, new writes, and exact retries without changing the aggregate. Phantom exposure and a reset-to-zero initialized aggregate also fail closed. Fresh namespaces still report zero/null without creating documents.

An independent pure enumerator checked **780 valid event histories** up to four events against SQLite; statuses and unique-counter deltas matched before and after repair. Its rerun used no SDK/network/model calls. One initial focused command used a nonexistent pure-test class selector (`FirestorePureTests`), resulting in a test-loader error while all seven selected emulator tests passed; the corrected complete focused run above passed all 15 tests.

The independent reviewer separately reran the current seven pure/config tests and two real-emulator regressions (snapshot interleaving and initialized-zero rejection); all nine passed. The review found no residual of the original two defects. These runs are recorded separately from the implementer's focused 15-test run.

Current document reads per transaction attempt: new event four; identical-ID retry three; report/health two. The additional marker read on every report is intentional. These counts do not estimate billing or certify managed-service latency.

## Stress observations and design limits

Earlier runs without local namespace serialization exposed transaction-lock contention around the single aggregate: 4 concurrent independent writers and separate backend gates could exhaust transaction retries or the 10-second local queue wait. The service returned storage-unavailable failures, rather than false accepted events. Stable read-lock ordering alone did not certify cross-process capacity.

The final supported scope uses a namespace-wide in-process gate. It does **not** serialize separate processes/replicas. Therefore cap the initial cloud pilot at **one collector instance** and retain original event IDs when retrying. Multi-replica/high-throughput availability remains unverified; managed-service load/retry/recovery testing or a sharded counter design is required before expansion. Firestore transactions protect atomic state, but this test evidence does not establish production latency or capacity. SDK read timeouts and retry attempts do not create a hard total request deadline.

An attempted JAR `--export-on-exit` invocation did not create an export. Restart verification therefore used the supported explicit emulator export request from the official Firebase CLI source, after creating the required export directory, and then `--seed_from_export` against the produced metadata. Automatic emulator exit-export is not certified.

## Temporary runtime provenance

All runtime downloads/installations were limited to `/private/tmp/geo-firestore-runtime-20261013`; none were global installations.

- Firestore emulator 1.22.0, official Firebase download. SHA256 `9b6498b7f62714d67f48f59b3818883cd682dbcd46b9f59511de81c97bb5166c` verified against the official CLI manifest.
- Portable Temurin Java 21.0.12.1 JRE, macOS aarch64. SHA256 `dec50fc6f9fcd4fe3ae8cabf5a5fa68f6afc48841f7698e468e9aa5d54beed84` verified against the official Adoptium API metadata.
- Python 3.12 temporary virtual environment; SDK 2.34.1 installed from PyPI. SQLite still works without that environment or SDK.

[Official SDK API](https://docs.cloud.google.com/python/docs/reference/firestore/latest/google.cloud.firestore_v1.transaction.Transaction), [transaction behavior](https://cloud.google.com/firestore/docs/manage-data/transactions), [emulator connection](https://firebase.google.com/docs/emulator-suite/connect_firestore), [Firebase emulator manifest](https://github.com/firebase/firebase-tools/blob/master/src/emulator/downloadableEmulatorInfo.json), [Firebase export implementation](https://github.com/firebase/firebase-tools/blob/master/src/emulator/hubExport.ts).

## Cloud gates remaining

1. Explicit approved test project, native Firestore database/region, dedicated prefix, and attached service identity/IAM must be verified.
2. Docker image build and dependency/image scan remain unverified.
3. Cloud Run must explicitly select Firestore, exclude emulator settings, protect reports, and start with a one-instance pilot cap. Default SQLite remains unsuitable on ephemeral container storage.
4. Managed-service read/write, process replacement, retry after uncertain acknowledgement, contention, and authorized backup/restore must be verified without mixing test fixtures with real telemetry.
5. Request abuse/rate limits, retention of complete experiment state, and privacy governance remain deployment responsibilities. A namespace prefix is not IAM isolation.

This work supplies a tested local-emulator foundation. It does not certify a cloud release or prove that CTA wording changes AI visibility.
