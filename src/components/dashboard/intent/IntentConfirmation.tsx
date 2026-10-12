// 'use client'

// import { useState } from 'react'
// import { cn } from '@/lib/cn'
// import { useIntentFlow } from '@/hooks/useIntentFlow'
// import { ACTORS, getActor } from '@/lib/actors'
// import type { ActorId } from '@/types'

// interface IntentConfirmationProps {
//   /** Called once the actor is resolved and confirmed (either automatically or via manual override). */
//   onResolved: (actorId: ActorId) => void
// }

// /**
//  * IntentConfirmation
//  * ────────────────────
//  * Runs BEFORE the tiered IntakeForm. Asks 2–3 goal-intent questions
//  * ("what are you trying to do", "what's your relationship to the
//  * property", and conditionally "what's your role") to infer the actor,
//  * rather than asking the user to self-select an "I am a…" pill.
//  *
//  * Ends with a confirmation card: "We'll set this up as a {actor}" with
//  * an explicit Yes/Change-it step — so the resolution is always confirmed,
//  * never silently assumed. "Change it" reveals the full manual pill list
//  * as a fallback.
//  */
// export function IntentConfirmation({ onResolved }: IntentConfirmationProps) {
//   const {
//     currentQuestion, selectedValue, answer, goBack, canGoBack,
//     resolution, isComplete, stepIndex, totalStepsEstimate,
//   } = useIntentFlow()

//   const [showManualOverride, setShowManualOverride] = useState(false)

//   if (showManualOverride || (isComplete && !resolution.actorId)) {
//     return (
//       <ManualActorPicker
//         suggested={resolution.actorId}
//         onPick={onResolved}
//         onBack={() => setShowManualOverride(false)}
//         showBack={showManualOverride}
//       />
//     )
//   }

//   if (isComplete && resolution.actorId) {
//     return (
//       <ResolutionConfirm
//         actorId={resolution.actorId}
//         confidence={resolution.confidence}
//         onConfirm={() => onResolved(resolution.actorId as ActorId)}
//         onChange={() => setShowManualOverride(true)}
//       />
//     )
//   }

//   if (!currentQuestion) return null

//   return (
//     <div className="max-w-[480px] mx-auto">
//       {/* ── Step indicator ─────────────────────────────────── */}
//       <div className="flex items-center gap-2 mb-5">
//         {Array.from({ length: totalStepsEstimate }).map((_, i) => (
//           <div
//             key={i}
//             className={cn(
//               'h-1.5 flex-1 rounded-full transition-colors',
//               i < stepIndex ? 'bg-[#135BEC]' : 'bg-white/[0.08]'
//             )}
//           />
//         ))}
//       </div>
//       <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
//         Question {stepIndex} of ~{totalStepsEstimate}
//       </p>

//       {/* ── Prompt ─────────────────────────────────────────── */}
//       <h2 className="font-display text-[22px] sm:text-[24px] font-normal text-[#E8F0FF] tracking-tight mb-2">
//         {currentQuestion.prompt}
//       </h2>
//       {currentQuestion.helper && (
//         <p className="text-[13px] text-[#5A6A8A] mb-6 leading-relaxed">{currentQuestion.helper}</p>
//       )}

//       {/* ── Options ────────────────────────────────────────── */}
//       <div className="space-y-2.5">
//         {currentQuestion.options.map(opt => (
//           <button
//             key={opt.value}
//             type="button"
//             onClick={() => answer(opt.value)}
//             className={cn(
//               'w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-left transition-all',
//               'border select-none',
//               selectedValue === opt.value
//                 ? 'bg-[rgba(19,91,236,0.1)] border-[#135BEC]'
//                 : 'bg-[#0F1525] border-white/[0.08] hover:border-white/[0.24]'
//             )}
//           >
//             {opt.emoji && <span className="text-[19px] shrink-0" aria-hidden="true">{opt.emoji}</span>}
//             <span className="text-[14px] font-medium text-[#E8F0FF]">{opt.label}</span>
//           </button>
//         ))}
//       </div>

//       {/* ── Back ───────────────────────────────────────────── */}
//       <div className="mt-6 flex items-center justify-between">
//         {canGoBack ? (
//           <button
//             type="button"
//             onClick={goBack}
//             className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] inline-flex items-center gap-1.5"
//           >
//             ← Back
//           </button>
//         ) : <span />}

//         <button
//           type="button"
//           onClick={() => setShowManualOverride(true)}
//           className="text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8] underline underline-offset-2"
//         >
//           I&rsquo;d rather just pick directly
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── Confirmation card ────────────────────────────────────────────

// function ResolutionConfirm({
//   actorId, confidence, onConfirm, onChange,
// }: {
//   actorId: ActorId
//   confidence: number
//   onConfirm: () => void
//   onChange: () => void
// }) {
//   const actor = getActor(actorId)
//   if (!actor) return null

