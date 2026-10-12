// 'use client'

// import React, { useRef, useId, useState, useEffect, useLayoutEffect } from 'react'
// import { createPortal } from 'react-dom'
// import { cn } from '@/lib/cn'
// import { ACTORS } from '@/lib/actors'
// import type { SearchSuggestion, ActorId, ActorSuggestion } from '@/types'

// interface SearchBarProps {
//   id?: string
//   value:         string
//   suggestion:    SearchSuggestion | null
//   isLoading:     boolean
//   onChange:      (value: string) => void
//   onSubmit:      () => void
//   placeholder?:  string
//   className?:    string
//   hintDefault?:  string
//   onAcceptSuggestion?: (suggestion: SearchSuggestion) => void

//   selectedActor?:      ActorId | null
//   actorSuggestion?:    ActorSuggestion | null
//   onSelectActor?:      (actorId: ActorId | null) => void
//   onAcceptActorSuggestion?: () => void

//   /** Called when voice input starts/stops. Wire this to your speech-to-text hook. */
//   onVoiceToggle?: (listening: boolean) => void
// }

// function articleFor(label: string): 'a' | 'an' {
//   return /^[aeiou]/i.test(label) ? 'an' : 'a'
// }

// /**
//  * Highlights the phrase "free report" in yellow within an otherwise
//  * plain hint string, matching the coloured "free report" span used in
//  * the hero paragraph above the search bar. Case-insensitive; renders
//  * the rest of the string unchanged around it. Matches on \s so it
//  * still finds the phrase even if a non-breaking space was used to
//  * keep "Free report" glued together for line-wrapping purposes.
//  */
// function highlightFreeReport(text: string): React.ReactNode {
//   const match = /free\s+report/i.exec(text)
//   if (!match) return text
//   const start = match.index
//   const end = start + match[0].length
//   return (
//     <>
//       {text.slice(0, start)}
//       <span className="text-[#F2C94C] font-medium whitespace-nowrap">{text.slice(start, end)}</span>
//       {text.slice(end)}
//     </>
//   )
// }

// // Apple-ish "ease out expo" — fast start, long smooth settle. Used for
// // every distraction-free transition below so they all feel like one
// // coordinated motion rather than several independently-timed ones.
// const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// const EXPAND_MS = 520

// export function SearchBar({
//   id,
//   value,
//   suggestion,
//   isLoading,
//   onChange,
//   onSubmit,
//   placeholder = 'I want to build a rear extension…',
//   className,
//   // "Get a" + "Free report" are glued with non-breaking spaces so the
//   // line never wraps in the middle of that clause — it either fits on
//   // the previous line whole, or drops to its own line whole.
//   hintDefault = 'No planning knowledge needed · Expert consultants available · Get\u00A0a\u00A0Free\u00A0report',
//   onAcceptSuggestion,
//   selectedActor = null,
//   actorSuggestion = null,
//   onSelectActor,
//   onAcceptActorSuggestion,
//   onVoiceToggle,
// }: SearchBarProps) {
//   const inputRef = useRef<HTMLInputElement>(null)
//   const inputId  = useId()

//   const actorBtnRef  = useRef<HTMLButtonElement>(null)
//   const actorMenuRef = useRef<HTMLDivElement>(null)
//   const [actorMenuOpen, setActorMenuOpen] = useState(false)
//   const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
//   const [isListening, setIsListening] = useState(false)
//   const [mounted, setMounted] = useState(false)

//   // ── Distraction-free mode ──────────────────────────────────────
//   // Expands the moment the field is focused (feels instant/responsive,
//   // like Spotlight) and stays expanded for as long as there's text,
//   // even after blur — so a half-typed query doesn't collapse on you.
//   const [isFocused, setIsFocused] = useState(false)
//   const hasText = value.trim().length > 0
//   const isExpanded = isFocused || hasText

//   const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

//   const showActorBanner =
//     actorSuggestion &&
//     actorSuggestion.actorId !== selectedActor &&
//     actorSuggestion.confidence >= 0.55

//   // Portal target only exists client-side
//   useEffect(() => { setMounted(true) }, [])

//   // Recompute dropdown position whenever it opens, and keep it pinned
//   // to the trigger button on scroll/resize while open.
//   useLayoutEffect(() => {
//     if (!actorMenuOpen) return

//     const updatePosition = () => {
//       const rect = actorBtnRef.current?.getBoundingClientRect()
//       if (!rect) return
//       setMenuPos({
//         top: rect.bottom + 6,
//         left: rect.left,
//         width: rect.width,
//       })
//     }

