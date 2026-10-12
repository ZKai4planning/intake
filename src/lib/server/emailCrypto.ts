import crypto from 'node:crypto'
import { env } from './env'

/**
 * Blind-index pattern for storing emails: encrypted for storage/display,
 * plus a separate one-way hash column for equality lookups (`WHERE
 * email_hash = ?`) — since AES-GCM uses a random IV per call, the same
 * email encrypts to different ciphertext every time, so the encrypted
 * column itself can never be looked up directly or used as a unique
 * constraint. `email_hash` is what the unique constraint/index sit on
 * instead; the encrypted column exists purely to get the plaintext
 * back for display.
 *
 *   encryptEmail(email)  -> ciphertext, store in `email` columns
 *   decryptEmail(cipher) -> plaintext, only when actually displaying it
 *   hashEmail(email)     -> deterministic, store in `email_hash`, used for lookups
 *
 * Both keys must be 32 bytes. Generate with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // recommended for GCM

function getEncryptionKey(): Buffer {
  const hex = env.security.emailEncryptionKey
  if (!hex) throw new Error('EMAIL_ENCRYPTION_KEY is not set')
  const key = Buffer.from(hex, 'hex')
  if (key.length !== 32) throw new Error('EMAIL_ENCRYPTION_KEY must be 32 bytes (64 hex characters)')
  return key
}

function getHashSecret(): string {
  if (!env.security.emailHashSecret) throw new Error('EMAIL_HASH_SECRET is not set')
  return env.security.emailHashSecret
}

/** Trim + lowercase before either hashing or encrypting, so "Person@X.com" and "person@x.com" hash identically and both decrypt to the same normalized value used everywhere else. */
function normalize(email: string): string {
  return email.trim().toLowerCase()
}

/** AES-256-GCM, random IV per call. Output: base64(iv).base64(authTag).base64(ciphertext) — self-contained, no separate column needed for the IV/tag. */
export function encryptEmail(email: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const normalized = normalize(email)
  const ciphertext = Buffer.concat([cipher.update(normalized, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join('.')
}

export function decryptEmail(encrypted: string): string {
  const key = getEncryptionKey()
  const [ivB64, tagB64, ciphertextB64] = encrypted.split('.')
  if (!ivB64 || !tagB64 || !ciphertextB64) throw new Error('Malformed encrypted email value')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))

  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, 'base64')), decipher.final()])
  return plaintext.toString('utf8')
}

/** Deterministic HMAC-SHA256 — one-way, used only for equality lookups. Never decrypted; if you need the plaintext back, that's what decryptEmail is for. */
export function hashEmail(email: string): string {
  return crypto.createHmac('sha256', getHashSecret()).update(normalize(email)).digest('hex')
}
