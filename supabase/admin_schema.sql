-- ─────────────────────────────────────────────────────────────
-- Admin portal schema for AI4Planning — run AFTER schema.sql.
-- Supabase SQL Editor → New query → paste → Run.
-- ─────────────────────────────────────────────────────────────

-- ── admin_users ─────────────────────────────────────────────
-- Deliberately a SEPARATE table from `users`, not a role flag on the
-- regular user table. Admin access uses its own email+password login
-- (not the OTP flow), its own JWT (signed with ADMIN_JWT_SECRET, a
-- different secret than the regular app's JWT_SECRET), and its own
-- cookie (adminAccessToken, distinct from accessToken) — compromising
-- one system doesn't hand you the other.
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,          -- plaintext, not encrypted/hashed like the customer users table — admin emails aren't customer PII in the same sense, and being able to query/read them directly (e.g. "who is admin@x.com") is useful for this small, internal table
  password_hash text not null,
  name          text not null default '',
  created_at    timestamptz not null default now()
);

-- No self-service signup route exists for this table on purpose — see
-- DEPLOY.md for how to create the first admin via SQL directly.

-- ── Row Level Security ──────────────────────────────────────
alter table public.admin_users enable row level security;
