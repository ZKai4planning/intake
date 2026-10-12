import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { signAgentToken } from './agentToken'

interface DbAgentUser {
  id:            string
  email:         string
  password_hash: string
  name:          string
  created_at:    string
}

export interface AgentProfile {
  id:    string
  email: string
  name:  string
}

function toProfile(row: DbAgentUser): AgentProfile {
  return { id: row.id, email: row.email, name: row.name }
}

export async function agentLogin(email: string, password: string): Promise<{ token: string; agent: AgentProfile }> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase
    .from('agent_users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) throw new ApiError(500, 'Failed to look up agent account', 'agent_lookup_failed')

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
  if (error) throw new ApiError(500, 'Failed to look up agent account', 'agent_lookup_failed')
  if (!row) throw ApiError.notFound('Agent account not found')
  return toProfile(row as DbAgentUser)
}
