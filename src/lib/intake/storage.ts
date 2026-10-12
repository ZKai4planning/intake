import type { IntakeDraft } from './types'

/**
 * Persistence for the intake chat.
 *
 * Why localStorage (not the server): the person hasn't logged in yet, and
 * the whole point is that their answers survive (a) a refresh, and
 * (b) the trip through login → OTP → dashboard. Everything here is
 * best-effort — private mode / quota errors are swallowed and the chat
 * simply won't resume.
 */

const KEY = 'intake_draft_v1'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // a week — long enough to finish sign-up from the email later

export function emptyDraft(): IntakeDraft {
  return {
    v: 1,
    savedAt: new Date().toISOString(),
    step: 'details',
    details: { fullName: '', email: '', mobile: '', role: 'homeowner' },
    property: null,
    planning: { categoryId: null, describe: '', routeKnown: 'no' },
    more: { subtypeId: null, answers: {} },
  }
}

export function readIntake(): IntakeDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as IntakeDraft
    if (parsed?.v !== 1 || !parsed.details || !parsed.planning || !parsed.more) return null
    if (Date.now() - new Date(parsed.savedAt).getTime() > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeIntake(draft: IntakeDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    // ignore — resume just won't survive a refresh
  }
}

export function clearIntake(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/** True once there's anything worth offering to resume. */
export function hasProgress(draft: IntakeDraft): boolean {
  return !!(draft.details.fullName.trim() || draft.details.email.trim() || draft.property || draft.planning.categoryId)
}

/** The email from a saved intake — used to pre-fill login. Null if none/expired. */
export function getIntakeEmail(): string | null {
  const d = readIntake()
  const email = d?.details.email.trim()
  return email ? email : null
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** "jane.smith@email.com" → "j*********@email.com" (matches the server's masking). */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return email
  return `${user.slice(0, 1)}${'*'.repeat(Math.max(user.length - 1, 1))}@${domain}`
}

/**
 * Loose phone check — optional field, so only reject obvious junk.
 * Accepts "+44 7123 456789", "07123 456789", "(020) 7946 0000" etc.
 */
export function isPlausiblePhone(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return true
  if (!/^[+\d][\d\s()\-.]*$/.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}
