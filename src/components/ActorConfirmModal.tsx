'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import type { Actor, ActorSuggestion } from '@/types'

interface ActorConfirmModalProps {
  actor: Actor | null
  suggestion?: ActorSuggestion | null
  onConfirm: () => void
  onCancel:  () => void
}

/**
 * Builds the headline + supporting copy based on HOW the actor was
 * suggested, so the user understands why they're being asked —
 * rather than one generic message for every case.
 *
 *  - explicit (confidence 0.9, not corrected): user's own words
 *  - fuzzy (wasCorrected: true): typo-corrected guess
 *  - inferred (confidence ~0.6): guessed from their stated goal, not
 *    anything actor-related they typed
 */
function getConfirmCopy(actor: Actor, suggestion?: ActorSuggestion | null) {
  if (!suggestion) {
    return {
      headline: `You're a ${actor.label}?`,
      detail: actor.description,
    }
  }

  if (suggestion.wasCorrected && suggestion.correctedFrom) {
    return {
      headline: `Did you mean ${actor.label}?`,
      detail: `We read "${suggestion.correctedFrom}" as ${actor.label.toLowerCase()} — ${actor.description.toLowerCase()}.`,
    }
  }

  if (suggestion.confidence >= 0.85) {
    return {
      headline: `You're a ${actor.label}?`,
      detail: actor.description,
    }
  }

  // Lower-confidence / goal-inferred
  return {
    headline: `Sounds like you might be a ${actor.label}`,
    detail: `Based on what you're trying to do — ${actor.description.toLowerCase()}. Let us know if that's not right.`,
  }
}

/**
 * ActorConfirmModal
 * ──────────────────
 * Shown when the user clicks the auto-detected actor suggestion chip,
 * or when an actor is inferred from their stated goal. Detection is
 * always a guess of some confidence — this is the explicit human
 * checkpoint before it's applied, since the wrong actor changes which
 * workspace template gets provisioned.
 */
export function ActorConfirmModal({ actor, suggestion, onConfirm, onCancel }: ActorConfirmModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  // Focus the primary action on open, and support Escape to dismiss —
  // treats this as a real modal rather than a styled div.
  useEffect(() => {
    if (!actor) return

    confirmBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actor, onCancel])

  if (!actor) return null

  const { headline, detail } = getConfirmCopy(actor, suggestion)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="actor-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          'w-full max-w-[360px] rounded-2xl p-6',
          'bg-[#141C30] border border-white/16',
          'shadow-[0_24px_64px_rgba(0,0,0,0.6)]'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{actor.emoji}</span>
          <div>
            <p id="actor-confirm-title" className="text-[#E8F0FF] font-semibold text-base">
              {headline}
            </p>
            <p className="text-[#5A6A8A] text-sm mt-0.5">{detail}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'flex-1 py-2.5 rounded-[10px] text-sm font-medium',
              'bg-white/5 text-[#5A6A8A] hover:bg-white/10 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
            )}
          >
            Not quite
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              'flex-1 py-2.5 rounded-[10px] text-sm font-semibold',
              'bg-[#135BEC] text-white hover:bg-[#2A6BF0] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135BEC]',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-[#141C30]'
            )}
          >
            Yes, that's me
          </button>
        </div>
      </div>
    </div>
  )
}