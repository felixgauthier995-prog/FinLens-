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
