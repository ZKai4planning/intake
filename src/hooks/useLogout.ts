'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { clearLocalUserData } from '@/lib/clearLocalUserData'

/**
 * useLogout
 * ──────────
 * Calls the real logout endpoint (clears the httpOnly accessToken
 * cookie server-side) and wipes every locally-cached, user-scoped key
 * — not just the session, but reports/cart/drafts/avatar too, so the
 * next person to use this browser (or this same person logging into a
 * different account) doesn't see leftover data from this session. See
 * lib/clearLocalUserData.ts for the full list of what gets cleared.
 *
 * The local wipe always happens, even if the server call fails — a
 * failed network request shouldn't leave the browser looking logged in
 * with someone else's cached data still sitting there.
 */
export function useLogout() {
  const router = useRouter()
  const { show } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    let serverLogoutFailed = false
    try {
      const { error } = await logout()
      if (error) serverLogoutFailed = true
    } catch {
      serverLogoutFailed = true
    } finally {
      clearLocalUserData()
      setIsLoggingOut(false)
      if (serverLogoutFailed) {
        show("Signed out on this device, but we couldn't reach the server to end the session remotely.", 'error')
      }
      router.push('/login')
    }
  }

  return { handleLogout, isLoggingOut }
}
