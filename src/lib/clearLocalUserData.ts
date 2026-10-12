'use client'

/**
 * Every localStorage key that holds data for "whoever is currently
 * using this browser" rather than being genuinely global. None of
 * these are scoped by user ID today — they're flat keys — which means
 * without this, a second person logging in on the same browser (or the
 * same person logging into a *different* account) sees the previous
 * user's cached reports, cart, drafts, and avatar.
 *
 * Add new client-only caches here as they're introduced — it's the one
 * place this list needs to stay current.
 */
export const LOCAL_USER_DATA_KEYS = [
  'auth_session',            // hooks/Useworkspace.ts — SESSION_STORAGE_KEY
  'profile.avatarDataUrl',   // legacy client-only avatar cache — superseded by the real avatarUrl from /api/auth/me, cleared here in case it's still lingering from before that existed
  'agentz_conversations',    // lib/agentZ.ts
  'eligibility_records',     // lib/eligibility.ts
  'dashboard_projects',      // lib/projects.ts
  'report_cart',             // lib/cart.ts
  'pending_reports',         // lib/reportStorage.ts
] as const

/**
 * Wipes every locally-cached, user-scoped key. Safe to call even if
 * some keys were never set (removeItem on a missing key is a no-op).
 *
 * When to call this:
 *   - On logout (see useLogout.ts) — always, regardless of who's about
 *     to use the browser next.
 *   - Right before writing a NEW session, if the incoming account is a
 *     different email than whatever was cached before (see
 *     VerifyEmailContent.tsx) — covers the case where someone logs
 *     into a second account without explicitly logging out of the
 *     first (e.g. session expired silently, or they just typed a
 *     different email).
 *   - On account deletion (see DeleteAccountSection.tsx).
 */
export function clearLocalUserData() {
  if (typeof window === 'undefined') return

  for (const key of LOCAL_USER_DATA_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Storage disabled/unavailable (private browsing edge cases, etc.)
      // — nothing more we can do, and nothing worth surfacing to the user.
    }
  }
}

/** The email on the currently-cached session, if any — used to detect a different account logging in on the same browser. */
export function getCachedSessionEmail(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem('auth_session')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.email === 'string' ? parsed.email : null
  } catch {
    return null
  }
}
