'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { IntentConfirmation } from '@/components/dashboard/intent/IntentConfirmation'
import { createDraftId } from '@/lib/projects'
import { claimReportIntoDraft } from '@/lib/reportToIntake'
import { claimIntakeIntoDraft } from '@/lib/intake/handoff'
import type { ActorId } from '@/types'

/**
 * /dashboard/new/intent
 * ───────────────────────
 * Step 1 of the application flow. Resolves which actor (workspace tier)
 * this specific application is for — may differ from the account's
 * default workspace (e.g. a homeowner-tier account checking a rental
 * they just bought) — then hands off to a freshly-minted draft URL.
 *
 * A draft id is generated client-side before navigating so the next
 * URL is stable and resumable from the very first render, even before
 * anything has been saved.
 *
 * Arriving with ?report=<id> means this is the chat funnel converting:
 * someone built a free report pre-login and just registered. Rather
 * than asking the intent questions again, claim that report straight
 * into a prefilled draft and skip to the intake form. Falls through to
 * the normal IntentConfirmation flow if the report can't be found
 * (wrong browser, expired, already claimed).
 */
export default function NewApplicationIntentPage() {
  const { guardedNavigate } = useUnsavedChangesGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('report')
  // Arriving with ?intake=1 means the person just finished the /start chat and
  // verified their email — turn what they told us into a prefilled draft.
  const fromIntake = searchParams.get('intake') === '1'

  const [claiming, setClaiming] = useState(!!reportId || fromIntake)

  useEffect(() => {
    if (!fromIntake || reportId) return
    let cancelled = false
    ;(async () => {
      const claimed = await claimIntakeIntoDraft()
      if (cancelled) return
      if (claimed) {
        router.replace(`/dashboard/new/${claimed.draftId}?actor=${claimed.actorId}`)
        return
      }
      // Nothing to claim (different browser, expired) — normal intent questions.
      setClaiming(false)
    })()
    return () => { cancelled = true }
  }, [fromIntake, reportId, router])

  useEffect(() => {
    if (!reportId) return
    let cancelled = false
    const checkout = searchParams.get('checkout') === '1'
    ;(async () => {
      const claimed = await claimReportIntoDraft(reportId, { forCheckout: checkout })
      if (cancelled) return
      if (claimed) {
        if (checkout) {
          router.replace(`/dashboard/new/${claimed.draftId}/checkout?fromReport=${reportId}`)
        } else {
          router.replace(`/dashboard/new/${claimed.draftId}?actor=${claimed.actorId}`)
        }
        return
      }
      // Report not found — fall back to the normal intent questions.
      setClaiming(false)
    })()
    return () => { cancelled = true }
  }, [reportId, router, searchParams])

  function handleResolved(actorId: ActorId) {
    const draftId = createDraftId()
    guardedNavigate(`/dashboard/new/${draftId}?actor=${actorId}`)
  }

  if (claiming) {
    return (
      <p className="text-[13px] text-[#5A6A8A] text-center py-16">
        {fromIntake ? 'Setting up your project…' : 'Bringing your report over…'}
      </p>
    )
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <button
        onClick={() => guardedNavigate('/dashboard')}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-6 inline-flex items-center gap-1.5"
      >
        ← Back to dashboard
      </button>
      <IntentConfirmation onResolved={handleResolved} />
    </div>
  )
}
