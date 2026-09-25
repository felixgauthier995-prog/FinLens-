-- The partial unique index from 0001 isn't usable as an upsert conflict
-- target by PostgREST. Replace it with a proper unique constraint
-- (Postgres treats NULLs as distinct under UNIQUE, so existing/future rows
-- without an external_id are unaffected).
drop index if exists events_external_id_key;

alter table public.events
  add constraint events_external_id_key unique (external_id);