//     updatePosition()
//     window.addEventListener('scroll', updatePosition, true)
//     window.addEventListener('resize', updatePosition)
//     return () => {
//       window.removeEventListener('scroll', updatePosition, true)
//       window.removeEventListener('resize', updatePosition)
//     }
//   }, [actorMenuOpen])

//   // Click-outside handling — must check both the trigger button and the
//   // portaled dropdown, since they're no longer in the same DOM subtree.
//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       const target = e.target as Node
//       const clickedButton = actorBtnRef.current?.contains(target)
//       const clickedMenu    = actorMenuRef.current?.contains(target)
//       if (!clickedButton && !clickedMenu) {
//         setActorMenuOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   // Close on Escape
//   useEffect(() => {
//     if (!actorMenuOpen) return
//     function handleEscape(e: KeyboardEvent) {
//       if (e.key === 'Escape') setActorMenuOpen(false)
//     }
//     document.addEventListener('keydown', handleEscape)
//     return () => document.removeEventListener('keydown', handleEscape)
//   }, [actorMenuOpen])

//   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault()
//       onSubmit()
//     }
//     if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
//       e.preventDefault()
//       onAcceptSuggestion(suggestion)
//     }
//     // Backspace at the very start of an empty input clears the actor prefix
//     if (e.key === 'Backspace' && value.length === 0 && selectedActorMeta) {
//       e.preventDefault()
//       onSelectActor?.(null)
//     }
//   }

//   const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//     onSubmit()
//   }

//   const handleSuggestionClick = () => {
//     if (suggestion && onAcceptSuggestion) onAcceptSuggestion(suggestion)
//   }

//   const handleActorPillClick = (actorId: ActorId) => {
//     onSelectActor?.(selectedActor === actorId ? null : actorId)
//     setActorMenuOpen(false)
//     inputRef.current?.focus()
//   }

//   const toggleActorMenu = () => {
//     if (!actorMenuOpen && actorBtnRef.current) {
//       const rect = actorBtnRef.current.getBoundingClientRect()
//       setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
//     }
//     setActorMenuOpen(o => !o)
//   }

//   const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setIsListening(prev => {
//       const next = !prev
//       onVoiceToggle?.(next)
//       return next
//     })
//   }

//   const canSubmit = value.trim().length > 0 && !isLoading

//   // Default hint text collapses in distraction-free mode — but the
//   // suggestion ("Tab to accept…") and the listening state stay visible
//   // since those are actively useful while the person is typing.
//   const hideDefaultHint = isExpanded && !suggestion && !isListening

//   return (
//     <div className={cn('w-full', className)} role="search">

//       {/* ── Auto-detected actor banner ─────────────────────────── */}
//       {showActorBanner && actorSuggestion && (
//         <div
//           className={cn(
//             'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-[10px]',
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
//                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>
//                 {actorSuggestion.correctedFrom && (
//                   <span className="text-[#5A6A8A]"> (we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)</span>
//                 )}
//                 ?
//               </>
//             ) : (
//               <>
//                 Looks like you're a{' '}
//                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>{' '}
//                 — should we set up your workspace for that?
//               </>
//             )}
//           </p>
//           <div className="flex items-center gap-1.5 shrink-0">
//             <button
//               type="button"
//               onClick={onAcceptActorSuggestion}
//               className="px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
//             >
//               ✓ Yes
//             </button>
//             <button
//               type="button"
//               onClick={() => onSelectActor?.(null)}
//               className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Glass search bar ───────────────────────────────────── */}
//       <div className="relative">
//         <div
//           className={cn(
//             'relative rounded-[24px]',
//             'bg-white/[0.08] backdrop-blur-2xl backdrop-saturate-150',
//             'border border-white/[0.14]',
//             'transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
//             'focus-within:border-[rgba(0,212,255,0.35)]',
//             isExpanded
//               ? 'shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_3px_rgba(0,212,255,0.14)] scale-[1.008]'
//               : 'shadow-[0_10px_40px_rgba(0,0,0,0.45)]'
//           )}
//         >
//           {/* Single row: actor pill (always top-left) + input + mic + send.
//               The actor trigger used to live in a second row that only
//               appeared once the bar was collapsed — it now stays put
//               regardless of focus/expand state. */}
//           <div className="flex items-center gap-1.5 px-3.5 sm:px-4 py-3">
//             {/* Actor trigger — permanently pinned to the top-left */}
//             <button
//               ref={actorBtnRef}
//               type="button"
//               onClick={toggleActorMenu}
//               aria-haspopup="listbox"
//               aria-expanded={actorMenuOpen}
//               className={cn(
//                 'flex items-center gap-1 pl-3 pr-2.5 py-1.5 rounded-full shrink-0',
//                 'text-[13px] font-medium transition-colors border',
//                 selectedActorMeta
//                   ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
//                   : 'bg-white/[0.05] border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.09] hover:border-white/[0.2]'
//               )}
//             >
//               {selectedActorMeta ? (
//                 <>
//                   <span aria-hidden="true">{selectedActorMeta.emoji}</span>
//                   {selectedActorMeta.label}
//                 </>
//               ) : (
//                 <>I am a…</>
//               )}
//               <svg
//                 className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
//                 viewBox="0 0 12 12" fill="none" aria-hidden="true"
//               >
//                 <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </button>

