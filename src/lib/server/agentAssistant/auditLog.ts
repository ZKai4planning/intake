import { getSupabaseAdmin } from '../supabaseAdmin'

/**
 * Best-effort by design (like the email sends elsewhere in this
 * codebase) — a logging hiccup shouldn't block the actual action the
 * person just confirmed. Called only from /api/agent-assistant/execute,
 * right after a write tool runs.
 */
export async function logAssistantAction(entry: {
  surface: string
  actorId: string
  actorEmail?: string | null
  tool: string
  args: Record<string, unknown>
  resultSummary: string
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('assistant_action_log').insert({
      surface: entry.surface,
      actor_id: entry.actorId,
      actor_email: entry.actorEmail ?? null,
      tool: entry.tool,
      args: entry.args,
      result_summary: entry.resultSummary,
    })
  } catch (err) {
    console.error('[agentAssistant] failed to write audit log:', err)
  }
}
