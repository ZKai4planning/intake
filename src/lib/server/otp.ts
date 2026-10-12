import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from './supabaseAdmin'
import { env } from './env'
import { ApiError } from './apiError'
import { encryptEmail, hashEmail } from './emailCrypto'
import { sendOtpEmail } from './email/emailService'

export type OtpPurpose = 'login' | 'signup' | 'reset_password'

function generateCode(): string {
  // 6-digit numeric code, zero-padded.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return email
  const visible = user.slice(0, 1)
  return `${visible}${'*'.repeat(Math.max(user.length - 1, 1))}@${domain}`
}

/**
 * Creates and "sends" a fresh OTP for (email, purpose), invalidating any
 * still-open codes for that pair first (one live code at a time).
 * All lookups go via email_hash (the blind index) — see emailCrypto.ts.
 * The plaintext `email` parameter is only ever used for hashing,
 * encrypting-for-storage, and delivering the email; nothing here
 * queries the DB by plaintext.
 */
export async function issueOtp(email: string, purpose: OtpPurpose): Promise<{ expiresIn: number }> {
  const supabase = getSupabaseAdmin()
  const emailHash = hashEmail(email)

  const { error: invalidateError } = await supabase
    .from('otp_codes')
    .update({ consumed_at: new Date().toISOString() }) // invalidate old codes
    .eq('email_hash', emailHash)
    .eq('purpose', purpose)
    .is('consumed_at', null)
  if (invalidateError) throw new ApiError(500, 'Failed to prepare a new code', 'otp_invalidate_failed')

  const code = generateCode()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + env.otpTtlSeconds * 1000).toISOString()

  const { error: insertError } = await supabase.from('otp_codes').insert({
    email: encryptEmail(email),
    email_hash: emailHash,
    code_hash: codeHash,
    purpose,
    expires_at: expiresAt,
  })
  if (insertError) throw new ApiError(500, 'Failed to create a verification code', 'otp_create_failed')

  await deliverOtpEmail(email, code, purpose)

  return { expiresIn: env.otpTtlSeconds }
}

/**
 * Verifies a submitted code for (email, purpose). Throws ApiError on any
 * failure (expired, wrong code, too many attempts, none pending).
 * Marks the code consumed on success so it can't be replayed.
 */
export async function consumeOtp(email: string, purpose: OtpPurpose, submittedCode: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const emailHash = hashEmail(email)

  const { data: otp, error } = await supabase
    .from('otp_codes')
    .select('id, code_hash, expires_at, attempts')
    .eq('email_hash', emailHash)
    .eq('purpose', purpose)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new ApiError(500, 'Failed to look up your verification code', 'otp_lookup_failed')

  if (!otp) throw ApiError.badRequest('No pending code for this email — request a new one', 'otp_not_found')
  if (new Date(otp.expires_at) < new Date()) throw ApiError.badRequest('This code has expired — request a new one', 'otp_expired')
  if (otp.attempts >= env.otpMaxAttempts) {
    throw ApiError.tooMany('Too many incorrect attempts — request a new code', 'otp_locked')
  }

  const matches = await bcrypt.compare(submittedCode, otp.code_hash)
  if (!matches) {
    await supabase.from('otp_codes').update({ attempts: otp.attempts + 1 }).eq('id', otp.id)
    throw ApiError.badRequest('Incorrect code', 'otp_incorrect')
  }

  await supabase.from('otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', otp.id)
}

/**
 * Real email delivery via Brevo — see email/emailService.ts. Falls
 * back to logging the code if BREVO_API_KEY isn't set (or the send
 * fails), so local dev still works end-to-end with zero email setup.
 */
async function deliverOtpEmail(email: string, code: string, purpose: OtpPurpose): Promise<void> {
  await sendOtpEmail(email, code, purpose, Math.round(env.otpTtlSeconds / 60))
}
