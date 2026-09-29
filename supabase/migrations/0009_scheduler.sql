-- Frequent background jobs on the free Vercel plan.
--
-- Vercel Hobby only runs cron jobs once a day. Supabase's pg_cron calls the
-- same /api/cron/* routes more often through pg_net, authenticated with a
-- dedicated secret (SCHEDULER_SECRET in Vercel).
--
-- The secret and the site URL are NOT in this file (the repo is public).
-- They live in Supabase Vault. Create them once in the SQL Editor:
--   select vault.create_secret('<random 48-char hex>', 'finlens_scheduler_secret');
--   select vault.create_secret('https://<your-domain>', 'finlens_site_url');
-- and set the same secret as SCHEDULER_SECRET in Vercel.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Calls one FinLens job route. Runs as its owner so it can read Vault;
-- nobody else can execute it.
create or replace function public.call_finlens_job(job_path text)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  site text;
  secret text;
  request_id bigint;
begin
  if job_path !~ '^/api/cron/[a-z-]+$' then
    raise exception 'Invalid job path %', job_path;
  end if;
  select decrypted_secret into site from vault.decrypted_secrets where name = 'finlens_site_url';
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'finlens_scheduler_secret';
  if site is null or secret is null then
    raise exception 'finlens_site_url / finlens_scheduler_secret missing from Vault';
  end if;
  select net.http_get(
    url := rtrim(site, '/') || job_path,
    headers := jsonb_build_object('Authorization', 'Bearer ' || secret),
    timeout_milliseconds := 290000
  ) into request_id;
  return request_id;
end $$;

revoke all on function public.call_finlens_job(text) from public, anon, authenticated;

-- Schedules (UTC). Re-running this file replaces them.
select cron.schedule('finlens-sync-news', '*/15 * * * *',
  $$select public.call_finlens_job('/api/cron/sync-news')$$);
select cron.schedule('finlens-sync-company-events', '7,37 * * * *',
  $$select public.call_finlens_job('/api/cron/sync-company-events')$$);
-- US market hours on weekdays; FMP's free tier allows ~250 calls/day.
select cron.schedule('finlens-sync-asset-prices', '5 14-21 * * 1-5',
  $$select public.call_finlens_job('/api/cron/sync-asset-prices')$$);
-- Daily jobs (financial events, signal tracking) stay on Vercel Cron.
