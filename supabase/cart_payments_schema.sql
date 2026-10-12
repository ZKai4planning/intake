-- ─────────────────────────────────────────────────────────────
-- Cart & Payments schema for AI4Planning — run this AFTER schema.sql
-- (it depends on the `users` table already existing). Supabase SQL
-- Editor → New query → paste → Run.
-- ─────────────────────────────────────────────────────────────

-- ── reports ─────────────────────────────────────────────────
-- Minimal version of the Report model — just enough for cart pricing
-- (tier lookup) and payments (unlocking on completion). This is NOT
-- the full reports-generation module (that's a separate, much larger
-- piece — an AI-agent pipeline that produces `content` — and hasn't
-- been ported yet). Without that module there's currently no route
-- that INSERTs a row here, which means cart.addToCart has nothing to
-- add until report generation/persistence is also ported. See the
-- note in cartService.ts.
create table if not exists public.reports (
  id          text primary key,              -- caller-assigned, not auto-generated (matches the Report model's plain @id)
  user_id     uuid references public.users(id) on delete set null,

  tier        text not null,                 -- ReportTierId, e.g. 'RPT-002'
  answers     jsonb not null default '{}'::jsonb,
  content     jsonb not null default '{}'::jsonb,

  -- Snapshot fields, same reasoning as users.email — kept so a report
  -- still displays an owner label if the account is later deleted.
  -- Encrypted (AES-256-GCM) the same way, via emailCrypto.ts.
  owner_email text,
  owner_name  text,

  -- Set once a paid tier is actually paid for via checkout — see
  -- paymentsService.ts's webhook handler.
  unlocked_at timestamptz,

  created_at  timestamptz not null default now()
);

create index if not exists reports_user_id_idx on public.reports (user_id);

-- ── cart_items ──────────────────────────────────────────────
-- One item per report, no quantities — mirrors the frontend's
-- lib/cart.ts CartItem shape. report_id is intentionally NOT a foreign
-- key (matches the original Prisma model) — cart rows are looked up
-- and priced against `reports` in the service layer, not enforced by
-- a DB constraint, so a report being removed doesn't cascade-complicate
-- what's sitting in someone's cart.
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  report_id  text not null,

  tier       text not null,
  label      text not null,
  price_gbp  int not null,                   -- minor-unit-free here (whole pounds) — see reportTierCatalogue.ts; Revolut amounts (orders.amount) ARE minor units

  added_at   timestamptz not null default now(),

  unique (user_id, report_id)
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

-- ── orders ──────────────────────────────────────────────────
-- One row per Revolut Merchant API order. `status` mirrors Revolut's
-- order state (see revolutClient.ts's mapRevolutState), reconciled
-- both by the webhook (primary path) and GET /order/:orderId (polling
-- backup for missed/delayed webhooks).
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references public.users(id) on delete set null,

  revolut_order_id     text not null unique,
  revolut_order_token  text,
  merchant_order_ref   text not null unique,
  checkout_url         text,

  amount               int not null,          -- minor currency units, e.g. 2900 = £29.00
  currency             text not null,
  status               text not null default 'PENDING', -- PENDING | PROCESSING | COMPLETED | FAILED
  description          text,

  -- What this order unlocks on completion — set by our own API, not
  -- part of Revolut's contract. Neither is a foreign key, same
  -- reasoning as cart_items.report_id above.
  report_id            text,
  project_id           text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at(); -- defined in schema.sql

-- ── Row Level Security ──────────────────────────────────────
-- Same reasoning as schema.sql: the API routes use the service role
-- key exclusively, which bypasses RLS. Enabling RLS with no policies
-- means the anon/public key gets zero access to any of these tables
-- even if it's ever accidentally used client-side.
alter table public.reports enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
