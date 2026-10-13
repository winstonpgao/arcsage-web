# Actual source validation — 13 October 2026

This branch changes the existing ArcSage website. Its six public routes build to readable HTML and hydrate the same React components. It does not create a separate public website for AI.

| Check | Result | What it establishes |
| --- | --- | --- |
| Browser assignment, event journal and transport | 15 tests passed | Stable allocation, concurrent tab retention, exact-ID retries, acknowledged delivery and initialization order |
| Offline statistical analysis | 11 tests passed | Empty/insufficient reports cannot become an inferred winner; intervals, allocation and quality gates |
| SQLite collector | 24 tests passed | Validation, durable process restart, deduplication, attribution and protected report |
| Built route checks | 102 checks passed | Static readable bodies, metadata, sitemap, assets and honest contact action |
| Isolated Chrome integration | 26 checks passed | Both CTA labels, repeat assignment, real event transport, collector restart, startup retry on another route, desktop/mobile pages and no hydration errors |

The browser report contains two intentionally created QA browser IDs. A was clicked; B was not. These are instrumentation checks, not customer A/B results. The mailto default action was intercepted; no email was sent. No production traffic, citation uplift, lead uplift or commercial winner has been measured.

Independent source review found shared-queue overwrites across tabs, acceptance of any HTTP 200, missing retry at reload, and an empty-drain timing edge introduced during repair. All four were repaired and the reviewer independently reran the 15 experiment tests. Tests include the reproduced failure cases. A per-event journal retains existing events at capacity but does not guarantee complete collection through storage blocking, long outages or browser deletion.

The feature defaults off. Public activation needs a durable HTTPS collector, explicit origins and a separate QA database, the locked plan and adequate traffic. The provided SQLite collector requires a persistent local filesystem; a shared transactional backend is needed for an autoscaling ephemeral host. Pushing this review branch does not deploy the public site; the existing workflow deploys when changes reach `main`.

Research, decisions, raw QA report and push receipts are maintained in the [GEO project](https://github.com/winstonpgao/GEO/tree/main/projects/arcsage). Desktop/mobile screenshots in this directory show the actual application build.
