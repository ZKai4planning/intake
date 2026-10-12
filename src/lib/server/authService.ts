import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { encryptEmail, decryptEmail, hashEmail } from './emailCrypto'
import { issueOtp, consumeOtp, maskEmail, type OtpPurpose } from './otp'
import { signAccessToken } from './token'
import { sendWelcomeEmail, sendPasswordResetSuccessEmail } from './email/emailService'

type Role = 'consumer' | 'b2b' | 'consultant' | 'admin'

interface DbUser {
  id: string
  email: string
  email_hash: string
  name: string
  role: Role
  password_hash: string | null
  mfa_enabled: boolean
  mfa_secret: string | null
  avatar_url: string | null
  actor_id: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

async function findUserByEmailHash(emailHash: string): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('users').select('*').eq('email_hash', emailHash).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to look up your account', 'user_lookup_failed')
  return (data as DbUser | null) ?? null
}

async function findUserById(id: string): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to look up your account', 'user_lookup_failed')
  return (data as DbUser | null) ?? null
}

/**
 * Single entry point for "log in or sign up" — no `intent` from the
 * client, and no double request from the frontend trying 'login' then
 * falling back to 'signup'. We look the account up ourselves and pick
 * the right purpose (and therefore the right email copy) in one shot.
 *
 * The account itself is still only created once the code is verified
 * (see verifyOtp below) — a send-otp call alone never writes a user
 * row, so an abandoned signup attempt doesn't leave an orphaned
 * account sitting in Supabase.
 */
export async function sendOtp(email: string) {
  const emailHash = hashEmail(email)
  const existing = await findUserByEmailHash(emailHash)

  const intent: OtpPurpose = existing ? 'login' : 'signup'
  const { expiresIn } = await issueOtp(email, intent)

  return { success: true as const, expiresIn, maskedEmail: maskEmail(email), intent }
}

export async function verifyOtp(email: string, code: string) {
  const supabase = getSupabaseAdmin()
  const emailHash = hashEmail(email)

  // Whichever purpose has a live code for this email — the client
  // doesn't resend intent on verify, so we accept either.
  const { data: pending, error: pendingError } = await supabase
    .from('otp_codes')
    .select('purpose')
    .eq('email_hash', emailHash)
    .in('purpose', ['login', 'signup'])
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (pendingError) throw new ApiError(500, 'Failed to look up your verification code', 'otp_lookup_failed')
  if (!pending) throw ApiError.badRequest('No pending code for this email — request a new one', 'otp_not_found')

  await consumeOtp(email, pending.purpose as OtpPurpose, code)

  let user = await findUserByEmailHash(emailHash)
  const isNewUser = !user

  if (!user) {
    const { data: created, error: createError } = await supabase
      .from('users')
      .insert({
        email: encryptEmail(email),
        email_hash: emailHash,
        name: email.split('@')[0],
      })
      .select('*')
      .single()
    if (createError || !created) throw new ApiError(500, 'Failed to create your account', 'user_create_failed')
    user = created as DbUser
  }

  if (isNewUser) {
    sendWelcomeEmail(email, user.name).catch(() => {}) // deliver() already logs failures; this catch just stops an unhandled-rejection warning
  }

  // JWT claims are base64-encoded, not encrypted — but that's fine here:
  // this token is only ever held by the account owner's own browser, who
  // already knows their own email (they typed it to log in). The
  // encryption in the DB is about protecting against a DB breach/leak,
  // a different threat model than "can the account owner read their own
  // token" — so this is deliberately the plaintext, not user.email (ciphertext).
  const accessToken = signAccessToken({ sub: user.id, email, role: user.role })

  return {
    success: true as const,
    accessToken,
    mfaEnabled: user.mfa_enabled,
    user: {
      id: user.id,
      name: user.name,
      email,
      role: user.role,
      createdAt: user.created_at,
      actorId: user.actor_id ?? undefined,
      phone: user.phone ?? undefined,
      avatarUrl: user.avatar_url ?? undefined,
    },
  }
}

export async function forgotPassword(email: string) {
  const emailHash = hashEmail(email)
  const user = await findUserByEmailHash(emailHash)
  // Always behave the same whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (user) {
    await issueOtp(email, 'reset_password')
  }
  return { success: true as const, maskedEmail: maskEmail(email) }
}

export async function resetPassword(email: string, code: string, password: string) {
  await consumeOtp(email, 'reset_password', code)

  const supabase = getSupabaseAdmin()
  const passwordHash = await bcrypt.hash(password, 10)
  const emailHash = hashEmail(email)

  const user = await findUserByEmailHash(emailHash)
  if (!user) throw ApiError.notFound('No account found for this email')

  const { error } = await supabase.from('users').update({ password_hash: passwordHash }).eq('email_hash', emailHash)
  if (error) throw new ApiError(500, 'Failed to update your password', 'password_update_failed')

  sendPasswordResetSuccessEmail(email, user.name).catch(() => {})
  return { success: true as const }
}

// ─── Profile ──────────────────────────────────────────────────────
// Everything below requires an authenticated user (see requireAuth.ts)
// and operates on that user's own row — userId always comes from the
// verified JWT, never from a request body.

export async function getMe(userId: string) {
  const user = await findUserById(userId)
  if (!user) throw ApiError.notFound('User not found')
  return toPublicUser(user)
}

export interface UpdateMePatch {
  name?:      string
  avatarUrl?: string | null
  actorId?:   string
  phone?:     string
}

export async function updateMe(userId: string, patch: UpdateMePatch) {
  const supabase = getSupabaseAdmin()

  // Only touch columns actually present in the patch — a PATCH with just
  // { name: 'Ada' } shouldn't null out avatarUrl/actorId/phone.
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl
  if (patch.actorId !== undefined) dbPatch.actor_id = patch.actorId
  if (patch.phone !== undefined) dbPatch.phone = patch.phone

  const { data, error } = await supabase.from('users').update(dbPatch).eq('id', userId).select('*').single()
  if (error || !data) throw new ApiError(500, 'Failed to update your profile', 'user_update_failed')

  return toPublicUser(data as DbUser)
}

export async function deleteMe(userId: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) throw new ApiError(500, 'Failed to delete your account', 'user_delete_failed')
}

function toPublicUser(user: DbUser) {
  return {
    id:         user.id,
    name:       user.name,
    email:      decryptEmail(user.email),
    role:       user.role,
    mfaEnabled: user.mfa_enabled,
    avatarUrl:  user.avatar_url,
    actorId:    user.actor_id ?? undefined,
    phone:      user.phone ?? undefined,
    createdAt:  user.created_at,
  }
}
