# FinLens — local readiness and activation

## Current scope
Local changes only; no push, deployment, database migration or paid API call has been performed during this implementation.

- News: Finnhub general headlines + summaries (not full articles), maximum 25 fetched and 8 new analyses per run. Structured analysis is validated. Supabase stores results; external ID deduplicates imports.
- Ask: verified Supabase bearer session, at most 20 requests/user/day, shared global ceiling of 200 AI calls/day (including ingestion). Atomic SQL quotas fail closed. Failed attempts count. Limits are request ceilings, not dollar guarantees; set a provider project budget too. Sources are selected from recent stored coverage, not a live web search.
- Brief: deterministic summary of up to three stories from the last 48 hours, compiled at page request time. No fabricated market narrative and no extra AI charge.
- Sanity: manual articles/events remain separate; ingestion never writes to Sanity. A manual article with the same source URL takes precedence in the feed. Existing example.com seed articles are excluded from this channel. Legacy seeded events (marketEvent- IDs) are excluded. The seed script now uses createIfNotExists and marks examples isDemo; it will not overwrite manual edits.
- Calendar: FMP date-only events display "Time unconfirmed" and cannot receive a precise-time reminder.
- Accounts: Supabase email magic links; Configure Site URL and Redirect URLs for localhost and the eventual production URL. Supabase email delivery configuration/limits apply.
- Watchlist: saved per authenticated user with row-level security.
- Alerts: saved per user, due reminders appear in the in-app Notifications panel, polled once per minute while open. No background push/email. Event dates are snapshots: remove/re-add a reminder if its schedule changes.
- Quotes: last stored provider values, timestamps shown; no fictional fallback outside explicit demo mode. Unknown quotes are unavailable. Sync timestamp is not an exchange timestamp.

## Before activation
1. Back up/inspect existing database schema. Apply missing migration 0004_articles.sql and then 0005_user_features.sql via Supabase SQL Editor. Existing migrations 0001–0003 assumed an events table already existed: do not run them blindly against an empty database.
2. Confirm variables locally/Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (public), SUPABASE_SERVICE_ROLE_KEY, FINNHUB_API_KEY, FMP_API_KEY, OPENAI_API_KEY, CRON_SECRET (server-only). OPENAI_MODEL is optional, defaults to existing gpt-4o-mini. NEXT_PUBLIC_DEMO_MODE must be false for real data. Sanity uses NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.
3. Configure Supabase Auth email redirects. Sign in with two separate accounts and verify each has separate watchlists/reminders. Test refreshing, sign-out, and errors.
4. Run ingestion using Authorization: Bearer CRON_SECRET in a secure API client. Check ingestion_runs and real source timestamps. Do not paste tokens into chat, commit them, or print them in logs.
5. Confirm provider entitlements for the selected data and intended use, plus spending limits.
6. Review local changes and approve a push/deployment separately.

## Scheduling
vercel.json proposes daily UTC schedules: events 11:00, news 12:00, prices 13:00. They are NOT active until deployment. Vercel Hobby daily cron can run within the scheduled hour: https://vercel.com/docs/cron-jobs/usage-and-pricing . This is a daily test configuration, not continuous scanning. For a paid plan/suitable scheduler, consider news every 15 minutes and quotes at an interval supported by the provider. News is capped at one reservation per 15-minute UTC bucket. No missed-news backfill beyond the latest 25 headlines yet. A failed run can retry in the next bucket. No automatic paid retries.

## Verification boundaries
Local tests/typecheck/lint/build do not prove external credentials, database migrations, RLS, email delivery, live API quotas or Vercel scheduling work. Those require configured service checks. No claim of production readiness until these are verified.

## Verified external state
Read-only check: required environment variable names are configured locally; articles endpoint responds 200. New user_watchlists, user_event_alerts and ai_usage_buckets endpoints respond 404: migration 0005 has not yet been applied. No live AI request has been made.

