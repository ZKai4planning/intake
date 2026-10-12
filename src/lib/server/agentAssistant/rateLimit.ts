import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'

/**
 * Backed by assistant_action_log (see assistant_action_log_schema.sql)
 * rather than a separate counter table — every confirmed write is
 * already logged there, so counting recent rows for the same tool
 * gives an accurate window without new state to maintain. Fails OPEN
 * on a lookup error (e.g. a transient DB hiccup) rather than blocking
 * a legitimate action because the rate-limit check itself broke —
 * same trade-off the audit logging itself makes elsewhere.
 */
export async function checkAssistantRateLimit(opts: {
  tool: string
  /** Counts rows where this actor performed the action, within the window. */
  actorId: string
  windowMinutes: number
  maxCalls: number
  /** Optional extra scope — e.g. the target email for resend_agent_invite, so one admin can't be used to spam one address even if their own overall count is fine. */
  targetField?: { key: string; value: string }
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const since = new Date(Date.now() - opts.windowMinutes * 60_000).toISOString()

  let query = supabase
    .from('assistant_action_log')
    .select('id', { count: 'exact', head: true })
    .eq('tool', opts.tool)
    .eq('actor_id', opts.actorId)
    .gte('created_at', since)

  const { count, error } = await query
  if (error) {
    console.error('[agentAssistant] rate limit check failed (failing open):', error)
  } else if ((count ?? 0) >= opts.maxCalls) {
    throw ApiError.tooMany(
      `You've hit the limit for this action (${opts.maxCalls} per ${opts.windowMinutes} minute${opts.windowMinutes === 1 ? '' : 's'}) — please wait a bit and try again.`
    )
  }

  if (opts.targetField) {
    const { count: targetCount, error: targetError } = await supabase
      .from('assistant_action_log')
      .select('id', { count: 'exact', head: true })
      .eq('tool', opts.tool)
      .gte('created_at', since)
      .eq(`args->>${opts.targetField.key}`, opts.targetField.value)

    if (targetError) {
      console.error('[agentAssistant] target rate limit check failed (failing open):', targetError)
      return
    }
    if ((targetCount ?? 0) >= opts.maxCalls) {
      throw ApiError.tooMany(`That target has already hit the limit for this action recently — please wait a bit and try again.`)
    }
  }
}
