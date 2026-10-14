# ArcSage visitor experiment and analysis

The primary contact experiment varies CTA wording only. It tests whether the button generates contact intent among randomly assigned browser visitors; it does not test whether AI search finds ArcSage.

## Local end to end run

Terminal one, from the repo root:

```sh
ALLOWED_ORIGINS=http://127.0.0.1:8000 ALLOWED_PATHS=/contact \
DB_PATH=/private/tmp/arcsage-local-events.sqlite3 PORT=8767 \
python3 experiments/collector/collector.py
```

Terminal two:

```sh
VITE_AB_ENABLED=true \
VITE_EXPERIMENT_ENDPOINT=http://127.0.0.1:8767/events npm run build
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8000/contact/`. The first eligible browser receives A or B and repeats retain that assignment. An inactive/misconfigured endpoint cannot silently be presented as a measured experiment. No supplied query string forces a variant for public visitors. Operator QA uses isolated browser storage and a separate test database.

An email click indicates intent, not mailbox delivery. The page says it opens an email application; no fake success state remains. Other published email links are not this primary CTA and do not count as its numerator.

Each queued event has its own local storage key, so concurrent tabs cannot replace a shared array. Reloading any route retries saved events. Only the collector's JSON acceptance acknowledgment removes an event; HTML fallbacks and health responses are retained for retry. The journal admits at most 50 pending events per controller; at capacity it retains older events and stops admitting new ones. Storage blocking or quota failures, long outages, browser deletion and closing a tab with only memory storage can still lose measurements. Collection quality checks cannot detect every missing event.

For repeatable isolated browser QA, stop other servers using ports 8000 and 8767, build with the local enabled settings above, then run:

```sh
QA_OUTPUT=/private/tmp/arcsage-source-qa node scripts/check-browser.mjs
```

The script requires Node 22+, Python 3 and an installed Chrome. On platforms with another Chrome location, set `CHROME_PATH` to its executable. It owns and stops its local server, collector and disposable browser; its report token remains in memory. It checks desktop/mobile pages, both variants, collector restart and retry after reloading another route. The test intercepts mailto navigation and sends no email. Output is QA evidence, not customer outcomes. Restore `npm run build` without enabled overrides before shipping the default-off build.

## Read the report

Reports are disabled until configured with a secret. Follow [collector instructions](collector/README.md) to enable and export an authenticated JSON report. Keep that token out of browser variables and URLs. Analyze the saved operator report:

```sh
python3 experiments/analyze_report.py /path/to/saved-report.json
```

Only after the predeclared calendar window actually finishes:

```sh
python3 experiments/analyze_report.py /path/to/saved-report.json --window-completed
```

The analyzer reports unique counts, Wilson intervals, a difference interval and allocation checks. It withholds the planned p-value when the sample/window/quality checks fail. Missing quality is unknown. It never calls an empty report 0% conversion, nor a two-visitor smoke test a winner.

The plan assumes 2% baseline contact intent and a 1 percentage-point effect solely for sizing. Those are not measured ArcSage values. It sets a conservative starter target of 4,000 exposed browser IDs per variant and at least two full weeks. Low traffic may make this test impractical; use an instrumentation pilot and revisit the next locked version rather than fabricate certainty or repeatedly stop at a favorable p-value.

Statistical calculations assume valid independently assigned browser units and complete measurement. A browser identifier is not a unique person; bots, shared browsers, assignment deletion, endpoint abuse, collection loss and repeated outcome peeking require review. Source-origin restrictions alone do not authenticate events. The collector report exposes attribution/conflict problems but does not prove human traffic.

## Production activation

Host one collector with a suitable durable local disk and HTTPS, or implement/test a shared transactional cloud backend before using an autoscaling ephemeral host. Configure the exact permitted website origin, report secret, proxy abuse controls, retention and backups. Validate a delivered event and report export, then build with the actual HTTPS endpoint and enable the feature. Keep internal smoke tests out of that database.

Default builds serve control and send no experiment events. `VITE_AB_ENABLED=false` is the kill switch for new collection. Preserve earlier measurements and record the stop date; decide explicitly whether to delete retained browser assignment/queue keys as part of closing the experiment.

## Search visibility experiment

Keep factual page content stable across A/B visitors and crawlers. Use the SEO/GEO rollout and question panel in the GEO repo for public citations and enquiry attribution. A visitor conversion winner cannot establish a GEO ranking or citation effect. Multiple page clusters and pre-period controls are needed for stronger search-causal tests; the small initial ArcSage release supports descriptive repeated observations.
