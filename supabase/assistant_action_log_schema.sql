-- ─────────────────────────────────────────────────────────────
-- Audit log for the floating agent assistant's write actions
-- (see src/lib/server/agentAssistant/tools.ts, WRITE_TOOLS). Run
-- AFTER schema.sql. Supabase SQL Editor → New query → paste → Run.
-- ─────────────────────────────────────────────────────────────

-- Every mutation the assistant performs — never a read/navigate — is
-- logged here, same accountability bar as if a human had clicked the
-- equivalent button by hand. actor_id/actor_email identify the ADMIN
-- or AGENT who reviewed and confirmed the action (see
-- /api/agent-assistant/execute) — the assistant never acts without a
-- human confirming first, so there's always a real accountable person
-- on every row.
create table if not exists public.assistant_action_log (
  id              uuid primary key default gen_random_uuid(),
  surface         text not null,          -- 'admin' | 'agentx'
  actor_id        text not null,          -- admin_users.id or agent_users.id of whoever confirmed it
  actor_email     text,
  tool            text not null,          -- e.g. 'create_agent_account', 'create_project'
  args            jsonb not null default '{}'::jsonb,
  result_summary  text,
  created_at      timestamptz not null default now()
);

create index if not exists assistant_action_log_actor_idx on public.assistant_action_log (actor_id);
create index if not exists assistant_action_log_created_at_idx on public.assistant_action_log (created_at desc);

alter table public.assistant_action_log enable row level security; -- API routes use the service role key, which bypasses RLS; this just locks out anon/public access if that key were ever used client-side
