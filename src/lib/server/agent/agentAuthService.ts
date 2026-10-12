import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { signAgentToken } from './agentToken'

interface DbAgentUser {
  id:                  string
  email:               string
  password_hash:       string
  name:                string
  must_reset_password: boolean
  created_at:          string
}

export interface AgentProfile {
  id:                string
  email:             string
  name:              string
  /** True until the agent sets their own password — see /api/agentx/change-password. Admin-provisioned accounts start with this true. */
  mustResetPassword: boolean
}

function toProfile(row: DbAgentUser): AgentProfile {
  return { id: row.id, email: row.email, name: row.name, mustResetPassword: row.must_reset_password }
}

export async function agentLogin(email: string, password: string): Promise<{ token: string; agent: AgentProfile }> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase
    .from('agent_users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) {
    console.error('[agentAuthService] agentLogin lookup failed:', error)
    throw new ApiError(500, 'Failed to look up agent account', 'agent_lookup_failed')
  }

  const invalid = () => ApiError.unauthorized('Incorrect email or password', 'invalid_credentials')
  if (!row) throw invalid()

  const matches = await bcrypt.compare(password, row.password_hash)
  if (!matches) throw invalid()

  const agent = toProfile(row as DbAgentUser)
  const token = signAgentToken({ sub: agent.id, email: agent.email })
  return { token, agent }
}

export async function getAgentProfile(agentId: string): Promise<AgentProfile> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase.from('agent_users').select('*').eq('id', agentId).maybeSingle()
  if (error) {
    console.error('[agentAuthService] getAgentProfile lookup failed:', error)
    throw new ApiError(500, 'Failed to look up agent account', 'agent_lookup_failed')
  }
  if (!row) throw ApiError.notFound('Agent account not found')
  return toProfile(row as DbAgentUser)
}

/**
 * Requires the current password (whether that's the admin-issued temp
 * password on first login, or a password the agent already chose) —
 * an authenticated cookie alone isn't treated as enough to silently
 * swap in a new password. Clears must_reset_password on success so
 * the forced-reset redirect in AgentxShell stops firing.
 */
export async function changeAgentPassword(agentId: string, currentPassword: string, newPassword: string): Promise<AgentProfile> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase.from('agent_users').select('*').eq('id', agentId).maybeSingle()
  if (error) {
    console.error('[agentAuthService] changeAgentPassword lookup failed:', error)
    throw new ApiError(500, 'Failed to look up agent account', 'agent_lookup_failed')
  }
  if (!row) throw ApiError.notFound('Agent account not found')

  const matches = await bcrypt.compare(currentPassword, (row as DbAgentUser).password_hash)
  if (!matches) throw ApiError.unauthorized('Current password is incorrect', 'invalid_credentials')

  const passwordHash = await bcrypt.hash(newPassword, 10)
  const { data: updated, error: updateError } = await supabase
    .from('agent_users')
    .update({ password_hash: passwordHash, must_reset_password: false })
    .eq('id', agentId)
    .select('*')
    .single()
  if (updateError || !updated) {
    console.error('[agentAuthService] changeAgentPassword update failed:', updateError)
    throw new ApiError(500, 'Failed to update password', 'agent_password_update_failed')
  }

  return toProfile(updated as DbAgentUser)
}
