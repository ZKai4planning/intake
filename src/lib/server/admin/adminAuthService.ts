import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { signAdminToken } from './adminToken'

interface DbAdminUser {
  id:            string
  email:         string
  password_hash: string
  name:          string
  created_at:    string
}

export interface AdminProfile {
  id:    string
  email: string
  name:  string
}

function toProfile(row: DbAdminUser): AdminProfile {
  return { id: row.id, email: row.email, name: row.name }
}

/**
 * Deliberately generic failure message and a constant-shape response
 * whether the email doesn't exist or the password is wrong — same
 * reasoning as any login endpoint: don't let a failed attempt reveal
 * which part was incorrect, or confirm/deny which admin emails exist.
 */
export async function adminLogin(email: string, password: string): Promise<{ token: string; admin: AdminProfile }> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) throw new ApiError(500, 'Failed to look up admin account', 'admin_lookup_failed')

  const invalid = () => ApiError.unauthorized('Incorrect email or password', 'invalid_credentials')
  if (!row) throw invalid()

  const matches = await bcrypt.compare(password, row.password_hash)
  if (!matches) throw invalid()

  const admin = toProfile(row as DbAdminUser)
  const token = signAdminToken({ sub: admin.id, email: admin.email })
  return { token, admin }
}

export async function getAdminProfile(adminId: string): Promise<AdminProfile> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase.from('admin_users').select('*').eq('id', adminId).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to look up admin account', 'admin_lookup_failed')
  if (!row) throw ApiError.notFound('Admin account not found')
  return toProfile(row as DbAdminUser)
}
