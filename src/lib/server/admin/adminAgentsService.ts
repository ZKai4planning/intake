import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { sendAgentInviteEmail } from '../email/emailService'

export interface AdminAgentRow {
  id:                 string
  name:               string
  email:              string
  mustResetPassword:  boolean
  createdAt:          string
}

interface DbAgentUser {
  id: string; name: string; email: string; must_reset_password: boolean; created_at: string
}

function toAdminRow(row: DbAgentUser): AdminAgentRow {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mustResetPassword: row.must_reset_password,
    createdAt: row.created_at,
  }
}

// Avoids visually-ambiguous characters (0/O, 1/I/l) since this is read
// off an email and typed in by hand for exactly one login.
const PASSWORD_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

function generateTempPassword(length = 12): string {
  const bytes = crypto.randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length]
  return out
}

export async function listAgents(): Promise<AdminAgentRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_users')
    .select('id, name, email, must_reset_password, created_at')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[adminAgentsService] listAgents failed:', error)
    throw new ApiError(500, 'Failed to load agents', 'agents_list_failed')
  }
  return (data as DbAgentUser[]).map(toAdminRow)
}

/**
 * Provisions a new agentx account: generates a one-time temp password,
 * stores its hash with must_reset_password=true, and emails the
 * credentials to the agent. The plaintext password is never returned
 * to the caller — it only ever exists in memory here and in the email
 * that's sent.
 */
export async function createAgent(input: { name: string; email: string }): Promise<AdminAgentRow> {
  const supabase = getSupabaseAdmin()
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()

  const { data: existing, error: lookupError } = await supabase
    .from('agent_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (lookupError) {
    console.error('[adminAgentsService] createAgent lookup failed:', lookupError)
    throw new ApiError(500, 'Failed to check existing agents', 'agent_lookup_failed')
  }
  if (existing) throw ApiError.badRequest('An agent with that email already exists', 'agent_email_taken')

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const { data, error } = await supabase
    .from('agent_users')
    .insert({ name, email, password_hash: passwordHash, must_reset_password: true })
    .select('id, name, email, must_reset_password, created_at')
    .single()
  if (error || !data) {
    console.error('[adminAgentsService] createAgent insert failed:', error)
    throw new ApiError(500, 'Failed to create agent account', 'agent_create_failed')
  }

  await sendAgentInviteEmail(email, name, tempPassword).catch(() => {
    // Email delivery is best-effort (see emailService.ts) — the account
    // still exists either way; resendInvite below covers a lost email.
  })

  return toAdminRow(data as DbAgentUser)
}

/** Issues a fresh temp password and re-sends the invite — for when the original email never arrived or the agent lost it before ever logging in. */
export async function resendAgentInvite(id: string): Promise<AdminAgentRow> {
  const supabase = getSupabaseAdmin()
  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const { data, error } = await supabase
    .from('agent_users')
    .update({ password_hash: passwordHash, must_reset_password: true })
    .eq('id', id)
    .select('id, name, email, must_reset_password, created_at')
    .maybeSingle()
  if (error) throw new ApiError(500, 'Failed to reset agent password', 'agent_reinvite_failed')
  if (!data) throw ApiError.notFound('Agent not found')

  const row = data as DbAgentUser
  await sendAgentInviteEmail(row.email, row.name, tempPassword).catch(() => {})

  return toAdminRow(row)
}

export async function deleteAgent(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('agent_users').delete().eq('id', id)
  if (error) throw new ApiError(500, 'Failed to delete agent', 'agent_delete_failed')
}
