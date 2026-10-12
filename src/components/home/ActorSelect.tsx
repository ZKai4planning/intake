// 'use client'

// import { cn } from '@/lib/cn'
// import { ACTORS } from '@/lib/actors'
// import type { ActorId, ActorSuggestion } from '@/types'

// interface ActorSelectProps {
//   selectedActor:   ActorId | null
//   actorSuggestion: ActorSuggestion | null
//   onSelect:        (actorId: ActorId | null) => void
//   onAcceptSuggestion: () => void
//   className?: string
// }

// /**
//  * ActorSelect
//  * ────────────
//  * Two responsibilities:
//  *
//  * 1. Auto-correct banner — appears above the pills when the search
//  *    hook detects an actor mention in free text (even with typos).
//  *    e.g. user types "landlrod" → banner shows
//  *    "Did you mean Landlord? ✓ Yes · ✕ No"
//  *
//  * 2. Manual pill row — always visible, lets the user explicitly
//  *    pick/override who they are. Selecting a pill is authoritative
//  *    and overrides anything detected from free text.
//  */
// export function ActorSelect({
//   selectedActor,
//   actorSuggestion,
//   onSelect,
//   onAcceptSuggestion,
//   className,
// }: ActorSelectProps) {
//   const showBanner =
//     actorSuggestion &&
//     actorSuggestion.actorId !== selectedActor &&
//     actorSuggestion.confidence >= 0.55

//   return (
//     <div className={cn('w-full', className)}>
//       {/* ── Auto-correct / detection banner ──────────────────── */}
//       {showBanner && (
//         <div
//           className={cn(
//             'flex items-center gap-2.5 mb-3 px-3.5 py-2.5 rounded-[10px]',
//             'bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.22)]',
//             'animate-[fadeIn_0.2s_ease-out]'
//           )}
//           role="status"
//           aria-live="polite"
//         >
//           <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
//             {actorSuggestion.wasCorrected ? '✏️' : '👋'}
//           </span>

//           <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
//             {actorSuggestion.wasCorrected ? (
//               <>
//                 Did you mean{' '}
//                 <span className="text-[#E8F0FF] font-semibold">
//                   {actorSuggestion.label}
//                 </span>
//                 {actorSuggestion.correctedFrom && (
//                   <span className="text-[#5A6A8A]">
//                     {' '}(we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)
//                   </span>
//                 )}
//                 ?
//               </>
//             ) : (
//               <>
//                 Looks like you're a{' '}
//                 <span className="text-[#E8F0FF] font-semibold">
//                   {actorSuggestion.label}
//                 </span>{' '}
//                 — should we set up your workspace for that?
//               </>
//             )}
//           </p>

//           <div className="flex items-center gap-1.5 shrink-0">
//             <button
//               type="button"
//               onClick={onAcceptSuggestion}
//               className={cn(
//                 'px-2.5 py-1 rounded-[6px] text-[12px] font-semibold',
//                 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors'
//               )}
//             >
//               ✓ Yes
//             </button>
//             <button
//               type="button"
//               onClick={() => onSelect(null)}
//               className={cn(
//                 'px-2.5 py-1 rounded-[6px] text-[12px] font-medium',
//                 'text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors'
//               )}
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Manual pill row ───────────────────────────────────── */}
//       <div className="flex flex-col items-center gap-2.5">
//         <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A]">
//           I am a…
//         </p>

//         <div
//           className="flex flex-wrap justify-center gap-2"
//           role="radiogroup"
//           aria-label="Select who you are"
//         >
//           {ACTORS.map(actor => {
//             const isSelected = selectedActor === actor.id
//             return (
//               <button
//                 key={actor.id}
//                 type="button"
//                 role="radio"
//                 aria-checked={isSelected}
//                 onClick={() => onSelect(isSelected ? null : actor.id)}
//                 className={cn(
//                   'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full',
//                   'text-[12.5px] font-medium transition-all duration-150',
//                   'border select-none',
//                   isSelected
//                     ? 'bg-[rgba(0,212,255,0.12)] border-[#00D4FF] text-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.2)]'
//                     : 'bg-[#0F1525] border-white/[0.12] text-[#A8B8D8] hover:border-white/[0.24] hover:text-[#E8F0FF]'
//                 )}
//               >
//                 <span aria-hidden="true">{actor.emoji}</span>
//                 {actor.label}
//               </button>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// 'use client'

