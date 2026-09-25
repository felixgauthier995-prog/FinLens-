-- Adds live-price columns to stocks, filled in by the price sync job.
-- Kept on the stocks table itself (no separate time-series table yet) —
-- we only need "current price", not history, at this stage.
alter table public.stocks
  add column if not exists price numeric,
  add column if not exists change_percent numeric,
  add column if not exists change_absolute numeric,
  add column if not exists price_updated_at timestamp with time zone;
