'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuestionFlow } from '@/hooks/useQuestionFlow'
import { useInlineAgent } from '@/hooks/useInlineAgent'
import { useToast } from '@/components/ui/Toast'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { QuestionCard } from './QuestionCard'
import { UpsellBanner } from './UpsellBanner'
import { ActorRevisionBanner } from './ActorRevisionBanner'
import type { WorkspaceTier } from '@/types/workspace'
import type { ActorId } from '@/types'

interface IntakeFormProps {
  tier: WorkspaceTier
  /**
   * The actor resolved by IntentConfirmation before this form was shown.
   * Optional so existing callers (e.g. /dev/questions) keep working
   * without wiring the intent flow in — contradiction detection simply
   * stays off when this is omitted.
   */
  resolvedActorId?: ActorId | null
  /** Called when the user accepts a mid-form actor revision suggestion. */
  onActorRevised?: (actorId: ActorId) => void
  /** Return `false` (or resolve to it) if the submit failed to persist, so the form can warn instead of closing. */
  onSubmit?: (payload: { answers: ReturnType<typeof useQuestionFlow>['answers'] }) => boolean | void | Promise<boolean | void>
  onBookConsultation?: () => void
  /** "← Previous" — goes back to the step before this form (e.g. dashboard/intent). */
  onBack?: () => void
  /**
   * Saves the current answers without submitting. Optional — when omitted
   * the Save Draft button still shows but just no-ops, so callers can wire
   * it up to /api/intake/draft whenever that endpoint is ready. Return
   * `false` if the save failed to persist, so the form can warn instead
   * of showing "Draft saved".
   */
  onSaveDraft?: (payload: { answers: ReturnType<typeof useQuestionFlow>['answers'] }) => boolean | void | Promise<boolean | void>
  /** Seeds the form with previously-saved answers when resuming a draft. */
  initialAnswers?: ReturnType<typeof useQuestionFlow>['answers']
}

/**
 * IntakeForm
 * ───────────
 * The actual tiered question flow rendered inside the dashboard.
 * Pulls the right Question_Module_Bank subset for the workspace tier
 * via useQuestionFlow, renders each row with QuestionCard (QuestionField +
 * inline agent), and shows:
 *
 *  - UpsellBanner whenever a "Don't know"/"Unsure" answer is given
 *  - ActorRevisionBanner whenever an answer contradicts the actor that
 *    was resolved in IntentConfirmation before this form loaded (e.g.
 *    picking "Change of use" after being set up as a homeowner)
 *
 * The AI agent is NOT a separate chat window — it's a per-question panel
 * (see QuestionCard / InlineAgentPanel) anchored to whichever row it was
 * opened from, driven by useInlineAgent.
 *
 * API integration point:
 *   onSubmit receives the full answer map — POST it to
 *   /api/intake/submit { tier, answers, upsellEvents }
 */