// import { cn } from '@/lib/cn'
// import { ACTORS } from '@/lib/actors'
// import type { ActorId, ActorSuggestion } from '@/types'

// interface ActorSelectProps {
//   selectedActor:   ActorId | null
//   actorSuggestion: ActorSuggestion | null
//   onSelect:        (actorId: ActorId | null) => void
//   onAcceptSuggestion: () => void
//   className?: string
// }

// export function ActorSelect({
//   selectedActor,
//   actorSuggestion,
//   onSelect,
//   onAcceptSuggestion,
//   className,
// }: ActorSelectProps) {
//   const showBanner =
//     actorSuggestion &&
//     actorSuggestion.actorId !== selectedActor &&
//     actorSuggestion.confidence >= 0.55

//   return (
//     <div className={cn('w-full', className)}>
//       {/* ── Auto-correct / detection banner ──────────────────── */}
//       {showBanner && (
//         <div
//           className={cn(
//             'flex items-center gap-2.5 mb-3 px-3.5 py-2.5 rounded-[10px]',
//             'bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.22)]',
//             'animate-[fadeIn_0.2s_ease-out]'
//           )}
//           role="status"
//           aria-live="polite"
//         >
//           <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
//             {actorSuggestion.wasCorrected ? '✏️' : '👋'}
//           </span>

//           <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
//             {actorSuggestion.wasCorrected ? (
//               <>
//                 Did you mean{' '}
//                 <span className="text-[#E8F0FF] font-semibold">
//                   {actorSuggestion.label}
//                 </span>
//                 {actorSuggestion.correctedFrom && (
//                   <span className="text-[#5A6A8A]">
//                     {' '}(we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)
//                   </span>
//                 )}
//                 ?
//               </>
//             ) : (
//               <>
//                 Looks like you're a{' '}
//                 <span className="text-[#E8F0FF] font-semibold">
//                   {actorSuggestion.label}
//                 </span>{' '}
//                 — should we set up your workspace for that?
//               </>
//             )}
//           </p>

//           <div className="flex items-center gap-1.5 shrink-0">
//             <button
//               type="button"
//               onClick={onAcceptSuggestion}
//               className={cn(
//                 'px-2.5 py-1 rounded-[6px] text-[12px] font-semibold',
//                 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors'
//               )}
//             >
//               ✓ Yes
//             </button>
//             <button
//               type="button"
//               onClick={() => onSelect(null)}
//               className={cn(
//                 'px-2.5 py-1 rounded-[6px] text-[12px] font-medium',
//                 'text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors'
//               )}
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Manual pill row ───────────────────────────────────── */}
//       <div className="flex flex-col items-center gap-2.5">
//         <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A]">
//           I am a…
//         </p>

//         <div
//           className={cn(
//             'flex flex-wrap justify-center gap-1.5 sm:gap-2 w-full max-w-full px-2 sm:px-3'
//           )}
//           role="radiogroup"
//           aria-label="Select who you are"
//         >
//           {ACTORS.map(actor => {
//             const isSelected  = selectedActor === actor.id
//             const isSuggested =
//               !isSelected &&
//               actorSuggestion?.actorId === actor.id &&
//               actorSuggestion.confidence >= 0.55

//             return (
//               <button
//                 key={actor.id}
//                 type="button"
//                 role="radio"
//                 aria-checked={isSelected}
//                 onClick={() => onSelect(isSelected ? null : actor.id)}
//                 className={cn(
//                   'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0',
//                   'text-[12px] font-medium transition-all duration-150 whitespace-nowrap',
//                   'border select-none',
//                   isSelected
//                     ? 'bg-[rgba(0,212,255,0.12)] border-[#00D4FF] text-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.2)]'
//                     : isSuggested
//                     ? 'bg-[rgba(0,212,255,0.07)] border-[#00D4FF]/50 text-[#00D4FF] border-dashed'
//                     : 'bg-[#0F1525] border-white/[0.12] text-[#A8B8D8] hover:border-white/[0.24] hover:text-[#E8F0FF]'
//                 )}
//               >
//                 <span aria-hidden="true">{actor.emoji}</span>
//                 {actor.label}
//               </button>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { ACTORS } from '@/lib/actors'
import type { ActorId, ActorSuggestion } from '@/types'

