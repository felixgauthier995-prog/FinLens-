-- Apply after 0004. Dedicated tables avoid overwriting existing product tables.
create table if not exists public.user_watchlists (
 user_id uuid not null references auth.users(id) on delete cascade,
 ticker text not null check (length(ticker) between 1 and 20),
 created_at timestamptz not null default now(), primary key(user_id,ticker)
);
create table if not exists public.user_event_alerts (
 user_id uuid not null references auth.users(id) on delete cascade,
 event_slug text not null, event_title text not null, due_at timestamptz not null,
 read_at timestamptz, created_at timestamptz not null default now(), primary key(user_id,event_slug)
);
alter table public.user_watchlists enable row level security;
alter table public.user_event_alerts enable row level security;
create policy watchlist_owner on public.user_watchlists for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy alert_owner on public.user_event_alerts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.user_watchlists, public.user_event_alerts to authenticated;
create table if not exists public.ai_usage_buckets (bucket text primary key, calls integer not null default 0);
alter table public.ai_usage_buckets enable row level security;
-- Atomic quota reservation across all Vercel instances. Deny on missing migration.
create or replace function public.reserve_ai_call(bucket_name text, max_calls integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into ai_usage_buckets(bucket,calls) values(bucket_name,1)
 on conflict(bucket) do update set calls=ai_usage_buckets.calls+1 where ai_usage_buckets.calls < max_calls
 returning calls into n;
 return n is not null;
end $$;
revoke all on function public.reserve_ai_call(text,integer) from public, anon, authenticated;
grant execute on function public.reserve_ai_call(text,integer) to service_role;
