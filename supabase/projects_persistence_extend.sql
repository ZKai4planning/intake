-- ─────────────────────────────────────────────────────────────
-- Extends the `projects` stub (search_workspace_consultant_schema.sql)
-- so the dashboard's intake/application flow — previously only ever
-- written to localStorage by src/lib/projects.ts — can actually be
-- persisted. Run this AFTER search_workspace_consultant_schema.sql.
-- Supabase SQL Editor → New query → paste → Run.
--
-- Column strategy: `id`, `user_id`, `status`, `consultant_booking`,
-- `created_at` already exist and stay as real columns (status/user_id
-- are what workspace's usage counts and the admin panel filter/join
-- on). Everything else the frontend's Project type carries (answers,
-- title, address, constraints, purchase, serviceId, etc.) is stored
-- in a single `data` jsonb blob — same pattern as reports.answers/
-- reports.content — since that shape is still evolving client-side
-- and doesn't need to be queried column-by-column server-side.
-- ─────────────────────────────────────────────────────────────

alter table public.projects
  add column if not exists data       jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at(); -- defined in schema.sql
