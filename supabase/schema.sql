-- ─────────────────────────────────────────────────────────────
-- Auth schema for AI4Planning — run this once in the Supabase
-- SQL editor (Project → SQL Editor → New query → paste → Run).
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── users ───────────────────────────────────────────────────
create table if not exists public.users (
  id             uuid primary key default gen_random_uuid(),

  -- Encrypted (AES-256-GCM) + a separate deterministic hash for lookups.
  -- See src/lib/server/emailCrypto.ts — email_hash is what every
  -- WHERE clause filters on; `email` is only ever decrypted for display.
  email          text not null,
  email_hash     text not null unique,

  name           text not null default '',
  role           text not null default 'consumer'
                   check (role in ('consumer', 'b2b', 'consultant', 'admin')),

  password_hash  text,               -- set only if/when they use forgot/reset password
  mfa_enabled    boolean not null default false,
  mfa_secret     text,

  avatar_url     text,
  actor_id       text,               -- 'homeowner' | 'landlord' | etc — which workspace they signed up as
  phone          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists users_email_hash_idx on public.users (email_hash);

-- keep updated_at current on every update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ── otp_codes ───────────────────────────────────────────────
create table if not exists public.otp_codes (
  id           uuid primary key default gen_random_uuid(),

  email        text not null,        -- encrypted, same scheme as users.email
  email_hash   text not null,        -- deterministic hash, used for lookups

  code_hash    text not null,        -- bcrypt hash of the 6-digit code — the code itself is never stored
  purpose      text not null check (purpose in ('login', 'signup', 'reset_password')),

  expires_at   timestamptz not null,
  consumed_at  timestamptz,          -- null = still pending/usable
  attempts     int not null default 0,

  created_at   timestamptz not null default now()
);

-- Every OTP lookup in otp.ts filters by (email_hash, purpose, consumed_at is null)
-- ordered by created_at desc — this index covers that exactly.
create index if not exists otp_codes_lookup_idx
  on public.otp_codes (email_hash, purpose, consumed_at, created_at desc);

-- ── Row Level Security ──────────────────────────────────────
-- The Next.js API routes talk to Supabase using the SERVICE ROLE key
-- (see src/lib/server/supabaseAdmin.ts), which bypasses RLS entirely.
-- We still enable + lock RLS down here so that if the anon/public key
-- ever gets used against these tables by mistake (e.g. from a client
-- component), it can't read or write anything — only the service role
-- key, which never leaves the server, can touch these tables at all.
alter table public.users enable row level security;
alter table public.otp_codes enable row level security;
-- No policies are created, which — with RLS enabled — means: no access
-- for anon/authenticated roles. Only the service role bypasses this.
