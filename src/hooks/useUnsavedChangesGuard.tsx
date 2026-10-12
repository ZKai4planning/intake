'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface GuardContextValue {
  isDirty: boolean
  /** Call whenever the form's answers change (dirty) or are saved/submitted (clean). */
  setDirty: (dirty: boolean) => void
  /**
   * Navigate to `href`, asking for confirmation first if there are
   * unsaved changes. Use this instead of router.push/<Link> for any
   * navigation that could abandon in-progress form answers.
   */
  guardedNavigate: (href: string) => void
}

const GuardContext = createContext<GuardContextValue | null>(null)

/**
 * UnsavedChangesGuardProvider
 * ─────────────────────────────
 * Mounted once at the app root. Two things it protects against:
 *
 *  1. In-app navigation (sidebar links, "Back to dashboard", etc.) —
 *     guardedNavigate() confirms before leaving if isDirty is true.
 *  2. Tab close / refresh / URL bar navigation — a native
 *     `beforeunload` prompt fires under the same condition.
 *
 * IntakeForm is the only current consumer that sets isDirty; every
 * other page gets a no-op guard (isDirty stays false) automatically.
 */
export function UnsavedChangesGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isDirty, setIsDirty] = useState(false)
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const setDirty = useCallback((dirty: boolean) => setIsDirty(dirty), [])

  const guardedNavigate = useCallback((href: string) => {
    if (isDirtyRef.current) {
      const shouldLeave = window.confirm(
        'You have unsaved answers on this application. Leave without saving?\n\n' +
        'Choose Cancel and use "Save draft" first if you want to keep them.'
      )
      if (!shouldLeave) return
      setIsDirty(false)
    }
    router.push(href)
  }, [router])

  return (
    <GuardContext.Provider value={{ isDirty, setDirty, guardedNavigate }}>
      {children}
    </GuardContext.Provider>
  )
}

/** Always safe to call — pages/components with no unsaved-work concept just get inert defaults. */
export function useUnsavedChangesGuard(): GuardContextValue {
  const ctx = useContext(GuardContext)
  const router = useRouter()
  if (ctx) return ctx
  return { isDirty: false, setDirty: () => {}, guardedNavigate: (href: string) => router.push(href) }
}
