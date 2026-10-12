'use client'

import { useRouter } from 'next/navigation'
import type { ActorId } from '@/types'

/**
 * useAuthRedirect
 * ─────────────────
 * Single source of truth for "take the person into the app" — used by
 * the hero search, the services grid/strip, and the persona cards.
 *
 *   logged in      → returnTo (defaults to /dashboard)
 *   not logged in  → /login?returnTo=...&actor=... — the existing
 *                     login → verify-email → mfa chain already honours
 *                     `returnTo` end to end, it just wasn't being set
 *                     to anything other than the default before.
 *
 * Passing a returnTo lets a specific entry point (e.g. "Apply for this
 * service") land the person straight on the eligibility-check step
 * (/dashboard/new/intent) instead of the bare dashboard.
 *
 * Session check is a plain localStorage read at click time (not a
 * subscription) — this only needs a yes/no when the button is pressed.
 */
export function useAuthRedirect() {
  const router = useRouter()

  return function goToApp(actorId: ActorId | null = null, returnTo: string = '/dashboard') {
    let isLoggedIn = false
    try {
      isLoggedIn = !!localStorage.getItem('auth_session')
    } catch {
      isLoggedIn = false
    }

    if (isLoggedIn) {
      router.push(returnTo)
      return
    }

    const params = new URLSearchParams({ returnTo })
    if (actorId) params.set('actor', actorId)
    router.push(`/login?${params.toString()}`)
  }
}