//             {/* Small remove ("x") for the selected actor, sits right after the pill */}
//             {selectedActorMeta && (
//               <button
//                 type="button"
//                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectActor?.(null) }}
//                 aria-label={`Remove ${selectedActorMeta.label}`}
//                 className="text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors shrink-0 -ml-1 p-1"
//               >
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
//                   <path d="M18 6 6 18M6 6l12 12"/>
//                 </svg>
//               </button>
//             )}

//             <input
//               ref={inputRef}
//               id={inputId}
//               type="text"
//               value={value}
//               onChange={e => onChange(e.target.value)}
//               onKeyDown={handleKey}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'and I want to…' : placeholder)}
//               autoComplete="off"
//               spellCheck={false}
//               aria-label="Describe your planning goal"
//               className={cn(
//                 'flex-1 min-w-0 py-2 bg-transparent',
//                 'font-sans text-[#E8F0FF] placeholder:text-[#7C88A6]',
//                 'focus:outline-none',
//                 'transition-[font-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
//                 isExpanded ? 'text-[17px] sm:text-[18px]' : 'text-[16px]',
//                 isListening && 'placeholder:text-[#00D4FF]'
//               )}
//             />

//             {isLoading && (
//               <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
//                 <SpinnerIcon />
//               </span>
//             )}

//             {/* Mic with listening animation */}
//             <button
//               type="button"
//               onClick={handleMicClick}
//               aria-label={isListening ? 'Stop voice input' : 'Voice input'}
//               aria-pressed={isListening}
//               className={cn(
//                 'relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors',
//                 isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#A8B8D8] hover:bg-white/[0.08]'
//               )}
//             >
//               {isListening && (
//                 <span className="absolute inset-0 rounded-full bg-[#00D4FF]/40 animate-ping" aria-hidden="true" />
//               )}
//               {isListening ? (
//                 <span className="relative flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
//                   {[0, 1, 2, 3].map(i => (
//                     <span
//                       key={i}
//                       className="w-[2.5px] rounded-full bg-[#050A12] mic-bar"
//                       style={{ animationDelay: `${i * 0.12}s` }}
//                     />
//                   ))}
//                 </span>
//               ) : (
//                 <MicIcon />
//               )}
//             </button>

//             <button
//               type="button"
//               onClick={handleSubmitClick}
//               disabled={!canSubmit}
//               aria-label="Check planning route"
//               className={cn(
//                 'flex items-center justify-center w-9 h-9 rounded-full shrink-0 ml-0.5',
//                 'transition-all duration-150',
//                 canSubmit
//                   ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] active:scale-[0.95]'
//                   : 'bg-white/[0.08] text-white/25 cursor-not-allowed'
//               )}
//             >
//               <ArrowUpIcon />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Actor dropdown — portaled to <body> so it's never clipped ── */}
//       {mounted && actorMenuOpen && menuPos && createPortal(
//         <>
//           <div
//             className="fixed inset-0 z-[100]"
//             onClick={() => setActorMenuOpen(false)}
//             aria-hidden="true"
//           />
//           <div
//   ref={actorMenuRef}
//   role="listbox"
//   aria-label="Select who you are"
//   style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
//   className={cn(
//     'fixed z-[101] origin-top-left',
//     'w-max max-w-[min(300px,86vw)] rounded-[16px] p-1.5',
//     'bg-[#131A2C]/95 backdrop-blur-xl border border-white/[0.10]',
//     'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
//     'animate-[dropIn_0.15s_ease-out]'
//   )}
// >
//   {/* Caret connecting the dropdown to the "I am a…" pill above */}
//   <span
//     aria-hidden="true"
//     className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C]/95 border-l border-t border-white/[0.10]"
//   />