export function IntakeForm({ tier, resolvedActorId, onActorRevised, onSubmit, onBookConsultation, onBack, onSaveDraft, initialAnswers }: IntakeFormProps) {
  const {
    questions, answers, setAnswer, upsellEvents,
    progress, answeredCount, totalCount, canSubmit,
    contradiction, dismissContradiction, clearContradiction,
  } = useQuestionFlow(tier, resolvedActorId, initialAnswers)

  const { openRowId, threads, isThinking, toggleRow, sendMessage } = useInlineAgent()
  const { show } = useToast()
  const { setDirty } = useUnsavedChangesGuard()
  const [draftSaved, setDraftSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const answersRef = useRef(answers)
  answersRef.current = answers

  // Mark the form dirty the moment an answer changes after the initial
  // render — resuming a draft seeds `answers` without that counting as
  // "unsaved". Cleared again on a successful save/submit below.
  const hasMounted = useRef(false)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    setDirty(true)
  }, [answers, setDirty])

  // ── Autosave ────────────────────────────────────────────────────
  // Silent version of handleSaveDraft — no toast, just a small inline
  // status indicator, so it doesn't interrupt the person while they're
  // still answering. Reuses the same onSaveDraft the manual button uses,
  // so wiring one persistence call covers both.
  const runAutosave = useCallback(async () => {
    if (!onSaveDraft || isSaving) return
    setAutosaveStatus('saving')
    try {
      const result = await onSaveDraft({ answers: answersRef.current })
      if (result === false) {
        setAutosaveStatus('error')
        return
      }
      setDirty(false)
      setAutosaveStatus('saved')
    } catch {
      setAutosaveStatus('error')
    }
  }, [onSaveDraft, isSaving, setDirty])

  // Debounced autosave: fires a couple seconds after the person stops
  // changing answers, so a draft exists even if they never touch
  // "Save Draft" or close the tab without meaning to.
  useEffect(() => {
    if (!hasMounted.current || !onSaveDraft) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => { runAutosave() }, 2500)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [answers, onSaveDraft, runAutosave])

  // Safety net: if the tab is backgrounded or closed, flush an autosave
  // immediately instead of waiting out the debounce — this is what
  // actually catches "closed the tab without saving".
  useEffect(() => {
    if (!onSaveDraft) return
    function handleVisibility() {
      if (document.visibilityState === 'hidden') runAutosave()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [onSaveDraft, runAutosave])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    const result = await onSubmit?.({ answers })
    if (result === false) {
      show("Couldn't submit your application — please try again.", 'error')
      return
    }
    setDirty(false)
  }

  function handleAcceptRevision() {
    if (!contradiction) return
    onActorRevised?.(contradiction.impliedActorId)
    clearContradiction()
  }

  async function handleSaveDraft() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setIsSaving(true)
    const result = await onSaveDraft?.({ answers })
    setIsSaving(false)
    if (result === false) {
      show("Couldn't save your draft — check your connection and try again.", 'error')
      return
    }
    setDirty(false)
    setDraftSaved(true)
    setAutosaveStatus('idle')
    show('Draft saved.', 'success')
    window.setTimeout(() => setDraftSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto space-y-6">

      {/* ── Progress header ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[12px] font-medium text-[#A8B8D8]">
          {answeredCount} of {totalCount} answered
        </p>
        <p className="text-[12px] font-semibold text-[#135BEC]">{progress}%</p>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden -mt-4">
        <div
          className="h-full bg-[#135BEC] transition-all duration-300 rounded-full"
          style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(19,91,236,0.5)' }}
        />
      </div>

      {/* ── Actor revision banner ────────────────────────────── */}
      {contradiction && resolvedActorId && (
        <ActorRevisionBanner
          currentActorId={resolvedActorId}
          impliedActorId={contradiction.impliedActorId}
          onAccept={handleAcceptRevision}
          onDismiss={dismissContradiction}
        />
      )}

      {/* ── Upsell banner ─────────────────────────────────────── */}
      {upsellEvents.length > 0 && (
        <UpsellBanner
          events={upsellEvents}
          onBookConsultation={() => onBookConsultation?.()}
        />
      )}

      {/* ── Question cards ───────────────────────────────────── */}
      <div className="space-y-4">
        {questions.map(q => (
          <QuestionCard
            key={q.rowId}
            question={q}
            answer={answers[q.rowId]}
            onChange={v => setAnswer(q.rowId, v)}
            isAgentOpen={openRowId === q.rowId}
            agentMessages={threads[q.rowId] ?? []}
            isAgentThinking={isThinking && openRowId === q.rowId}
            onToggleAgent={() =>
              toggleRow({
                rowId: q.rowId,
                field: q.field,
                guidance: q.guidance,
                currentValue: answers[q.rowId]?.value ?? null,
              })
            }
            onSendToAgent={text =>
              sendMessage(
                {
                  rowId: q.rowId,
                  field: q.field,
                  guidance: q.guidance,
                  currentValue: answers[q.rowId]?.value ?? null,
                },
                text
              )
            }
          />
        ))}
      </div>

      {/* ── Footer actions: Previous / Save Draft / Next ────────── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 rounded-[12px] text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] transition-colors inline-flex items-center gap-1.5"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-3">
          {autosaveStatus !== 'idle' && !isSaving && !draftSaved && (
            <span
              className="text-[12px] text-[#5A6A8A] select-none"
              role="status"
              aria-live="polite"
            >
              {autosaveStatus === 'saving' && 'Autosaving…'}
              {autosaveStatus === 'saved'  && 'Autosaved ✓'}
              {autosaveStatus === 'error'  && (
                <span className="text-[#F87171]">Autosave failed</span>
              )}
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-3 rounded-[12px] text-[13.5px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : draftSaved ? 'Draft saved ✓' : 'Save Draft'}
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={
              canSubmit
                ? 'px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)]'
                : 'px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
            }
          >
            {canSubmit ? 'Next →' : 'Complete required fields'}
          </button>
        </div>
      </div>
    </form>
  )
}