interface ActorSelectProps {
  selectedActor:   ActorId | null
  actorSuggestion: ActorSuggestion | null
  onSelect:        (actorId: ActorId | null) => void
  onAcceptSuggestion: () => void
  className?: string
}

export function ActorSelect({
  selectedActor,
  actorSuggestion,
  onSelect,
  onAcceptSuggestion,
  className,
}: ActorSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const showBanner =
    actorSuggestion &&
    actorSuggestion.actorId !== selectedActor &&
    actorSuggestion.confidence >= 0.55

  const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePillClick = (actorId: ActorId) => {
    onSelect(selectedActor === actorId ? null : actorId)
    setIsOpen(false)
  }

  return (
    <div className={cn('w-full relative', className)} ref={containerRef}>
      {/* ── Auto-correct / detection banner ──────────────────── */}
      {showBanner && (
        <div
          className={cn(
            'flex items-center gap-2.5 mb-3 px-3.5 py-2.5 rounded-[10px]',
            'bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.22)]',
            'animate-[fadeIn_0.2s_ease-out]'
          )}
          role="status"
          aria-live="polite"
        >
          <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
            {actorSuggestion.wasCorrected ? '✏️' : '👋'}
          </span>

          <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
            {actorSuggestion.wasCorrected ? (
              <>
                Did you mean{' '}
                <span className="text-[#E8F0FF] font-semibold">
                  {actorSuggestion.label}
                </span>
                {actorSuggestion.correctedFrom && (
                  <span className="text-[#5A6A8A]">
                    {' '}(we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)
                  </span>
                )}
                ?
              </>
            ) : (
              <>
                Looks like you're a{' '}
                <span className="text-[#E8F0FF] font-semibold">
                  {actorSuggestion.label}
                </span>{' '}
                — should we set up your workspace for that?
              </>
            )}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onAcceptSuggestion}
              className={cn(
                'px-2.5 py-1 rounded-[6px] text-[12px] font-semibold',
                'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors'
              )}
            >
              ✓ Yes
            </button>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={cn(
                'px-2.5 py-1 rounded-[6px] text-[12px] font-medium',
                'text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors'
              )}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* ── Trigger button ────────────────────────────────────── */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'text-[13px] font-medium transition-all duration-150',
            'border select-none',
            selectedActorMeta
              ? 'bg-[rgba(0,212,255,0.12)] border-[#00D4FF] text-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.2)]'
              : 'bg-[#0B0F1A] border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
          )}
        >
          {selectedActorMeta ? (
            <>
              <span aria-hidden="true">{selectedActorMeta.emoji}</span>
              {selectedActorMeta.label}
            </>
          ) : (
            <>I am a…</>
          )}
          <svg
            className={cn('w-3 h-3 transition-transform duration-150', isOpen && 'rotate-180')}
            viewBox="0 0 12 12" fill="none" aria-hidden="true"
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Dropdown panel: all actors as pills, styled like the reference ── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select who you are"
          className={cn(
            'absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-20',
            'flex flex-wrap justify-center gap-2 px-4 py-3.5',
            'w-[min(640px,92vw)] rounded-[14px]',
            'bg-[#0B0F1A] border border-white/[0.10]',
            'shadow-[0_12px_32px_rgba(0,0,0,0.45)]',
            'animate-[fadeIn_0.15s_ease-out]'
          )}
        >
          {ACTORS.map(actor => {
            const isSelected = selectedActor === actor.id
            return (
              <button
                key={actor.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handlePillClick(actor.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full shrink-0',
                  'text-[12.5px] font-medium transition-all duration-150 whitespace-nowrap',
                  'border select-none',
                  isSelected
                    ? 'bg-[rgba(0,212,255,0.12)] border-[#00D4FF] text-[#00D4FF]'
                    : 'bg-transparent border-white/[0.16] text-[#A8B8D8] hover:border-white/[0.32] hover:text-[#E8F0FF] hover:bg-white/[0.04]'
                )}
              >
                <span aria-hidden="true">{actor.emoji}</span>
                {actor.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}