//   return (
//     <div className="max-w-[440px] mx-auto text-center">
//       <span className="text-5xl mb-4 block" aria-hidden="true">{actor.emoji}</span>
//       <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
//         Based on your answers
//       </p>
//       <h2 className="font-display text-[24px] font-normal text-[#E8F0FF] tracking-tight mb-2">
//         We&rsquo;ll set this up as a {actor.label.toLowerCase()}
//       </h2>
//       <p className="text-[13.5px] text-[#A8B8D8] mb-1 leading-relaxed">{actor.description}</p>
//       {confidence < 0.7 && (
//         <p className="text-[12px] text-[#F59E0B] mb-2">
//           We're not fully certain — if this looks wrong, change it below.
//         </p>
//       )}

//       <div className="flex items-center justify-center gap-2.5 mt-6">
//         <button
//           type="button"
//           onClick={onConfirm}
//           className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13.5px] font-semibold hover:bg-[#2A6BF0] transition-colors shadow-[0_0_16px_rgba(19,91,236,0.3)]"
//         >
//           Yes, that&rsquo;s right →
//         </button>
//         <button
//           type="button"
//           onClick={onChange}
//           className="px-5 py-2.5 rounded-[10px] border border-white/[0.16] bg-white/[0.04] text-[#A8B8D8] text-[13.5px] font-medium hover:text-[#E8F0FF] hover:bg-white/[0.08] transition-colors"
//         >
//           Change it
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── Manual fallback ──────────────────────────────────────────────

// function ManualActorPicker({
//   suggested, onPick, onBack, showBack,
// }: {
//   suggested: ActorId | null
//   onPick: (actorId: ActorId) => void
//   onBack: () => void
//   showBack: boolean
// }) {
//   return (
//     <div className="max-w-[480px] mx-auto text-center">
//       <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
//         Pick directly
//       </p>
//       <h2 className="font-display text-[22px] font-normal text-[#E8F0FF] tracking-tight mb-6">
//         Which one describes you best?
//       </h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
//         {ACTORS.map(actor => (
//           <button
//             key={actor.id}
//             type="button"
//             onClick={() => onPick(actor.id)}
//             className={cn(
//               'flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all border',
//               actor.id === suggested
//                 ? 'border-[#135BEC] bg-[rgba(19,91,236,0.08)]'
//                 : 'border-white/[0.08] bg-[#0F1525] hover:border-white/[0.24]'
//             )}
//           >
//             <span className="text-[19px] shrink-0" aria-hidden="true">{actor.emoji}</span>
//             <span>
//               <span className="block text-[13.5px] font-semibold text-[#E8F0FF]">{actor.label}</span>
//               <span className="block text-[11.5px] text-[#5A6A8A]">{actor.description}</span>
//             </span>
//           </button>
//         ))}
//       </div>

//       {showBack && (
//         <button
//           type="button"
//           onClick={onBack}
//           className="mt-5 text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8]"
//         >
//           ← Back to questions
//         </button>
//       )}
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useIntentFlow } from '@/hooks/useIntentFlow'
import { ACTORS, getActor } from '@/lib/actors'
import { getIntentQuestion } from '@/lib/intent/intentQuestions'
import type { ActorId } from '@/types'

interface IntentConfirmationProps {
  /** Called once the actor is resolved and confirmed (either automatically or via manual override). */
  onResolved: (actorId: ActorId) => void
}

/**
 * IntentConfirmation
 * ────────────────────
 * Runs BEFORE the tiered IntakeForm. Asks 2–4 goal-intent questions
 * ("what are you trying to do", "what's your relationship to the
 * property", conditionally "what's your role", and conditionally
 * "what type of business" for Business/agency paths) to infer the
 * actor, rather than asking the user to self-select an "I am a…" pill.
 *
 * Ends with a confirmation card: "We'll set this up as a {actor}" with
 * an explicit Yes/Change-it step — so the resolution is always confirmed,
 * never silently assumed. "Change it" reveals the full manual pill list
 * as a fallback.
 */
