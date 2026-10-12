import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { decryptEmail } from '../emailCrypto'

export interface AdminUserRow {
  id:         string
  name:       string
  email:      string
  role:       string
  mfaEnabled: boolean
  avatarUrl:  string | null
  actorId?:   string
  phone?:     string
  createdAt:  string
}

interface DbUser {
  id:            string
  email:         string
  name:          string
  role:          string
  mfa_enabled:   boolean
  avatar_url:    string | null
  actor_id:      string | null
  phone:         string | null
  created_at:    string
}

function toAdminRow(row: DbUser): AdminUserRow {
  return {
    id:         row.id,
    name:       row.name,
    // Best-effort decrypt — a row with a corrupted/foreign-key-era
    // ciphertext (e.g. EMAIL_ENCRYPTION_KEY rotated without a
    // migration) shouldn't take down the whole admin user list; show a
    // clear placeholder for that one row instead.
    email:      safeDecryptEmail(row.email),
    role:       row.role,
    mfaEnabled: row.mfa_enabled,
    avatarUrl:  row.avatar_url,
    actorId:    row.actor_id ?? undefined,
    phone:      row.phone ?? undefined,
    createdAt:  row.created_at,
  }
}

function safeDecryptEmail(encrypted: string): string {
  try {
    return decryptEmail(encrypted)
  } catch {
    return '(unable to decrypt)'
  }
}

export interface ListUsersParams {
  search?: string // matched against name only — email is encrypted at rest, can't be searched server-side without decrypting every row
  page?:   number
  limit?:  number
}

export async function listUsers(params: ListUsersParams): Promise<{ users: AdminUserRow[]; total: number }> {
  const supabase = getSupabaseAdmin()
  const page = Math.max(params.page ?? 1, 1)
  const limit = Math.min(Math.max(params.limit ?? 25, 1), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
  if (params.search) query = query.ilike('name', `%${params.search}%`)

  const { data, error, count } = await query
  if (error) throw new ApiError(500, 'Failed to load users', 'users_list_failed')

  return { users: (data as DbUser[]).map(toAdminRow), total: count ?? 0 }
}

export async function getUser(id: string): Promise<AdminUserRow> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to load user', 'user_lookup_failed')
  if (!data) throw ApiError.notFound('User not found')
  return toAdminRow(data as DbUser)
}

export interface AdminUpdateUserPatch {
  name?:  string
  role?:  'consumer' | 'b2b' | 'consultant' | 'admin'
  phone?: string
}

export async function updateUser(id: string, patch: AdminUpdateUserPatch): Promise<AdminUserRow> {
  const supabase = getSupabaseAdmin()
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.role !== undefined) dbPatch.role = patch.role
  if (patch.phone !== undefined) dbPatch.phone = patch.phone

  const { data, error } = await supabase.from('users').update(dbPatch).eq('id', id).select('*').maybeSingle()
  if (error) throw new ApiError(500, 'Failed to update user', 'user_update_failed')
  if (!data) throw ApiError.notFound('User not found')
  return toAdminRow(data as DbUser)
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw new ApiError(500, 'Failed to delete user', 'user_delete_failed')
}
