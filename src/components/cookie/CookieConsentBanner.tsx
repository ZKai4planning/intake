'use client'

import { CookieConsent } from './CookieConsent'
import type { ConsentState } from './cookie-consent.types'

/**
 * CookieConsentBanner
 * ────────────────────
 * Client boundary wrapper. Import THIS in app/layout.tsx — not CookieConsent directly.
 * Keeps the layout a pure Server Component while handling the onConsent callback here.
 */
export function CookieConsentBanner() {
  function handleConsent(consent: ConsentState) {
    // Persist however you prefer — js-cookie, a server action, etc.
    try {
      document.cookie = `cookie_consent=${JSON.stringify(consent)};max-age=${60 * 60 * 24 * 365};path=/;SameSite=Lax`
    } catch {
      // Cookie write failed (e.g. SSR context) — safe to ignore
    }
  }

  return <CookieConsent onConsent={handleConsent} />
}