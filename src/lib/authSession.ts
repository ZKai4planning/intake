import type { ActorId } from '@/types'

/**
 * authSession.ts
 * ────────────────
 * Small shared reader for the 'auth_session' localStorage record set
 * during verify-email/mfa-verify (see hooks/Useworkspace.ts, which owns
 * the subscribed/reactive version of this for UI). This copy is a
 * plain, non-reactive read — for spots (report ownership stamping,
 * watermarking, download gates) that just need a yes/no snapshot at
 * the moment they run, not a live subscription.
 *
 * API swap point: once there's a backend, ownership/session checks
 * like isCurrentOwner() below should be re-verified server-side
 * (e.g. against a signed download URL) rather than trusted from
 * client storage alone.
 */

const SESSION_STORAGE_KEY = 'auth_session'

export interface AuthSessionSnapshot {
  email:       string
  name:        string
  accessToken: string
  mfaEnabled:  boolean
  role:        string
  actorId?:    ActorId
}

export function readAuthSession(): AuthSessionSnapshot | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthSessionSnapshot) : null
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  try {
    return !!localStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    return false
  }
}

/** Case-insensitive email match — the only ownership signal we have client-side. */
export function isCurrentOwner(ownerEmail: string | undefined): boolean {
  if (!ownerEmail) return true // unclaimed — nothing to conflict with yet
  const session = readAuthSession()
  if (!session) return false
  return session.email.trim().toLowerCase() === ownerEmail.trim().toLowerCase()
}