export function IntentConfirmation({ onResolved }: IntentConfirmationProps) {
  const {
    currentQuestion, selectedValue, answer, goBack, canGoBack,
    resolution, isComplete, stepIndex, totalStepsEstimate,
  } = useIntentFlow()

  const [showManualOverride, setShowManualOverride] = useState(false)

  if (showManualOverride || (isComplete && !resolution.actorId)) {
    return (
      <ManualActorPicker
        suggested={resolution.actorId}
        onPick={onResolved}
        onBack={() => setShowManualOverride(false)}
        showBack={showManualOverride}
      />
    )
  }

  if (isComplete && resolution.actorId) {
    return (
      <ResolutionConfirm
        actorId={resolution.actorId}
        confidence={resolution.confidence}
        subRoleValue={resolution.subRoleValue}
        onConfirm={() => onResolved(resolution.actorId as ActorId)}
        onChange={() => setShowManualOverride(true)}
      />
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="max-w-[480px] mx-auto">
      {/* ── Step indicator ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        {Array.from({ length: totalStepsEstimate }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < stepIndex ? 'bg-[#135BEC]' : 'bg-white/[0.08]'
            )}
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
        Question {stepIndex} of ~{totalStepsEstimate}
      </p>

      {/* ── Prompt ─────────────────────────────────────────── */}
      <h2 className="font-display text-[22px] sm:text-[24px] font-normal text-[#E8F0FF] tracking-tight mb-2">
        {currentQuestion.prompt}
      </h2>
      {currentQuestion.helper && (
        <p className="text-[13px] text-[#5A6A8A] mb-6 leading-relaxed">{currentQuestion.helper}</p>
      )}

      {/* ── Options ────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {currentQuestion.options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => answer(opt.value)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-left transition-all',
              'border select-none',
              selectedValue === opt.value
                ? 'bg-[rgba(19,91,236,0.1)] border-[#135BEC]'
                : 'bg-[#0F1525] border-white/[0.08] hover:border-white/[0.24]'
            )}
          >
            {opt.emoji && <span className="text-[19px] shrink-0" aria-hidden="true">{opt.emoji}</span>}
            <span className="text-[14px] font-medium text-[#E8F0FF]">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* ── Back ───────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between">
        {canGoBack ? (
          <button
            type="button"
            onClick={goBack}
            className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] inline-flex items-center gap-1.5"
          >
            ← Back
          </button>
        ) : <span />}

        <button
          type="button"
          onClick={() => setShowManualOverride(true)}
          className="text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8] underline underline-offset-2"
        >
          I&rsquo;d rather just pick directly
        </button>
      </div>
    </div>
  )
}

// ── Confirmation card ────────────────────────────────────────────

function ResolutionConfirm({
  actorId, confidence, subRoleValue, onConfirm, onChange,
}: {
  actorId: ActorId
  confidence: number
  subRoleValue: string | null
  onConfirm: () => void
  onChange: () => void
}) {
  const actor = getActor(actorId)
  if (!actor) return null

  const subRoleLabel = subRoleValue
    ? getIntentQuestion('subrole')?.options.find(o => o.value === subRoleValue)?.label
    : null

  return (
    <div className="max-w-[440px] mx-auto text-center">
      <span className="text-5xl mb-4 block" aria-hidden="true">{actor.emoji}</span>
      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
        Based on your answers
      </p>
      <h2 className="font-display text-[24px] font-normal text-[#E8F0FF] tracking-tight mb-2">
        We&rsquo;ll set this up as a {actor.label.toLowerCase()}
      </h2>
      <p className="text-[13.5px] text-[#A8B8D8] mb-1 leading-relaxed">{actor.description}</p>
      {subRoleLabel && (
        <p className="text-[12.5px] text-[#5A6A8A] mb-1">{subRoleLabel}</p>
      )}
      {confidence < 0.7 && (
        <p className="text-[12px] text-[#F59E0B] mb-2">
          We're not fully certain — if this looks wrong, change it below.
        </p>
      )}

      <div className="flex items-center justify-center gap-2.5 mt-6">
        <button
          type="button"
          onClick={onConfirm}
          className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13.5px] font-semibold hover:bg-[#2A6BF0] transition-colors shadow-[0_0_16px_rgba(19,91,236,0.3)]"
        >
          Yes, that&rsquo;s right →
        </button>
        <button
          type="button"
          onClick={onChange}
          className="px-5 py-2.5 rounded-[10px] border border-white/[0.16] bg-white/[0.04] text-[#A8B8D8] text-[13.5px] font-medium hover:text-[#E8F0FF] hover:bg-white/[0.08] transition-colors"
        >
          Change it
        </button>
      </div>
    </div>
  )
}

// ── Manual fallback ──────────────────────────────────────────────

function ManualActorPicker({
  suggested, onPick, onBack, showBack,
}: {
  suggested: ActorId | null
  onPick: (actorId: ActorId) => void
  onBack: () => void
  showBack: boolean
}) {
  return (
    <div className="max-w-[480px] mx-auto text-center">
      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
        Pick directly
      </p>
      <h2 className="font-display text-[22px] font-normal text-[#E8F0FF] tracking-tight mb-6">
        Which one describes you best?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ACTORS.map(actor => (
          <button
            key={actor.id}
            type="button"
            onClick={() => onPick(actor.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all border',
              actor.id === suggested
                ? 'border-[#135BEC] bg-[rgba(19,91,236,0.08)]'
                : 'border-white/[0.08] bg-[#0F1525] hover:border-white/[0.24]'
            )}
          >
            <span className="text-[19px] shrink-0" aria-hidden="true">{actor.emoji}</span>
            <span>
              <span className="block text-[13.5px] font-semibold text-[#E8F0FF]">{actor.label}</span>
              <span className="block text-[11.5px] text-[#5A6A8A]">{actor.description}</span>
            </span>
          </button>
        ))}
      </div>

      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-5 text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8]"
        >
          ← Back to questions
        </button>
      )}
    </div>
  )
}