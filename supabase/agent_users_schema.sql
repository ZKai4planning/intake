-- ─────────────────────────────────────────────────────────────
-- Agent portal (agentx) schema for AI4Planning — run AFTER
-- schema.sql (needs public.set_updated_at()). Supabase SQL Editor →
-- New query → paste → Run.
--
-- This table was already referenced by src/lib/server/agent/
-- agentAuthService.ts but never had a migration — this is that
-- migration.
-- ─────────────────────────────────────────────────────────────

-- ── agent_users ─────────────────────────────────────────────
-- Deliberately a SEPARATE table from `users` and `admin_users` — its
-- own login, its own JWT (AGENT_JWT_SECRET), its own cookie
-- (agentAccessToken). Accounts are provisioned by an admin (see
-- adminAgentsService.ts), never self-signup: an admin supplies name +
-- email, the system generates a one-time temporary password, emails
-- it to the agent, and flags the account so the agent is forced to
-- set their own password on first login.
create table if not exists public.agent_users (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null unique,   -- plaintext, not encrypted — same reasoning as admin_users: internal staff accounts, not customer PII
  password_hash         text not null,
  name                  text not null default '',

  -- True from creation until the agent successfully sets their own
  -- password (see /api/agentx/change-password). The agentx portal
  -- (AgentxShell) redirects to /agentx/reset-password while this is
  -- true, so a temporary/admin-issued password can't be used past
  -- the first login.
  must_reset_password   boolean not null default true,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists agent_users_email_idx on public.agent_users (email);

drop trigger if exists agent_users_set_updated_at on public.agent_users;
create trigger agent_users_set_updated_at
  before update on public.agent_users
  for each row execute function public.set_updated_at(); -- defined in schema.sql

-- ── Row Level Security ──────────────────────────────────────
-- Same reasoning as admin_users/schema.sql: API routes use the
-- service role key exclusively, which bypasses RLS. Enabling RLS with
-- no policies means the anon/public key gets zero access even if it's
-- ever accidentally used client-side.
alter table public.agent_users enable row level security;
