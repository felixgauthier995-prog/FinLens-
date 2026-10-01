# News relevance review — October 1, 2026

Prepared on `codex/news-relevance`, starting from remote main `8f4f781`.
The original checkout and its unfinished changes were preserved. Nothing was pushed or deployed.

## Changes
- Search within the latest 100 loaded stories by topic, title, source or ticker. Accent-insensitive, combined with category, time range and focus filters.
- Company focus uses stored company-event classifications or direct company signals. It does not infer company involvement from price changes.
- Watchlist focus uses the signed-in user's preferences. Filters persist when changing category or sort.
- Compact phone controls, horizontally scrollable categories, and a clearly labelled analysis excerpt on cards.
- Load the existing company_event_type field; migration 0006 must already be applied before deploying.
- Personal ranking no longer boosts hidden indirect signals. Invalid/future timestamps do not gain a ranking advantage. Home top stories now balance importance with freshness.
- Next.js and its ESLint configuration patched from 16.3.5 to 16.3.8 after npm audit flagged GHSA-vcvr-r3jv-pc5j. Audit after installation: zero known vulnerabilities. This is not proof of complete security.

## Verification and limits
- 33 automated tests passed, including filters, ranking, signal validation and existing account rules.
- Lint passed. Production build result recorded in the task response.
- Real Chrome screenshots at desktop 1440px and phone 390px; no horizontal page overflow. Local fictional-data preview verified NVDA/time filtering and French labels. Temporary preview route removed.
- No production credentials copied, paid API calls made, remote database changes applied or auth gates bypassed in the deliverable.
- Live ingestion, subscription checkout, notification delivery and cross-account database isolation were not exercised.
- Search covers loaded stories, not a complete company directory or historical archive.

## Recommended next work
1. Cluster duplicate reporting into one evolving story; distinguish independent reporting from syndicated copies.
2. Make company pages show a catalyst timeline, cited analysis, upcoming dates and timestamped observed returns versus a benchmark.
3. Track ingestion freshness and provider errors so an empty feed can be distinguished from an outage. Eliminate silent failures before monetization.
4. Offer a public sample analysis before asking for an account or subscription.
5. Run two-account isolation, payment/webhook and notification delivery checks in staging before launch.
