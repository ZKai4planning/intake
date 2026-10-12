-- ─────────────────────────────────────────────────────────────
-- Workspace, consultant booking & projects schema for AI4Planning —
-- run this AFTER schema.sql (needs `users`). Supabase SQL Editor →
-- New query → paste → Run.
-- ─────────────────────────────────────────────────────────────

-- ── projects ────────────────────────────────────────────────
-- Minimal stub — just enough for workspace's usage counts and
-- consultant's project-ownership check + booking snapshot write. This
-- is NOT the full intake-projects module (project drafts, addresses,
-- eligibility answers, etc. — a separate, larger piece not ported
-- yet). Nothing currently inserts a real project here beyond what
-- consultant.book's snapshot write touches on an existing row, so
-- workspace's projectsCount will read 0 until intake-projects is
-- ported too.
create table if not exists public.projects (
  id                  text primary key,          -- caller-assigned, matches the Project model's plain @id
  user_id             uuid references public.users(id) on delete set null,

  status              text not null default 'draft',  -- 'draft' | 'submitted' | ... — workspace counts status = 'submitted'

  -- Snapshot of the most recent consultant booking for this project —
  -- written by consultant.book so the existing project page (which
  -- reads this field directly) keeps working unchanged. Not a foreign
  -- key to `bookings`; it's a denormalized copy, same as the backend.
  consultant_booking  jsonb,

  created_at          timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_status_idx on public.projects (status);

-- ── bookings ────────────────────────────────────────────────
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  project_id  text,                                -- not a foreign key — same loose-reference pattern as orders/cart_items

  type        text not null check (type in ('consultation', 'callback')),
  date        text,                                -- ISO date YYYY-MM-DD; null for a callback
  time_slot   text not null,                        -- human label, e.g. 'Morning (9am – 12pm)'
  notes       text,
  price_gbp   int not null default 0,
  status      text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),

  booked_at   timestamptz not null default now()
);

-- Covers both the availability-clash check (date + time_slot + type +
-- status) and workspace's "confirmed bookings for this user" count.
create index if not exists bookings_slot_idx on public.bookings (date, time_slot, type, status);
create index if not exists bookings_user_id_idx on public.bookings (user_id);

-- ── Row Level Security ──────────────────────────────────────
-- Same reasoning as every other table in this app: API routes use the
-- service role key exclusively (bypasses RLS); enabling RLS with no
-- policies means the anon/public key gets zero access regardless.
alter table public.projects enable row level security;
alter table public.bookings enable row level security;
