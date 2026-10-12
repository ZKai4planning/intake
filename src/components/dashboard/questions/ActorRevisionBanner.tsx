'use client'

import { cn } from '@/lib/cn'
import { getActor } from '@/lib/actors'
import type { ActorId } from '@/types'

interface ActorRevisionBannerProps {
  currentActorId: ActorId
  impliedActorId: ActorId
  onAccept: () => void
  onDismiss: () => void
}

/**
 * ActorRevisionBanner
 * ──────────────────────
 * The actor resolved before the form doesn't have to be final — a later
 * answer (e.g. "Change of use" on the purpose question, after being set
 * up as a homeowner) can contradict it. This banner surfaces that
 * contradiction inline, right where it was detected, rather than silently
 * keeping the wrong workspace tier for the rest of the form.
 */
export function ActorRevisionBanner({
  currentActorId, impliedActorId, onAccept, onDismiss,
}: ActorRevisionBannerProps) {
  const current = getActor(currentActorId)
  const implied = getActor(impliedActorId)
  if (!current || !implied) return null

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-[12px] mb-4',
        'bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.28)]',
        'animate-[fadeIn_0.2s_ease-out]'
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-[#F59E0B] text-base shrink-0 mt-0.5" aria-hidden="true">⚠</span>

      <div className="flex-1">
        <p className="text-[13px] text-[#E8F0FF] font-medium leading-snug mb-0.5">
          This answer sounds more like a {implied.label.toLowerCase()}, not a {current.label.toLowerCase()}.
        </p>
        <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
          We can switch your questions and tools to match — nothing you've answered so far will be lost.
        </p>

        <div className="flex items-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={onAccept}
            className="px-3 py-1.5 rounded-[7px] text-[12px] font-semibold bg-[#F59E0B] text-[#050A12] hover:bg-[#FBBF24] transition-colors"
          >
            Switch to {implied.label} →
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-[7px] text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
          >
            No, keep {current.label.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
