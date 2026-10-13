# Actual source validation — 13–14 October 2026

This branch changes the existing ArcSage website. Its six public routes build to readable HTML and hydrate the same React components. It does not create a separate public website for AI.

| Check | Result | What it establishes |
| --- | --- | --- |
| Browser assignment, event journal and transport | 15 tests passed | Stable allocation, concurrent tab retention, exact-ID retries, acknowledged delivery and initialization order |
| Offline statistical analysis | 11 tests passed | Empty/insufficient reports cannot become an inferred winner; intervals, allocation and quality gates |
| SQLite collector | 24 tests passed | Validation, durable process restart, deduplication, attribution and protected report |
| Built route checks | 102 checks passed | Static readable bodies, metadata, sitemap, assets and honest contact action |
| Isolated Chrome integration | 30 checks passed | Both CTA labels, repeat assignment, real event transport, collector restart, startup retry on another route, desktop/mobile Home, About and service pages and no hydration errors |

The browser report contains two intentionally created QA browser IDs. A was clicked; B was not. These are instrumentation checks, not customer A/B results. The mailto default action was intercepted; no email was sent. No production traffic, citation uplift, lead uplift or commercial winner has been measured.

Independent source review found shared-queue overwrites across tabs, acceptance of any HTTP 200, missing retry at reload, and an empty-drain timing edge introduced during repair. All four were repaired and the reviewer independently reran the 15 experiment tests. Tests include the reproduced failure cases. A per-event journal retains existing events at capacity but does not guarantee complete collection through storage blocking, long outages or browser deletion.

The feature defaults off. Public activation needs a durable HTTPS collector, explicit origins and a separate QA database, the locked plan and adequate traffic. The provided SQLite collector requires a persistent local filesystem; a shared transactional backend is needed for an autoscaling ephemeral host. Pushing this review branch does not deploy the public site; the existing workflow deploys when changes reach `main`.

Research, decisions, raw QA report and push receipts are maintained in the [GEO project](https://github.com/winstonpgao/GEO/tree/main/projects/arcsage). Desktop/mobile screenshots in this directory show the actual application build.

## Follow-up: approved source representation and cloud backend

Home/About replace unsupported customer-volume, timing, production and blanket residency/compliance assertions with workflow scope and evaluation criteria. The original classes/assets/team identity and EN/ZH positioning remain. Separate copy review passed 15 static-markup checks and 14 desktop/mobile layout checks; final actual build passed 102 static checks and 30 browser integration checks. Root inspected the resulting screenshots before delivery. The enabled localhost-only QA build was then replaced by the default-disabled build.

The optional Firestore backend and its limits are recorded in [FIRESTORE_TEST_RESULTS](../../experiments/collector/FIRESTORE_TEST_RESULTS.md). Independent review reproduced two fail-closed gaps (marker/snapshot validation and impossible counters); repairs and affected regression verification are included in the final evidence. Local emulator results do not certify managed-cloud deployment.

A separate preregistered GEO study in winstonpgao/GEO found controlled parser facts 4/6→6/6 and local BM25 hit@3 3/5→5/5. Ten supplied-source Codex answers had no mention/citation increase: 5/5 in both arms. Neither those data nor the visitor fixture report prove public AI visibility uplift.
