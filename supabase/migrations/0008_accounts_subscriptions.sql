-- Accounts, onboarding answers and paid subscriptions.
-- Safe to run more than once. Requires 0005_user_features.sql.

-- Onboarding questionnaire answers. Each user reads and writes only their own row.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  goal text check (goal in ('long-term', 'active-trading', 'stay-informed', 'learn')),
  sectors text[] not null default '{}',
  risk text check (risk in ('cautious', 'balanced', 'aggressive')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profile_owner') then
    create policy profile_owner on public.profiles for all to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end $$;
grant select, insert, update on public.profiles to authenticated;

-- Stripe subscription state. Users can only READ their own row; only the
-- server (service role, via the Stripe webhook) writes it, so nobody can
-- grant themselves access.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text,            -- Stripe status: trialing, active, past_due, canceled, ...
  price_id text,
  plan_interval text,     -- month | year
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  -- Set once a trial has been granted, so a user can't restart trials.
  trial_used boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'subscription_owner_read') then
    create policy subscription_owner_read on public.subscriptions for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end $$;
revoke insert, update, delete on public.subscriptions from authenticated, anon;
grant select on public.subscriptions to authenticated;