//   <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
//     {ACTORS.map((actor, index) => {
//       const isSelected = selectedActor === actor.id
//       return (
//         <button
//           key={actor.id}
//           type="button"
//           role="option"
//           aria-selected={isSelected}
//           onClick={() => handleActorPillClick(actor.id)}
//           className={cn(
//             'flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-left w-full',
//             'transition-colors duration-150',
//             isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
//           )}
//           style={{
//             animationName: 'fadeInUp',
//             animationDuration: '0.15s',
//             animationFillMode: 'both',
//             animationDelay: `${index * 25}ms`,
//           }}
//         >
//           <span
//             className={cn(
//               'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
//               isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
//             )}
//             aria-hidden="true"
//           >
//             {actor.emoji}
//           </span>

//           <span className="flex-1 min-w-0">
//             <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
//               {actor.label}
//             </span>
//             {actor.description && (
//               <span className="block text-[11.5px] text-[#5A6A8A] truncate">
//                 {actor.description}
//               </span>
//             )}
//           </span>

//           {isSelected && (
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
//               <path d="M20 6 9 17l-5-5" />
//             </svg>
//           )}
//         </button>
//       )
//     })}
//   </div>
// </div>
//         </>,
//         document.body
//       )}

//       {/* ── Hint / suggestion row ─────────────────────────────── */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateRows: hideDefaultHint ? '0fr' : '1fr',
//           opacity: hideDefaultHint ? 0 : 1,
//           transition: `grid-template-rows ${EXPAND_MS}ms ${EASE}, opacity 260ms ${EASE}`,
//         }}
//       >
//         <div className="overflow-hidden">
//           <p
//             aria-live="polite"
//             aria-atomic="true"
//             className="mt-2.5 text-xs text-center min-h-[18px] mx-auto max-w-[560px] px-2"
//             style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
//           >
//             {isListening ? (
//               <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
//             ) : suggestion ? (
//               <span className="text-[#00D4FF]" style={{ textShadow: '0 0 12px rgba(0,212,255,0.4)' }}>
//                 <button
//                   type="button"
//                   onClick={handleSuggestionClick}
//                   className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
//                 >
//                   → {suggestion.label}
//                 </button>
//                 <span className="ml-2 text-[#5A6A8A]">
//                   · Press Tab to accept, Enter or click send to search
//                 </span>
//               </span>
//             ) : (
//               <span className="text-[15px] sm:text-[16px] text-[#A8B8D8] leading-relaxed">{highlightFreeReport(hintDefault)}</span>
//             )}
//           </p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes dropIn {
//           from { opacity: 0; transform: translateY(-6px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(6px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .mic-bar {
//           height: 100%;
//           animation: micWave 0.9s ease-in-out infinite;
//         }
//         @keyframes micWave {
//           0%, 100% { transform: scaleY(0.35); }
//           50%      { transform: scaleY(1); }
//         }
//       `}</style>
//     </div>
//   )
// }

// function SpinnerIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//       <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
//     </svg>
//   )
// }

// function MicIcon() {
//   return (
//     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="9" y="2" width="6" height="12" rx="3"/>
//       <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
//     </svg>
//   )
// }

// function ArrowUpIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M12 19V5M5 12l7-7 7 7"/>
//     </svg>
//   )
// }

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/ui/SearchBar'
import { ActorSelect } from '@/components/home/ActorSelect'
import { useSearch } from '@/hooks/useSearch'

export function HeroSearch() {
  const router = useRouter()
  const [barFocused, setBarFocused] = useState(false)
  const {
    query, suggestion, actorSuggestion, selectedActor, isLoading,
    handleChange, handleSubmit, selectActor, acceptActorSuggestion,
  } = useSearch()

  const onSubmit = () => {
    handleSubmit((goalId, actorId) => {
      const params = actorId ? `?actor=${actorId}` : ''
      router.push(`/check/${goalId}${params}`)
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      <SearchBar
        value={query}
        suggestion={suggestion}
        isLoading={isLoading}
        onChange={handleChange}
        onSubmit={onSubmit}
        selectedActor={selectedActor}
        actorSuggestion={actorSuggestion}
        onSelectActor={selectActor}
        onAcceptActorSuggestion={acceptActorSuggestion}
        onFocusChange={setBarFocused}
      />

      {/* Quick-action pills — hidden while typing, fade back in on blur */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: barFocused ? '0fr' : '1fr',
          opacity: barFocused ? 0 : 1,
          transition: 'grid-template-rows 400ms cubic-bezier(0.16,1,0.3,1), opacity 250ms ease',
        }}
      >
        <div className="overflow-hidden">
          <ActorSelect
            selectedActor={selectedActor}
            actorSuggestion={actorSuggestion}
            onSelect={selectActor}
            onAcceptSuggestion={acceptActorSuggestion}
          />
        </div>
      </div>
    </div>
  )
}