## Catalyst signals (migration 0007)
Per-company "good or bad news for this company" signals, extracted from each analyzed article.
- Evidence rules (code, `src/lib/signals/filter.ts`): the AI must quote a sentence that really appears in the headline/summary, or the signal is dropped. A "direct" signal whose company isn't named is downgraded to "chain"; chain signals are always low confidence. Max 5 per article, known tickers only.
- Second review (`src/lib/signals/verify.ts`): one extra OpenAI call per article that has signals; counts toward the 200/day global AI ceiling. If the budget is exhausted or the call fails, only direct signals are kept, marked unverified. Disable with `SIGNAL_VERIFICATION=off`. Optional `OPENAI_VERIFY_MODEL`.
- Baseline: a real FMP quote for the ticker and SPY at storage time. `sync-news` uses `FMP_API_KEY` if present; without it signals are stored without a baseline and never count in the track record.
- Track record: `/api/cron/track-signals` (weekdays 21:00 UTC) fills 1d / 1w / 1m prices. Late snapshots beyond a grace period are skipped rather than distorting results. Max 40 tickers per run (FMP free tier). A signal "matches" when the stock beat (positive) or lagged (negative) SPY over the window. The 1-week hit rate is shown once 20 signals are measured; all measured signals count, wrong ones included.
- UI: arrows on news cards, full detail (reason, confidence, horizon, quote, direct/indirect, reviewed) on the article page, with a not-investment-advice notice.
- Activation: apply `0007_article_signals.sql` in the Supabase SQL Editor. Until then the feed works as before (signal reads fail silently, writes are logged and skipped).

## Accounts and paywall (migration 0008)
The app is now private: every page in `(app)` requires (1) a signed-in user, (2) a completed questionnaire, (3) a Stripe subscription in `trialing`, `active` or `past_due`. Missing any step redirects to `/welcome`, `/onboarding` or `/subscribe`. Ask FinLens checks the subscription server-side too. Public pages: `/welcome`, `/login`, `/auth/callback`.
- Sessions: Supabase auth now uses cookies (`@supabase/ssr`) so the server knows who is signed in. `src/proxy.ts` only refreshes the session; access is decided in `src/lib/account.ts`. Existing signed-in browsers will need to sign in once more.
- Questionnaire: experience, goal, sectors, risk, then 1–15 stocks (suggested from sectors) saved to `user_watchlists`. Answers in `profiles` (user can read/write own row).
- Payments: Stripe Checkout, 7-day trial once per user, monthly and yearly prices. `subscriptions` is readable by its owner but only written by the server (webhook and post-checkout sync), so nobody can grant themselves access. Customer portal from Settings → Manage subscription.

### Activation
1. Supabase SQL Editor: run `0008_accounts_subscriptions.sql`.
2. Supabase → Authentication → URL Configuration: Site URL = production URL; add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback`) to Redirect URLs.
3. Stripe (start in Test mode): create product "FinLens" with two recurring prices, $7.99/month and $59.99/year. Copy both price IDs.
4. Stripe → Developers → Webhooks: endpoint `https://<your-domain>/api/stripe/webhook`, events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`. Copy the signing secret.
5. Stripe → Settings → Billing → Customer portal: enable it (cancel, switch plan, update card). Settings → Customer emails: turn on trial-ending reminders.
6. Vercel env vars: `NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`. Redeploy.
7. Your own access: create a 100%-off coupon + promotion code in Stripe (checkout accepts promo codes), or use test mode with card 4242 4242 4242 4242.
8. Switch to live keys/prices only after testing the full flow: sign up → questionnaire → trial → Settings → cancel.

### App (PWA)
`src/app/manifest.ts`, icons in `public/`, `apple-icon.png`, standalone display and safe-area padding. On iPhone: Safari → Share → Add to Home Screen. On Android: Chrome offers "Install app". Push notifications are not implemented yet. If the app is later wrapped for the App Store, Apple's in-app purchase rules for digital subscriptions must be reviewed first.

