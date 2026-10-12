'use client'

import { useState, useEffect, useCallback } from 'react'
import { getWorkspaceConfig } from '@/types/workspace'
import type { WorkspaceConfig } from '@/types/workspace'
import type { ActorId } from '@/types'

export const SESSION_STORAGE_KEY = 'auth_session'

/**
 * The native 'storage' event only fires in *other* tabs/windows, never in
 * the tab that made the localStorage write — so components that patch
 * `auth_session` directly (add-phone, mfa-setup, mfa-verify) need a way to
 * tell every `useWorkspace()` instance in *this* tab to re-read it too.
 * notifySessionUpdated() dispatches a same-tab custom event that the hook
 * below also listens for, alongside the cross-tab 'storage' event.
 */
const SESSION_UPDATED_EVENT = 'auth_session_updated'

export function notifySessionUpdated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT))
}

interface SessionData {
  email:       string
  name:        string
  accessToken: string
  mfaEnabled:  boolean
  role:        string
  /**
   * actorId is set server-side at signup/login and returned inside the
   * session payload. The frontend treats it as an opaque routing key —
   * it never surfaces in any UI copy.
   */
  actorId?:    ActorId
  /**
   * E.164 UK mobile number (e.g. "+447911123456"), set once the user
   * completes /add-phone. Absent/undefined means the account has no
   * verified phone yet — the post-login redirect chain (see
   * mfa-verify / mfa-setup handleDone) checks this and routes to
   * /add-phone instead of the destination when it's missing.
   */
  phone?:      string
  /** Cloudinary URL, set via /dashboard/profile. Absent means no avatar uploaded yet — falls back to initials. */
  avatarUrl?:  string
}

interface UseWorkspaceResult {
  isLoading:  boolean
  session:    SessionData | null
  workspace:  WorkspaceConfig | null
  /** Convenience: first name only, for greetings */
  firstName:  string
}

function readSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionData) : null
  } catch {
    return null
  }
}

/**
 * useWorkspace
 * ─────────────
 * Reads the auth session (set during verify-email / mfa-verify) and
 * resolves the WorkspaceConfig that drives dashboard rendering.
 *
 * Persistence: localStorage — deliberately, not sessionStorage, so the
 * session (and any drafts) survive a closed tab or a second tab on the
 * same browser. Also listens for the 'storage' event so logging out (or
 * editing your name) in one tab is reflected in every open tab.
 *
 * IMPORTANT: in production, the actorId should come from the backend's
 * /api/auth/me or /api/workspace endpoint (server-authoritative), NOT
 * trusted purely from client storage. This hook is written so swapping
 * the data source is a one-line change — see the API swap comment below.
 */
export function useWorkspace(): UseWorkspaceResult {
  const [session,   setSession]   = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    setSession(readSession())
  }, [])

  useEffect(() => {
    // ── API swap point ──────────────────────────────────────────
    // Replace this block with:
    //   const { data } = await fetch('/api/workspace/me').then(r => r.json())
    //   setSession(data.session)
    // ─────────────────────────────────────────────────────────────
    refresh()
    setIsLoading(false)

    function handleStorage(e: StorageEvent) {
      if (e.key === SESSION_STORAGE_KEY || e.key === null) refresh()
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener(SESSION_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(SESSION_UPDATED_EVENT, refresh)
    }
  }, [refresh])

  const workspace = session?.actorId
    ? getWorkspaceConfig(session.actorId)
    : null

  const firstName = session?.name?.split(' ')[0] ?? 'there'

  return { isLoading, session, workspace, firstName }
}