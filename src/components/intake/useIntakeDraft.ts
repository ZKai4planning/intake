'use client'

import { useCallback, useEffect, useState } from 'react'
import { clearIntake, emptyDraft, hasProgress, readIntake, writeIntake } from '@/lib/intake/storage'
import type { IntakeDraft } from '@/lib/intake/types'

/**
 * Holds the whole intake and saves it to localStorage on every change, so a
 * refresh (or the trip through email OTP) never loses what the person typed.
 * A previous unfinished intake is offered back as "Continue where you left
 * off?" rather than loaded silently.
 */
export function useIntakeDraft() {
  const [draft, setDraft] = useState<IntakeDraft>(emptyDraft)
  const [hydrated, setHydrated] = useState(false)
  const [resumable, setResumable] = useState<IntakeDraft | null>(null)

  useEffect(() => {
    const saved = readIntake()
    if (saved && hasProgress(saved) && !saved.claimedDraftId) setResumable(saved)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && hasProgress(draft)) writeIntake({ ...draft, savedAt: new Date().toISOString() })
  }, [draft, hydrated])

  const patch = useCallback((p: Partial<IntakeDraft>) => setDraft(d => ({ ...d, ...p })), [])

  const resume = useCallback(() => {
    if (resumable) setDraft(resumable)
    setResumable(null)
  }, [resumable])

  const startFresh = useCallback(() => {
    clearIntake()
    setDraft(emptyDraft())
    setResumable(null)
  }, [])

  return { draft, patch, resumable, resume, startFresh }
}