## Frequent imports (migration 0009) and personalization (0010)
- Vercel Hobby runs crons once a day. Supabase `pg_cron` + `pg_net` now call `/api/cron/sync-news` every 15 min, `sync-company-events` twice an hour and `sync-asset-prices` hourly on US market days (UTC). Daily jobs stay on Vercel. Cron routes accept `Bearer CRON_SECRET` (Vercel) or `Bearer SCHEDULER_SECRET` (Supabase) — see `src/lib/security/cron.ts`.
- Secrets are in Supabase Vault, never in the repo: `finlens_scheduler_secret` (same value as `SCHEDULER_SECRET` in Vercel, ≥16 chars) and `finlens_site_url`. Until both exist the scheduled calls fail harmlessly. Check runs with `select * from cron.job_run_details order by start_time desc limit 20;`.
- AI budgets are separate: imports `ai-ingest` (default 150/day, env `AI_INGEST_DAILY_MAX`), Ask `ai-ask` (default 300/day, env `AI_ASK_DAILY_MAX`), plus 20 Ask questions per user per day.
- Personalization uses the questionnaire: "For you" ranking on Home and News (own stocks > sectors > market impact, fading over ~2 days), "Your Stocks" with the latest story/signal per ticker, a no-jargon "In plain words" explanation for beginners/intermediates (`articles.plain_explanation`), indirect signals shown only to advanced or aggressive profiles, risks first for cautious users, and Ask FinLens adapting its vocabulary to the user's level.

## Wider company list and passwords
- ~137 companies (core list in `assets.ts` + `src/lib/data/universe.ts`). The AI can attach signals to any of them. A "direct" signal requires the company to be named in the article, checked case-sensitively against its identifying names; 1–2 letter tickers (T, C, F, V…) are never matched on their own.
- Free API quotas: price refresh = followed stocks first, then core, 40 tickers per run, every 2 hours on US market days (≈160 FMP calls/day). Company news = followed stocks first, 30 tickers per run.
- Accounts: email + password (min 8 chars), with email confirmation, "forgot password" (email link → `/reset-password`), "Change password" in Settings, and the email sign-in link kept as an option. Existing accounts without a password use "Forgot password?" once to set one.

## Retention: push notifications, morning brief, My week (migration 0011)
- Push: `public/sw.js` + Settings → Notifications. Needs `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (and optionally `PUSH_CONTACT`, a mailto: or https URL) in Vercel, then a redeploy. On iPhone, push only works once FinLens is added to the home screen (iOS 16.4+).
- Signal alerts: when a direct signal is stored for a ticker, people following it get a notification (max 5/day/person, opt-out in Settings).
- Morning brief: `/api/cron/morning-brief` runs hourly via pg_cron and sends at 8 a.m. local time on weekdays (time zone captured when notifications are turned on), once per day. The same brief is the "Today on your stocks" card on Home (it replaces the old Market Brief block).
- My week: `/week`, swipeable cards — a 7-day recap of signals on followed stocks, then one card per upcoming day with followed stocks first. On phones it replaces Agenda in the bottom bar.

## Bilingual FR/EN and legal pages (migration 0012)
- Language: cookie `finlens_locale` (switch in Settings, Welcome, Login and legal pages), otherwise the browser's language; French if it's any `fr-*`. Stored in `profiles.locale` for notifications. All UI text lives in `src/i18n/en.ts` / `fr.ts`; the type system forces both files to have the same keys.
- Content: each new article's AI analysis also returns a French version (`articles.fr`, `article_signals.rationale_fr`) in the same call. Articles analyzed before this change are shown in English. Quotes from sources stay in their original language. Stripe Checkout and the billing portal open in `fr-CA` for French users.
- Legal: `/legal/terms` and `/legal/privacy` in both languages (`src/legal/documents.ts`). Company name, address, privacy officer and governing law are placeholders in `src/legal/company.ts` — fill them in and have a lawyer review both documents before charging real customers.
- Settings → Delete my account: cancels the Stripe subscription, deletes the Stripe customer, then deletes the user (all FinLens data cascades).
