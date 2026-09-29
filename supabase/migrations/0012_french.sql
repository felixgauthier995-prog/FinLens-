-- Bilingual content: French versions of AI analyses and signal reasons,
-- and each user's language (for notifications).
alter table public.articles add column if not exists fr jsonb;
alter table public.article_signals add column if not exists rationale_fr text;
alter table public.profiles add column if not exists locale text check (locale is null or locale in ('en', 'fr'));
