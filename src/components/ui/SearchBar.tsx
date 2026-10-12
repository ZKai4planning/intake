// // 'use client'

// // import React, { useRef, useId, useState, useEffect, useLayoutEffect } from 'react'
// // import { createPortal } from 'react-dom'
// // import { cn } from '@/lib/cn'
// // import { ACTORS } from '@/lib/actors'
// // import type { SearchSuggestion, ActorId, ActorSuggestion } from '@/types'

// // interface SearchBarProps {
// //   id?: string
// //   value:         string
// //   suggestion:    SearchSuggestion | null
// //   isLoading:     boolean
// //   onChange:      (value: string) => void
// //   onSubmit:      () => void
// //   placeholder?:  string
// //   className?:    string
// //   hintDefault?:  string
// //   onAcceptSuggestion?: (suggestion: SearchSuggestion) => void

// //   selectedActor?:      ActorId | null
// //   actorSuggestion?:    ActorSuggestion | null
// //   onSelectActor?:      (actorId: ActorId | null) => void
// //   onAcceptActorSuggestion?: () => void

// //   /** Called when voice input starts/stops. Wire this to your speech-to-text hook. */
// //   onVoiceToggle?: (listening: boolean) => void

// //   /** Fires whenever the field gains/loses focus. */
// //   onFocusChange?: (focused: boolean) => void
// // }

// // const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// // const EXPAND_MS = 400

// // export function SearchBar({
// //   id,
// //   value,
// //   suggestion,
// //   isLoading,
// //   onChange,
// //   onSubmit,
// //   placeholder = 'Type your query here or select from the list below',
// //   className,
// //   // hintDefault = 'Free report ',
// //   onAcceptSuggestion,
// //   selectedActor = null,
// //   actorSuggestion = null,
// //   onSelectActor,
// //   onAcceptActorSuggestion,
// //   onVoiceToggle,
// //   onFocusChange,
// // }: SearchBarProps) {
// //   const inputRef = useRef<HTMLInputElement>(null)
// //   const inputId  = useId()

// //   const actorBtnRef  = useRef<HTMLButtonElement>(null)
// //   const actorMenuRef = useRef<HTMLDivElement>(null)
// //   const [actorMenuOpen, setActorMenuOpen] = useState(false)
// //   const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
// //   const [isListening, setIsListening] = useState(false)
// //   const [mounted, setMounted] = useState(false)
// //   const [isFocused, setIsFocused] = useState(false)

// //   useEffect(() => {
// //     onFocusChange?.(isFocused)
// //   }, [isFocused, onFocusChange])

// //   const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

// //   const showActorBanner =
// //     actorSuggestion &&
// //     actorSuggestion.actorId !== selectedActor &&
// //     actorSuggestion.confidence >= 0.55

// //   // Portal target only exists client-side
// //   useEffect(() => { setMounted(true) }, [])

// //   // Recompute dropdown position whenever it opens, and keep it pinned
// //   // to the trigger button on scroll/resize while open.
// //   useLayoutEffect(() => {
// //     if (!actorMenuOpen) return

// //     const updatePosition = () => {
// //       const rect = actorBtnRef.current?.getBoundingClientRect()
// //       if (!rect) return
// //       setMenuPos({
// //         top: rect.bottom + 6,
// //         left: rect.left,
// //         width: rect.width,
// //       })
// //     }

// //     updatePosition()
// //     window.addEventListener('scroll', updatePosition, true)
// //     window.addEventListener('resize', updatePosition)
// //     return () => {
// //       window.removeEventListener('scroll', updatePosition, true)
// //       window.removeEventListener('resize', updatePosition)
// //     }
// //   }, [actorMenuOpen])

// //   // Click-outside handling — must check both the trigger button and the
// //   // portaled dropdown, since they're no longer in the same DOM subtree.
// //   useEffect(() => {
// //     function handleClickOutside(e: MouseEvent) {
// //       const target = e.target as Node
// //       const clickedButton = actorBtnRef.current?.contains(target)
// //       const clickedMenu    = actorMenuRef.current?.contains(target)
// //       if (!clickedButton && !clickedMenu) {
// //         setActorMenuOpen(false)
// //       }
// //     }
// //     document.addEventListener('mousedown', handleClickOutside)
// //     return () => document.removeEventListener('mousedown', handleClickOutside)
// //   }, [])

// //   // Close on Escape
// //   useEffect(() => {
// //     if (!actorMenuOpen) return
// //     function handleEscape(e: KeyboardEvent) {
// //       if (e.key === 'Escape') setActorMenuOpen(false)
// //     }
// //     document.addEventListener('keydown', handleEscape)
// //     return () => document.removeEventListener('keydown', handleEscape)
// //   }, [actorMenuOpen])

// //   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter') {
// //       e.preventDefault()
// //       if (needsActor) {
// //         toggleActorMenu()
// //         return
// //       }
// //       onSubmit()
// //     }
// //     if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
// //       e.preventDefault()
// //       onAcceptSuggestion(suggestion)
// //     }
// //     // Note: backspace-to-clear-actor intentionally removed — the actor
// //     // pill, once selected, can only be changed by reopening the dropdown
// //     // and picking a different option, not cleared from the input.
// //   }

// //   const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     if (needsActor) {
// //       toggleActorMenu()
// //       return
// //     }
// //     onSubmit()
// //   }

// //   const handleActorPillClick = (actorId: ActorId) => {
// //     onSelectActor?.(selectedActor === actorId ? null : actorId)
// //     setActorMenuOpen(false)
// //     inputRef.current?.focus()
// //   }

// //   const toggleActorMenu = () => {
// //     if (!actorMenuOpen && actorBtnRef.current) {
// //       const rect = actorBtnRef.current.getBoundingClientRect()
// //       setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
// //     }
// //     setActorMenuOpen(o => !o)
// //   }

// //   const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     setIsListening(prev => {
// //       const next = !prev
// //       onVoiceToggle?.(next)
// //       return next
// //     })
// //   }

// //   const canSubmit = value.trim().length > 0 && !isLoading && !!selectedActor
// //   const needsActor = value.trim().length > 0 && !isLoading && !selectedActor

// //   return (
// //     <div className={cn('w-full', className)} role="search">

// //       {/* ── Auto-detected actor banner ─────────────────────────── */}
// //       {showActorBanner && actorSuggestion && (
// //         <div
// //           className={cn(
// //             'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-lg',
// //             'bg-[#101627] border border-[rgba(0,212,255,0.22)]',
// //             'animate-[fadeIn_0.2s_ease-out]'
// //           )}
// //           role="status"
// //           aria-live="polite"
// //         >
// //           <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
// //             {actorSuggestion.wasCorrected ? '✏️' : '👋'}
// //           </span>
// //           <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
// //             {actorSuggestion.wasCorrected ? (
// //               <>
// //                 Did you mean{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>
// //                 {actorSuggestion.correctedFrom && (
// //                   <span className="text-[#5A6A8A]"> (we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)</span>
// //                 )}
// //                 ?
// //               </>
// //             ) : (
// //               <>
// //                 Looks like you're a{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>{' '}
// //                 — should we set up your workspace for that?
// //               </>
// //             )}
// //           </p>
// //           <div className="flex items-center gap-1.5 shrink-0">
// //             <button
// //               type="button"
// //               onClick={onAcceptActorSuggestion}
// //               className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
// //             >
// //               ✓ Yes
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => onSelectActor?.(null)}
// //               className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
// //             >
// //               No
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── Flat solid card (no blur/glass) ───────────────────── */}
// //       <div className="relative">
// //         <div
// //           className={cn(
// //             'relative rounded-2xl',
// //             'bg-[#0F1526]',
// //             'border transition-colors duration-300',
// //             isFocused ? 'border-[rgba(0,212,255,0.4)]' : 'border-white/[0.08]',
// //           )}
// //         >
// //           {/* Actor selector row */}
// //           <div className="flex items-center gap-1 px-4 sm:px-5 pt-4">
// //             <button
// //               ref={actorBtnRef}
// //               type="button"
// //               onClick={toggleActorMenu}
// //               aria-haspopup="listbox"
// //               aria-expanded={actorMenuOpen}
// //               className={cn(
// //                 'flex items-center gap-1 pl-3 pr-2.5 py-1.5 rounded-full shrink-0',
// //                 'text-[12.5px] font-medium transition-colors border',
// //                 selectedActorMeta
// //                   ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
// //                   : 'bg-[#151D33] border-white/[0.10] text-[#8A96B8] hover:border-white/[0.2]'
// //               )}
// //             >
// //               {selectedActorMeta ? (
// //                 <>
// //                   <span aria-hidden="true">{selectedActorMeta.emoji}</span>
// //                   {selectedActorMeta.label}
// //                 </>
// //               ) : (
// //                 <>I am a ...</>
// //               )}
// //               <svg
// //                 className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
// //                 viewBox="0 0 12 12" fill="none" aria-hidden="true"
// //               >
// //                 <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
// //               </svg>
// //             </button>
// //             {/* Standalone actor-removal "x" intentionally removed — the
// //                 only way to change the selected actor is to reopen this
// //                 dropdown and pick a different option. */}
// //           </div>

// //           {/* Input row */}
// //           <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 pb-4">
// //             <input
// //               ref={inputRef}
// //               id={id ?? inputId}
// //               type="text"
// //               value={value}
// //               onChange={e => onChange(e.target.value)}
// //               onKeyDown={handleKey}
// //               onFocus={() => setIsFocused(true)}
// //               onBlur={() => setIsFocused(false)}
// //               placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'I want to…' : placeholder)}
// //               autoComplete="off"
// //               spellCheck={false}
// //               aria-label="Describe your planning goal"
// //               title={value || undefined}
// //               className={cn(
// //                 'flex-1 min-w-0 py-1.5 bg-transparent',
// //                 'font-sans text-[17px] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
// //                 'focus:outline-none',
// //                 isListening && 'placeholder:text-[#00D4FF]'
// //               )}
// //             />

// //             {isLoading && (
// //               <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
// //                 <SpinnerIcon />
// //               </span>
// //             )}

// //             <button
// //               type="button"
// //               onClick={handleMicClick}
// //               aria-label={isListening ? 'Stop voice input' : 'Voice input'}
// //               aria-pressed={isListening}
// //               className={cn(
// //                 'relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors',
// //                 isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#5A6A8A] hover:bg-white/[0.06]'
// //               )}
// //             >
// //               {isListening && (
// //                 <span className="absolute inset-0 rounded-full bg-[#00D4FF]/40 animate-ping" aria-hidden="true" />
// //               )}
// //               {isListening ? (
// //                 <span className="relative flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
// //                   {[0, 1, 2, 3].map(i => (
// //                     <span
// //                       key={i}
// //                       className="w-[2.5px] rounded-full bg-[#050A12] mic-bar"
// //                       style={{ animationDelay: `${i * 0.12}s` }}
// //                     />
// //                   ))}
// //                 </span>
// //               ) : (
// //                 <MicIcon />
// //               )}
// //             </button>
// //           </div>

// //           {/* ── Footer bar: hint left, solid CTA button right ──── */}
// //           <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-white/[0.06]">
// //             {/* <p aria-live="polite" aria-atomic="true" className="text-[12.5px] text-[#E6B905] truncate">
// //               {isListening ? (
// //                 <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
// //               ) : (
// //                 hintDefault
// //               )}
// //             </p> */}

// //             <div className="relative shrink-0 group/tooltip">
// //               <button
// //                 type="button"
// //                 onClick={handleSubmitClick}
// //                 disabled={!canSubmit && !needsActor}
// //                 aria-label={needsActor ? 'Select who you are to continue' : 'Check planning route'}
// //                 aria-describedby={needsActor ? `${id ?? inputId}-arrow-tooltip` : undefined}
// //                 className={cn(
// //                   'flex items-center gap-1.5 px-4 py-2 rounded-lg shrink-0',
// //                   'text-[13.5px] font-semibold transition-colors duration-150',
// //                   canSubmit
// //                     ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white'
// //                     : needsActor
// //                       ? 'bg-[rgba(0,212,255,0.14)] text-[#00D4FF] border border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.22)]'
// //                       : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
// //                 )}
// //               >
// //                 Get your free report
// //                 <ArrowUpIcon />
// //               </button>

// //               {needsActor && (
// //                 <span
// //                   id={`${id ?? inputId}-arrow-tooltip`}
// //                   role="tooltip"
// //                   className={cn(
// //                     'pointer-events-none absolute bottom-full right-0 mb-2 z-20',
// //                     'whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11.5px] font-medium',
// //                     'bg-[#131A2C] text-[#00D4FF] border border-[rgba(0,212,255,0.32)]',
// //                     'shadow-[0_10px_24px_rgba(0,0,0,0.45)]',
// //                     'opacity-0 translate-y-1 scale-95 origin-bottom-right',
// //                     'transition-all duration-150 ease-out',
// //                     'group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100'
// //                   )}
// //                 >
// //                   Select who you are first
// //                   <span
// //                     aria-hidden="true"
// //                     className="absolute top-full right-3.5 -mt-px w-2 h-2 rotate-45 bg-[#131A2C] border-r border-b border-[rgba(0,212,255,0.32)]"
// //                   />
// //                 </span>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* ── Actor dropdown — portaled to <body> so it's never clipped ── */}
// //       {mounted && actorMenuOpen && menuPos && createPortal(
// //         <>
// //           <div
// //             className="fixed inset-0 z-[100]"
// //             onClick={() => setActorMenuOpen(false)}
// //             aria-hidden="true"
// //           />
// //           <div
// //             ref={actorMenuRef}
// //             role="listbox"
// //             aria-label="Select who you are"
// //             style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
// //             className={cn(
// //               'fixed z-[101] origin-top-left',
// //               'w-max max-w-[min(300px,86vw)] rounded-xl p-1.5',
// //               'bg-[#131A2C] border border-white/[0.10]',
// //               'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
// //               'animate-[dropIn_0.15s_ease-out]'
// //             )}
// //           >
// //             {/* Caret connecting the dropdown to the "Step 1" pill above */}
// //             <span
// //               aria-hidden="true"
// //               className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C] border-l border-t border-white/[0.10]"
// //             />

// //             <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
// //               {ACTORS.map((actor, index) => {
// //                 const isSelected = selectedActor === actor.id
// //                 return (
// //                   <button
// //                     key={actor.id}
// //                     type="button"
// //                     role="option"
// //                     aria-selected={isSelected}
// //                     onClick={() => handleActorPillClick(actor.id)}
// //                     className={cn(
// //                       'flex items-center gap-3 px-2.5 py-2 rounded-lg text-left w-full',
// //                       'transition-colors duration-150',
// //                       isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
// //                     )}
// //                     style={{
// //                       animationName: 'fadeInUp',
// //                       animationDuration: '0.15s',
// //                       animationFillMode: 'both',
// //                       animationDelay: `${index * 25}ms`,
// //                     }}
// //                   >
// //                     <span
// //                       className={cn(
// //                         'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
// //                         isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
// //                       )}
// //                       aria-hidden="true"
// //                     >
// //                       {actor.emoji}
// //                     </span>

// //                     <span className="flex-1 min-w-0">
// //                       <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
// //                         {actor.label}
// //                       </span>
// //                       {actor.description && (
// //                         <span className="block text-[11.5px] text-[#5A6A8A] truncate">
// //                           {actor.description}
// //                         </span>
// //                       )}
// //                     </span>

// //                     {isSelected && (
// //                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
// //                         <path d="M20 6 9 17l-5-5" />
// //                       </svg>
// //                     )}
// //                   </button>
// //                 )
// //               })}
// //             </div>
// //           </div>
// //         </>,
// //         document.body
// //       )}

// //       <style jsx>{`
// //         @keyframes dropIn {
// //           from { opacity: 0; transform: translateY(-6px) scale(0.97); }
// //           to   { opacity: 1; transform: translateY(0) scale(1); }
// //         }
// //         @keyframes fadeInUp {
// //           from { opacity: 0; transform: translateY(6px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }
// //         .mic-bar {
// //           height: 100%;
// //           animation: micWave 0.9s ease-in-out infinite;
// //         }
// //         @keyframes micWave {
// //           0%, 100% { transform: scaleY(0.35); }
// //           50%      { transform: scaleY(1); }
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // function SpinnerIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //       <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
// //     </svg>
// //   )
// // }

// // function MicIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
// //       <rect x="9" y="2" width="6" height="12" rx="3"/>
// //       <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
// //     </svg>
// //   )
// // }

// // function ArrowUpIcon() {
// //   return (
// //     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
// //       <path d="M5 12h14M13 6l6 6-6 6"/>
// //     </svg>
// //   )
// // }


// // 'use client'

// // import React, { useRef, useId, useState, useEffect, useLayoutEffect } from 'react'
// // import { createPortal } from 'react-dom'
// // import { cn } from '@/lib/cn'
// // import { ACTORS } from '@/lib/actors'
// // import type { SearchSuggestion, ActorId, ActorSuggestion } from '@/types'

// // interface SearchBarProps {
// //   id?: string
// //   value:         string
// //   suggestion:    SearchSuggestion | null
// //   isLoading:     boolean
// //   onChange:      (value: string) => void
// //   onSubmit:      () => void
// //   placeholder?:  string
// //   className?:    string
// //   hintDefault?:  string
// //   onAcceptSuggestion?: (suggestion: SearchSuggestion) => void

// //   selectedActor?:      ActorId | null
// //   actorSuggestion?:    ActorSuggestion | null
// //   onSelectActor?:      (actorId: ActorId | null) => void
// //   onAcceptActorSuggestion?: () => void

// //   /** Called when voice input starts/stops. Wire this to your speech-to-text hook. */
// //   onVoiceToggle?: (listening: boolean) => void

// //   /** Fires whenever the field gains/loses focus — use this in the parent
// //    *  to hide things like quick-action pills while the user is typing,
// //    *  and bring them back once they click outside. */
// //   onFocusChange?: (focused: boolean) => void
// // }

// // function articleFor(label: string): 'a' | 'an' {
// //   return /^[aeiou]/i.test(label) ? 'an' : 'a'
// // }

// // /**
// //  * Highlights the phrase "free report" in yellow within an otherwise
// //  * plain hint string, matching the coloured "free report" span used in
// //  * the hero paragraph above the search bar. Case-insensitive; renders
// //  * the rest of the string unchanged around it. Matches on \s so it
// //  * still finds the phrase even if a non-breaking space was used to
// //  * keep "Free report" glued together for line-wrapping purposes.
// //  */
// // function highlightFreeReport(text: string): React.ReactNode {
// //   const match = /free\s+report/i.exec(text)
// //   if (!match) return text
// //   const start = match.index
// //   const end = start + match[0].length
// //   return (
// //     <>
// //       {text.slice(0, start)}
// //       <span className="text-[#F2C94C] font-medium whitespace-nowrap">{text.slice(start, end)}</span>
// //       {text.slice(end)}
// //     </>
// //   )
// // }

// // // Apple-ish "ease out expo" — fast start, long smooth settle. Used for
// // // every distraction-free transition below so they all feel like one
// // // coordinated motion rather than several independently-timed ones.
// // const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// // const EXPAND_MS = 520

// // export function SearchBar({
// //   id,
// //   value,
// //   suggestion,
// //   isLoading,
// //   onChange,
// //   onSubmit,
// //   placeholder = 'I want to build a rear extension…',
// //   className,
// //   hintDefault = 'No planning knowledge needed · Expert consultants available · Get a Free report',
// //   onAcceptSuggestion,
// //   selectedActor = null,
// //   actorSuggestion = null,
// //   onSelectActor,
// //   onAcceptActorSuggestion,
// //   onVoiceToggle,
// //   onFocusChange,
// // }: SearchBarProps) {
// //   const inputRef = useRef<HTMLInputElement>(null)
// //   const inputId  = useId()

// //   const actorBtnRef  = useRef<HTMLButtonElement>(null)
// //   const actorMenuRef = useRef<HTMLDivElement>(null)
// //   const [actorMenuOpen, setActorMenuOpen] = useState(false)
// //   const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
// //   const [isListening, setIsListening] = useState(false)
// //   const [mounted, setMounted] = useState(false)

// //   // ── Distraction-free mode ──────────────────────────────────────
// //   // Expands the moment the field is focused (feels instant/responsive,
// //   // like Spotlight) and stays expanded for as long as there's text,
// //   // even after blur — so a half-typed query doesn't collapse on you.
// //   const [isFocused, setIsFocused] = useState(false)
// //   const hasText = value.trim().length > 0
// //   const isExpanded = isFocused || hasText

// //   // Let the parent react to focus/blur — e.g. to hide the quick-action
// //   // pills below the search bar while typing, and reveal them again on
// //   // outside click (blur), independent of whether text was entered.
// //   useEffect(() => {
// //     onFocusChange?.(isFocused)
// //   }, [isFocused, onFocusChange])

// //   const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

// //   const showActorBanner =
// //     actorSuggestion &&
// //     actorSuggestion.actorId !== selectedActor &&
// //     actorSuggestion.confidence >= 0.55

// //   // Portal target only exists client-side
// //   useEffect(() => { setMounted(true) }, [])

// //   // Recompute dropdown position whenever it opens, and keep it pinned
// //   // to the trigger button on scroll/resize while open.
// //   useLayoutEffect(() => {
// //     if (!actorMenuOpen) return

// //     const updatePosition = () => {
// //       const rect = actorBtnRef.current?.getBoundingClientRect()
// //       if (!rect) return
// //       setMenuPos({
// //         top: rect.bottom + 6,
// //         left: rect.left,
// //         width: rect.width,
// //       })
// //     }

// //     updatePosition()
// //     window.addEventListener('scroll', updatePosition, true)
// //     window.addEventListener('resize', updatePosition)
// //     return () => {
// //       window.removeEventListener('scroll', updatePosition, true)
// //       window.removeEventListener('resize', updatePosition)
// //     }
// //   }, [actorMenuOpen])

// //   // Click-outside handling — must check both the trigger button and the
// //   // portaled dropdown, since they're no longer in the same DOM subtree.
// //   useEffect(() => {
// //     function handleClickOutside(e: MouseEvent) {
// //       const target = e.target as Node
// //       const clickedButton = actorBtnRef.current?.contains(target)
// //       const clickedMenu    = actorMenuRef.current?.contains(target)
// //       if (!clickedButton && !clickedMenu) {
// //         setActorMenuOpen(false)
// //       }
// //     }
// //     document.addEventListener('mousedown', handleClickOutside)
// //     return () => document.removeEventListener('mousedown', handleClickOutside)
// //   }, [])

// //   // Close on Escape
// //   useEffect(() => {
// //     if (!actorMenuOpen) return
// //     function handleEscape(e: KeyboardEvent) {
// //       if (e.key === 'Escape') setActorMenuOpen(false)
// //     }
// //     document.addEventListener('keydown', handleEscape)
// //     return () => document.removeEventListener('keydown', handleEscape)
// //   }, [actorMenuOpen])

// //   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter') {
// //       e.preventDefault()
// //       onSubmit()
// //     }
// //     if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
// //       e.preventDefault()
// //       onAcceptSuggestion(suggestion)
// //     }
// //     // Backspace at the very start of an empty input clears the actor prefix
// //     if (e.key === 'Backspace' && value.length === 0 && selectedActorMeta) {
// //       e.preventDefault()
// //       onSelectActor?.(null)
// //     }
// //   }

// //   const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     onSubmit()
// //   }

// //   const handleSuggestionClick = () => {
// //     if (suggestion && onAcceptSuggestion) onAcceptSuggestion(suggestion)
// //   }

// //   const handleActorPillClick = (actorId: ActorId) => {
// //     onSelectActor?.(selectedActor === actorId ? null : actorId)
// //     setActorMenuOpen(false)
// //     inputRef.current?.focus()
// //   }

// //   const toggleActorMenu = () => {
// //     if (!actorMenuOpen && actorBtnRef.current) {
// //       const rect = actorBtnRef.current.getBoundingClientRect()
// //       setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
// //     }
// //     setActorMenuOpen(o => !o)
// //   }

// //   const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     setIsListening(prev => {
// //       const next = !prev
// //       onVoiceToggle?.(next)
// //       return next
// //     })
// //   }

// //   const canSubmit = value.trim().length > 0 && !isLoading

// //   // Default hint text collapses in distraction-free mode — but the
// //   // suggestion ("Tab to accept…") and the listening state stay visible
// //   // since those are actively useful while the person is typing.
// //   const hideDefaultHint = isExpanded && !suggestion && !isListening

// //   return (
// //     <div className={cn('w-full', className)} role="search">

// //       {/* ── Auto-detected actor banner ─────────────────────────── */}
// //       {showActorBanner && actorSuggestion && (
// //         <div
// //           className={cn(
// //             'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-[10px]',
// //             'bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.22)]',
// //             'animate-[fadeIn_0.2s_ease-out]'
// //           )}
// //           role="status"
// //           aria-live="polite"
// //         >
// //           <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
// //             {actorSuggestion.wasCorrected ? '✏️' : '👋'}
// //           </span>
// //           <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
// //             {actorSuggestion.wasCorrected ? (
// //               <>
// //                 Did you mean{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>
// //                 {actorSuggestion.correctedFrom && (
// //                   <span className="text-[#5A6A8A]"> (we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)</span>
// //                 )}
// //                 ?
// //               </>
// //             ) : (
// //               <>
// //                 Looks like you're a{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>{' '}
// //                 — should we set up your workspace for that?
// //               </>
// //             )}
// //           </p>
// //           <div className="flex items-center gap-1.5 shrink-0">
// //             <button
// //               type="button"
// //               onClick={onAcceptActorSuggestion}
// //               className="px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
// //             >
// //               ✓ Yes
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => onSelectActor?.(null)}
// //               className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
// //             >
// //               No
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── Glass search bar ───────────────────────────────────── */}
// //       <div className="relative">
// //         <div
// //           className={cn(
// //             'relative rounded-[24px]',
// //             'bg-white/[0.08] backdrop-blur-2xl backdrop-saturate-150',
// //             'border border-white/[0.14]',
// //             'transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
// //             'focus-within:border-[rgba(0,212,255,0.35)]',
// //             isExpanded
// //               ? 'shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_3px_rgba(0,212,255,0.14)] scale-[1.008]'
// //               : 'shadow-[0_10px_40px_rgba(0,0,0,0.45)]'
// //           )}
// //         >
// //           {/* Single row: actor pill (always top-left) + input + mic + send.
// //               The actor trigger used to live in a second row that only
// //               appeared once the bar was collapsed — it now stays put
// //               regardless of focus/expand state. */}
// //           <div className="flex items-center gap-2 px-4 sm:px-5 py-4 sm:py-5">
// //             {/* Actor trigger — permanently pinned to the top-left */}
// //             <button
// //               ref={actorBtnRef}
// //               type="button"
// //               onClick={toggleActorMenu}
// //               aria-haspopup="listbox"
// //               aria-expanded={actorMenuOpen}
// //               className={cn(
// //                 'flex items-center gap-1 pl-3.5 pr-3 py-2 rounded-full shrink-0',
// //                 'text-[13.5px] font-medium transition-colors border',
// //                 selectedActorMeta
// //                   ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
// //                   : 'bg-white/[0.05] border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.09] hover:border-white/[0.2]'
// //               )}
// //             >
// //               {selectedActorMeta ? (
// //                 <>
// //                   <span aria-hidden="true">{selectedActorMeta.emoji}</span>
// //                   {selectedActorMeta.label}
// //                 </>
// //               ) : (
// //                 <>Step 1</>
// //               )}
// //               <svg
// //                 className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
// //                 viewBox="0 0 12 12" fill="none" aria-hidden="true"
// //               >
// //                 <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
// //               </svg>
// //             </button>

// //             {/* Small remove ("x") for the selected actor, sits right after the pill */}
// //             {selectedActorMeta && (
// //               <button
// //                 type="button"
// //                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectActor?.(null) }}
// //                 aria-label={`Remove ${selectedActorMeta.label}`}
// //                 className="text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors shrink-0 -ml-1 p-1"
// //               >
// //                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
// //                   <path d="M18 6 6 18M6 6l12 12"/>
// //                 </svg>
// //               </button>
// //             )}

// //             <input
// //               ref={inputRef}
// //               id={inputId}
// //               type="text"
// //               value={value}
// //               onChange={e => onChange(e.target.value)}
// //               onKeyDown={handleKey}
// //               onFocus={() => setIsFocused(true)}
// //               onBlur={() => setIsFocused(false)}
// //               placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'and I want to…' : placeholder)}
// //               autoComplete="off"
// //               spellCheck={false}
// //               aria-label="Describe your planning goal"
// //               className={cn(
// //                 'flex-1 min-w-0 py-2 bg-transparent',
// //                 'font-sans text-[#E8F0FF] placeholder:text-[#7C88A6]',
// //                 'focus:outline-none',
// //                 'transition-[font-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
// //                 isExpanded ? 'text-[17px] sm:text-[18px]' : 'text-[16px]',
// //                 isListening && 'placeholder:text-[#00D4FF]'
// //               )}
// //             />

// //             {isLoading && (
// //               <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
// //                 <SpinnerIcon />
// //               </span>
// //             )}

// //             {/* Mic with listening animation */}
// //             <button
// //               type="button"
// //               onClick={handleMicClick}
// //               aria-label={isListening ? 'Stop voice input' : 'Voice input'}
// //               aria-pressed={isListening}
// //               className={cn(
// //                 'relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors',
// //                 isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#A8B8D8] hover:bg-white/[0.08]'
// //               )}
// //             >
// //               {isListening && (
// //                 <span className="absolute inset-0 rounded-full bg-[#00D4FF]/40 animate-ping" aria-hidden="true" />
// //               )}
// //               {isListening ? (
// //                 <span className="relative flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
// //                   {[0, 1, 2, 3].map(i => (
// //                     <span
// //                       key={i}
// //                       className="w-[2.5px] rounded-full bg-[#050A12] mic-bar"
// //                       style={{ animationDelay: `${i * 0.12}s` }}
// //                     />
// //                   ))}
// //                 </span>
// //               ) : (
// //                 <MicIcon />
// //               )}
// //             </button>

// //             <button
// //               type="button"
// //               onClick={handleSubmitClick}
// //               disabled={!canSubmit}
// //               aria-label="Check planning route"
// //               className={cn(
// //                 'flex items-center justify-center w-10 h-10 rounded-full shrink-0 ml-0.5',
// //                 'transition-all duration-150',
// //                 canSubmit
// //                   ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] active:scale-[0.95]'
// //                   : 'bg-white/[0.08] text-white/25 cursor-not-allowed'
// //               )}
// //             >
// //               <ArrowUpIcon />
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* ── Actor dropdown — portaled to <body> so it's never clipped ── */}
// //       {mounted && actorMenuOpen && menuPos && createPortal(
// //         <>
// //           <div
// //             className="fixed inset-0 z-[100]"
// //             onClick={() => setActorMenuOpen(false)}
// //             aria-hidden="true"
// //           />
// //           <div
// //   ref={actorMenuRef}
// //   role="listbox"
// //   aria-label="Select who you are"
// //   style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
// //   className={cn(
// //     'fixed z-[101] origin-top-left',
// //     'w-max max-w-[min(300px,86vw)] rounded-[16px] p-1.5',
// //     'bg-[#131A2C]/95 backdrop-blur-xl border border-white/[0.10]',
// //     'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
// //     'animate-[dropIn_0.15s_ease-out]'
// //   )}
// // >
// //   {/* Caret connecting the dropdown to the "I am a…" pill above */}
// //   <span
// //     aria-hidden="true"
// //     className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C]/95 border-l border-t border-white/[0.10]"
// //   />

// //   <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
// //     {ACTORS.map((actor, index) => {
// //       const isSelected = selectedActor === actor.id
// //       return (
// //         <button
// //           key={actor.id}
// //           type="button"
// //           role="option"
// //           aria-selected={isSelected}
// //           onClick={() => handleActorPillClick(actor.id)}
// //           className={cn(
// //             'flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-left w-full',
// //             'transition-colors duration-150',
// //             isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
// //           )}
// //           style={{
// //             animationName: 'fadeInUp',
// //             animationDuration: '0.15s',
// //             animationFillMode: 'both',
// //             animationDelay: `${index * 25}ms`,
// //           }}
// //         >
// //           <span
// //             className={cn(
// //               'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
// //               isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
// //             )}
// //             aria-hidden="true"
// //           >
// //             {actor.emoji}
// //           </span>

// //           <span className="flex-1 min-w-0">
// //             <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
// //               {actor.label}
// //             </span>
// //             {actor.description && (
// //               <span className="block text-[11.5px] text-[#5A6A8A] truncate">
// //                 {actor.description}
// //               </span>
// //             )}
// //           </span>

// //           {isSelected && (
// //             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
// //               <path d="M20 6 9 17l-5-5" />
// //             </svg>
// //           )}
// //         </button>
// //       )
// //     })}
// //   </div>
// // </div>
// //         </>,
// //         document.body
// //       )}

// //       {/* ── Hint / suggestion row ─────────────────────────────── */}
// //       <div
// //         style={{
// //           display: 'grid',
// //           gridTemplateRows: hideDefaultHint ? '0fr' : '1fr',
// //           opacity: hideDefaultHint ? 0 : 1,
// //           transition: `grid-template-rows ${EXPAND_MS}ms ${EASE}, opacity 260ms ${EASE}`,
// //         }}
// //       >
// //         <div className="overflow-hidden">
// //           <p
// //             aria-live="polite"
// //             aria-atomic="true"
// //             className="mt-2.5 text-xs text-center min-h-[18px] mx-auto max-w-full px-2"
// //           >
// //             {isListening ? (
// //               <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
// //             ) : suggestion ? (
// //               <span className="text-[#00D4FF]" style={{ textShadow: '0 0 12px rgba(0,212,255,0.4)' }}>
// //                 <button
// //                   type="button"
// //                   onClick={handleSuggestionClick}
// //                   className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
// //                 >
// //                   → {suggestion.label}
// //                 </button>
// //                 <span className="ml-2 text-[#5A6A8A]">
// //                   · Press Tab to accept, Enter or click send to search
// //                 </span>
// //               </span>
// //             ) : (
// //               <>
// //                 <span className="block sm:whitespace-nowrap text-[15px] sm:text-[16px] text-[#A8B8D8] leading-relaxed">
// //                   {hintDefault.split('·').slice(0, -1).join('·').trim()}
// //                 </span>
// //                 <span className="block sm:whitespace-nowrap text-[15px] sm:text-[16px] text-[#A8B8D8] leading-relaxed">
// //                   {highlightFreeReport(hintDefault.split('·').slice(-1)[0].trim())}
// //                 </span>
// //               </>
// //             )}
// //           </p>
// //         </div>
// //       </div>

// //       <style jsx>{`
// //         @keyframes dropIn {
// //           from { opacity: 0; transform: translateY(-6px) scale(0.97); }
// //           to   { opacity: 1; transform: translateY(0) scale(1); }
// //         }
// //         @keyframes fadeInUp {
// //           from { opacity: 0; transform: translateY(6px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }
// //         .mic-bar {
// //           height: 100%;
// //           animation: micWave 0.9s ease-in-out infinite;
// //         }
// //         @keyframes micWave {
// //           0%, 100% { transform: scaleY(0.35); }
// //           50%      { transform: scaleY(1); }
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // function SpinnerIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //       <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
// //     </svg>
// //   )
// // }

// // function MicIcon() {
// //   return (
// //     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
// //       <rect x="9" y="2" width="6" height="12" rx="3"/>
// //       <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
// //     </svg>
// //   )
// // }

// // function ArrowUpIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
// //       <path d="M12 19V5M5 12l7-7 7 7"/>
// //     </svg>
// //   )
// // }


// // with search actor intent pill bottom /////

// // 'use client'

// // import React, { useRef, useId, useState, useEffect, useLayoutEffect } from 'react'
// // import { createPortal } from 'react-dom'
// // import { cn } from '@/lib/cn'
// // import { ACTORS } from '@/lib/actors'
// // import type { SearchSuggestion, ActorId, ActorSuggestion } from '@/types'

// // interface SearchBarProps {
// //   id?: string
// //   value:         string
// //   suggestion:    SearchSuggestion | null
// //   isLoading:     boolean
// //   onChange:      (value: string) => void
// //   onSubmit:      () => void
// //   placeholder?:  string
// //   className?:    string
// //   hintDefault?:  string
// //   onAcceptSuggestion?: (suggestion: SearchSuggestion) => void

// //   selectedActor?:      ActorId | null
// //   actorSuggestion?:    ActorSuggestion | null
// //   onSelectActor?:      (actorId: ActorId | null) => void
// //   onAcceptActorSuggestion?: () => void

// //   /** Called when voice input starts/stops. Wire this to your speech-to-text hook. */
// //   onVoiceToggle?: (listening: boolean) => void

// //   /** Fires whenever the field gains/loses focus — use this in the parent
// //    *  to hide things like quick-action pills while the user is typing,
// //    *  and bring them back once they click outside. */
// //   onFocusChange?: (focused: boolean) => void
// // }

// // function articleFor(label: string): 'a' | 'an' {
// //   return /^[aeiou]/i.test(label) ? 'an' : 'a'
// // }

// // /**
// //  * Highlights the phrase "free report" in yellow within an otherwise
// //  * plain hint string, matching the coloured "free report" span used in
// //  * the hero paragraph above the search bar. Case-insensitive; renders
// //  * the rest of the string unchanged around it. Matches on \s so it
// //  * still finds the phrase even if a non-breaking space was used to
// //  * keep "Free report" glued together for line-wrapping purposes.
// //  */
// // function highlightFreeReport(text: string): React.ReactNode {
// //   const match = /free\s+report/i.exec(text)
// //   if (!match) return text
// //   const start = match.index
// //   const end = start + match[0].length
// //   return (
// //     <>
// //       {text.slice(0, start)}
// //       <span className="text-[#F2C94C] font-medium whitespace-nowrap">{text.slice(start, end)}</span>
// //       {text.slice(end)}
// //     </>
// //   )
// // }

// // // Apple-ish "ease out expo" — fast start, long smooth settle. Used for
// // // every distraction-free transition below so they all feel like one
// // // coordinated motion rather than several independently-timed ones.
// // const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// // const EXPAND_MS = 520

// // export function SearchBar({
// //   id,
// //   value,
// //   suggestion,
// //   isLoading,
// //   onChange,
// //   onSubmit,
// //   placeholder = 'Type your query here or select from the list below',
// //   className,
// //   hintDefault = 'No planning knowledge needed · Expert consultants available · Get a Free report',
// //   onAcceptSuggestion,
// //   selectedActor = null,
// //   actorSuggestion = null,
// //   onSelectActor,
// //   onAcceptActorSuggestion,
// //   onVoiceToggle,
// //   onFocusChange,
// // }: SearchBarProps) {
// //   const inputRef = useRef<HTMLInputElement>(null)
// //   const inputId  = useId()

// //   const actorBtnRef  = useRef<HTMLButtonElement>(null)
// //   const actorMenuRef = useRef<HTMLDivElement>(null)
// //   const [actorMenuOpen, setActorMenuOpen] = useState(false)
// //   const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
// //   const [isListening, setIsListening] = useState(false)
// //   const [mounted, setMounted] = useState(false)

// //   // ── Distraction-free mode ──────────────────────────────────────
// //   // Expands the moment the field is focused (feels instant/responsive,
// //   // like Spotlight) and stays expanded for as long as there's text,
// //   // even after blur — so a half-typed query doesn't collapse on you.
// //   const [isFocused, setIsFocused] = useState(false)
// //   const hasText = value.trim().length > 0
// //   const isExpanded = isFocused || hasText

// //   // Let the parent react to focus/blur — e.g. to hide the quick-action
// //   // pills below the search bar while typing, and reveal them again on
// //   // outside click (blur), independent of whether text was entered.
// //   useEffect(() => {
// //     onFocusChange?.(isFocused)
// //   }, [isFocused, onFocusChange])

// //   const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

// //   const showActorBanner =
// //     actorSuggestion &&
// //     actorSuggestion.actorId !== selectedActor &&
// //     actorSuggestion.confidence >= 0.55

// //   // Portal target only exists client-side
// //   useEffect(() => { setMounted(true) }, [])

// //   // Recompute dropdown position whenever it opens, and keep it pinned
// //   // to the trigger button on scroll/resize while open.
// //   useLayoutEffect(() => {
// //     if (!actorMenuOpen) return

// //     const updatePosition = () => {
// //       const rect = actorBtnRef.current?.getBoundingClientRect()
// //       if (!rect) return
// //       setMenuPos({
// //         top: rect.bottom + 6,
// //         left: rect.left,
// //         width: rect.width,
// //       })
// //     }

// //     updatePosition()
// //     window.addEventListener('scroll', updatePosition, true)
// //     window.addEventListener('resize', updatePosition)
// //     return () => {
// //       window.removeEventListener('scroll', updatePosition, true)
// //       window.removeEventListener('resize', updatePosition)
// //     }
// //   }, [actorMenuOpen])

// //   // Click-outside handling — must check both the trigger button and the
// //   // portaled dropdown, since they're no longer in the same DOM subtree.
// //   useEffect(() => {
// //     function handleClickOutside(e: MouseEvent) {
// //       const target = e.target as Node
// //       const clickedButton = actorBtnRef.current?.contains(target)
// //       const clickedMenu    = actorMenuRef.current?.contains(target)
// //       if (!clickedButton && !clickedMenu) {
// //         setActorMenuOpen(false)
// //       }
// //     }
// //     document.addEventListener('mousedown', handleClickOutside)
// //     return () => document.removeEventListener('mousedown', handleClickOutside)
// //   }, [])

// //   // Close on Escape
// //   useEffect(() => {
// //     if (!actorMenuOpen) return
// //     function handleEscape(e: KeyboardEvent) {
// //       if (e.key === 'Escape') setActorMenuOpen(false)
// //     }
// //     document.addEventListener('keydown', handleEscape)
// //     return () => document.removeEventListener('keydown', handleEscape)
// //   }, [actorMenuOpen])

// //   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter') {
// //       e.preventDefault()
// //       onSubmit()
// //     }
// //     if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
// //       e.preventDefault()
// //       onAcceptSuggestion(suggestion)
// //     }
// //     // Backspace at the very start of an empty input clears the actor prefix
// //     if (e.key === 'Backspace' && value.length === 0 && selectedActorMeta) {
// //       e.preventDefault()
// //       onSelectActor?.(null)
// //     }
// //   }

// //   const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     onSubmit()
// //   }

// //   const handleSuggestionClick = () => {
// //     if (suggestion && onAcceptSuggestion) onAcceptSuggestion(suggestion)
// //   }

// //   const handleActorPillClick = (actorId: ActorId) => {
// //     onSelectActor?.(selectedActor === actorId ? null : actorId)
// //     setActorMenuOpen(false)
// //     inputRef.current?.focus()
// //   }

// //   const toggleActorMenu = () => {
// //     if (!actorMenuOpen && actorBtnRef.current) {
// //       const rect = actorBtnRef.current.getBoundingClientRect()
// //       setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
// //     }
// //     setActorMenuOpen(o => !o)
// //   }

// //   const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     setIsListening(prev => {
// //       const next = !prev
// //       onVoiceToggle?.(next)
// //       return next
// //     })
// //   }

// //   const canSubmit = value.trim().length > 0 && !isLoading

// //   // Mic/send only earn their place once there's text to act on, or the
// //   // mic is already mid-recording (so tapping "stop" stays reachable).
// //   const showActions = hasText || isListening

// //   // Default hint text collapses in distraction-free mode — but the
// //   // suggestion ("Tab to accept…") and the listening state stay visible
// //   // since those are actively useful while the person is typing.
// //   const hideDefaultHint = isExpanded && !suggestion && !isListening

// //   return (
// //     <div className={cn('w-full', className)} role="search">

// //       {/* ── Auto-detected actor banner ─────────────────────────── */}
// //       {showActorBanner && actorSuggestion && (
// //         <div
// //           className={cn(
// //             'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-[10px]',
// //             'bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.22)]',
// //             'animate-[fadeIn_0.2s_ease-out]'
// //           )}
// //           role="status"
// //           aria-live="polite"
// //         >
// //           <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
// //             {actorSuggestion.wasCorrected ? '✏️' : '👋'}
// //           </span>
// //           <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
// //             {actorSuggestion.wasCorrected ? (
// //               <>
// //                 Did you mean{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>
// //                 {actorSuggestion.correctedFrom && (
// //                   <span className="text-[#5A6A8A]"> (we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)</span>
// //                 )}
// //                 ?
// //               </>
// //             ) : (
// //               <>
// //                 Looks like you're a{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>{' '}
// //                 — should we set up your workspace for that?
// //               </>
// //             )}
// //           </p>
// //           <div className="flex items-center gap-1.5 shrink-0">
// //             <button
// //               type="button"
// //               onClick={onAcceptActorSuggestion}
// //               className="px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
// //             >
// //               ✓ Yes
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => onSelectActor?.(null)}
// //               className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
// //             >
// //               No
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── Glass search bar ───────────────────────────────────── */}
// //       <div className="relative">
// //         <div
// //           className={cn(
// //             'relative rounded-[24px]',
// //             'bg-white/[0.08] backdrop-blur-2xl backdrop-saturate-150',
// //             'border border-white/[0.14]',
// //             'transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
// //             'focus-within:border-[rgba(0,212,255,0.35)]',
// //             isExpanded
// //               ? 'shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_3px_rgba(0,212,255,0.14)] scale-[1.008]'
// //               : 'shadow-[0_10px_40px_rgba(0,0,0,0.45)]'
// //           )}
// //         >
// //           {/* Two rows: actor selector on its own line up top, input +
// //               mic/send on their own line below. Keeping the persona pill,
// //               free-text field, and action buttons on one shared row was
// //               fine on wide screens but crushed together badly on mobile,
// //               so the actor now always gets its own row regardless of
// //               viewport width. */}
// //           <div className="flex flex-col gap-2.5 px-4 sm:px-5 py-4 sm:py-5">
// //             {/* ── Row 1: actor selector ─────────────────────────── */}
// //             <div className="flex items-center gap-1">
// //               <button
// //                 ref={actorBtnRef}
// //                 type="button"
// //                 onClick={toggleActorMenu}
// //                 aria-haspopup="listbox"
// //                 aria-expanded={actorMenuOpen}
// //                 className={cn(
// //                   'flex items-center gap-1 pl-3.5 pr-3 py-2 rounded-full shrink-0',
// //                   'text-[13.5px] font-medium transition-colors border',
// //                   selectedActorMeta
// //                     ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
// //                     : 'bg-white/[0.05] border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.09] hover:border-white/[0.2]'
// //                 )}
// //               >
// //                 {selectedActorMeta ? (
// //                   <>
// //                     <span aria-hidden="true">{selectedActorMeta.emoji}</span>
// //                     {selectedActorMeta.label}
// //                   </>
// //                 ) : (
// //                   <>I am a ...</>
// //                 )}
// //                 <svg
// //                   className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
// //                   viewBox="0 0 12 12" fill="none" aria-hidden="true"
// //                 >
// //                   <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
// //                 </svg>
// //               </button>

// //               {/* Small remove ("x") for the selected actor, sits right after the pill */}
// //               {selectedActorMeta && (
// //                 <button
// //                   type="button"
// //                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectActor?.(null) }}
// //                   aria-label={`Remove ${selectedActorMeta.label}`}
// //                   className="text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors shrink-0 p-1"
// //                 >
// //                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
// //                     <path d="M18 6 6 18M6 6l12 12"/>
// //                   </svg>
// //                 </button>
// //               )}
// //             </div>

// //             {/* ── Row 2: free text + mic/send ───────────────────── */}
// //             <div className="flex items-center gap-2">
// //               <input
// //                 ref={inputRef}
// //                 id={id ?? inputId}
// //                 type="text"
// //                 value={value}
// //                 onChange={e => onChange(e.target.value)}
// //                 onKeyDown={handleKey}
// //                 onFocus={() => setIsFocused(true)}
// //                 onBlur={() => setIsFocused(false)}
// //                 placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'I want to…' : placeholder)}
// //                 autoComplete="off"
// //                 spellCheck={false}
// //                 aria-label="Describe your planning goal"
// //                 className={cn(
// //                   'flex-1 min-w-0 py-2 bg-transparent',
// //                   'font-sans text-[#E8F0FF] placeholder:text-[#7C88A6]',
// //                   'focus:outline-none',
// //                   'transition-[font-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
// //                   isExpanded ? 'text-[17px] sm:text-[18px]' : 'text-[16px]',
// //                   isListening && 'placeholder:text-[#00D4FF]'
// //                 )}
// //               />

// //               {isLoading && (
// //                 <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
// //                   <SpinnerIcon />
// //                 </span>
// //               )}

// //               {/* Mic + send stay out of the way until there's something to
// //                   act on — no point showing an inert greyed-out arrow next
// //                   to an empty field. They fade/slide in together once the
// //                   person starts typing (or is actively using the mic). */}
// //               <div
// //                 style={{
// //                   display: 'grid',
// //                   gridTemplateColumns: showActions ? '1fr' : '0fr',
// //                   opacity: showActions ? 1 : 0,
// //                   transition: `grid-template-columns ${EXPAND_MS}ms ${EASE}, opacity 200ms ${EASE}`,
// //                 }}
// //                 className="overflow-hidden shrink-0"
// //                 aria-hidden={!showActions}
// //               >
// //                 <div className="flex items-center gap-0.5 min-w-0 pl-0.5">
// //                   {/* Mic with listening animation */}
// //                   <button
// //                     type="button"
// //                     tabIndex={showActions ? 0 : -1}
// //                     onClick={handleMicClick}
// //                     aria-label={isListening ? 'Stop voice input' : 'Voice input'}
// //                     aria-pressed={isListening}
// //                     className={cn(
// //                       'relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors',
// //                       isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#A8B8D8] hover:bg-white/[0.08]'
// //                     )}
// //                   >
// //                     {isListening && (
// //                       <span className="absolute inset-0 rounded-full bg-[#00D4FF]/40 animate-ping" aria-hidden="true" />
// //                     )}
// //                     {isListening ? (
// //                       <span className="relative flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
// //                         {[0, 1, 2, 3].map(i => (
// //                           <span
// //                             key={i}
// //                             className="w-[2.5px] rounded-full bg-[#050A12] mic-bar"
// //                             style={{ animationDelay: `${i * 0.12}s` }}
// //                           />
// //                         ))}
// //                       </span>
// //                     ) : (
// //                       <MicIcon />
// //                     )}
// //                   </button>

// //                   <button
// //                     type="button"
// //                     tabIndex={showActions ? 0 : -1}
// //                     onClick={handleSubmitClick}
// //                     disabled={!canSubmit}
// //                     aria-label="Check planning route"
// //                     className={cn(
// //                       'flex items-center justify-center w-10 h-10 rounded-full shrink-0 ml-0.5',
// //                       'transition-all duration-150',
// //                       canSubmit
// //                         ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] active:scale-[0.95]'
// //                         : 'bg-white/[0.08] text-white/25 cursor-not-allowed'
// //                     )}
// //                   >
// //                     <ArrowUpIcon />
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* ── Actor dropdown — portaled to <body> so it's never clipped ── */}
// //       {mounted && actorMenuOpen && menuPos && createPortal(
// //         <>
// //           <div
// //             className="fixed inset-0 z-[100]"
// //             onClick={() => setActorMenuOpen(false)}
// //             aria-hidden="true"
// //           />
// //           <div
// //   ref={actorMenuRef}
// //   role="listbox"
// //   aria-label="Select who you are"
// //   style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
// //   className={cn(
// //     'fixed z-[101] origin-top-left',
// //     'w-max max-w-[min(300px,86vw)] rounded-[16px] p-1.5',
// //     'bg-[#131A2C]/95 backdrop-blur-xl border border-white/[0.10]',
// //     'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
// //     'animate-[dropIn_0.15s_ease-out]'
// //   )}
// // >
// //   {/* Caret connecting the dropdown to the "I am a…" pill above */}
// //   <span
// //     aria-hidden="true"
// //     className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C]/95 border-l border-t border-white/[0.10]"
// //   />

// //   <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
// //     {ACTORS.map((actor, index) => {
// //       const isSelected = selectedActor === actor.id
// //       return (
// //         <button
// //           key={actor.id}
// //           type="button"
// //           role="option"
// //           aria-selected={isSelected}
// //           onClick={() => handleActorPillClick(actor.id)}
// //           className={cn(
// //             'flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-left w-full',
// //             'transition-colors duration-150',
// //             isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
// //           )}
// //           style={{
// //             animationName: 'fadeInUp',
// //             animationDuration: '0.15s',
// //             animationFillMode: 'both',
// //             animationDelay: `${index * 25}ms`,
// //           }}
// //         >
// //           <span
// //             className={cn(
// //               'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
// //               isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
// //             )}
// //             aria-hidden="true"
// //           >
// //             {actor.emoji}
// //           </span>

// //           <span className="flex-1 min-w-0">
// //             <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
// //               {actor.label}
// //             </span>
// //             {actor.description && (
// //               <span className="block text-[11.5px] text-[#5A6A8A] truncate">
// //                 {actor.description}
// //               </span>
// //             )}
// //           </span>

// //           {isSelected && (
// //             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
// //               <path d="M20 6 9 17l-5-5" />
// //             </svg>
// //           )}
// //         </button>
// //       )
// //     })}
// //   </div>
// // </div>
// //         </>,
// //         document.body
// //       )}

// //       {/* ── Hint / suggestion row ─────────────────────────────── */}
// //       <div
// //         style={{
// //           display: 'grid',
// //           gridTemplateRows: hideDefaultHint ? '0fr' : '1fr',
// //           opacity: hideDefaultHint ? 0 : 1,
// //           transition: `grid-template-rows ${EXPAND_MS}ms ${EASE}, opacity 260ms ${EASE}`,
// //         }}
// //       >
// //         <div className="overflow-hidden">
// //           <p
// //             aria-live="polite"
// //             aria-atomic="true"
// //             className="mt-2.5 text-xs text-center min-h-[18px] mx-auto max-w-full px-2"
// //           >
// //             {isListening ? (
// //               <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
// //             ) : suggestion ? (
// //               <span className="text-[#00D4FF]" style={{ textShadow: '0 0 12px rgba(0,212,255,0.4)' }}>
// //                 <button
// //                   type="button"
// //                   onClick={handleSuggestionClick}
// //                   className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
// //                 >
// //                   → {suggestion.label}
// //                 </button>
// //                 <span className="ml-2 text-[#5A6A8A]">
// //                   · Press Tab to accept, Enter or click send to search
// //                 </span>
// //               </span>
// //             ) : (
// //               <>
// //                 <span className="block sm:whitespace-nowrap text-[15px] sm:text-[16px] text-[#A8B8D8] leading-relaxed">
// //                   {hintDefault.split('·').slice(0, -1).join('·').trim()}
// //                 </span>
// //                 <span className="block sm:whitespace-nowrap text-[15px] sm:text-[16px] text-[#A8B8D8] leading-relaxed">
// //                   {highlightFreeReport(hintDefault.split('·').slice(-1)[0].trim())}
// //                 </span>
// //               </>
// //             )}
// //           </p>
// //         </div>
// //       </div>

// //       <style jsx>{`
// //         @keyframes dropIn {
// //           from { opacity: 0; transform: translateY(-6px) scale(0.97); }
// //           to   { opacity: 1; transform: translateY(0) scale(1); }
// //         }
// //         @keyframes fadeInUp {
// //           from { opacity: 0; transform: translateY(6px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }
// //         .mic-bar {
// //           height: 100%;
// //           animation: micWave 0.9s ease-in-out infinite;
// //         }
// //         @keyframes micWave {
// //           0%, 100% { transform: scaleY(0.35); }
// //           50%      { transform: scaleY(1); }
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // function SpinnerIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //       <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
// //     </svg>
// //   )
// // }

// // function MicIcon() {
// //   return (
// //     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
// //       <rect x="9" y="2" width="6" height="12" rx="3"/>
// //       <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
// //     </svg>
// //   )
// // }

// // function ArrowUpIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
// //       <path d="M12 19V5M5 12l7-7 7 7"/>
// //     </svg>
// //   )
// // }

// // 'use client'

// // import React, { useRef, useId, useState, useEffect, useLayoutEffect } from 'react'
// // import { createPortal } from 'react-dom'
// // import { cn } from '@/lib/cn'
// // import { ACTORS } from '@/lib/actors'
// // import type { SearchSuggestion, ActorId, ActorSuggestion } from '@/types'

// // interface SearchBarProps {
// //   id?: string
// //   value:         string
// //   suggestion:    SearchSuggestion | null
// //   isLoading:     boolean
// //   onChange:      (value: string) => void
// //   onSubmit:      () => void
// //   placeholder?:  string
// //   className?:    string
// //   hintDefault?:  string
// //   onAcceptSuggestion?: (suggestion: SearchSuggestion) => void

// //   selectedActor?:      ActorId | null
// //   actorSuggestion?:    ActorSuggestion | null
// //   onSelectActor?:      (actorId: ActorId | null) => void
// //   onAcceptActorSuggestion?: () => void

// //   /** Called when voice input starts/stops. Wire this to your speech-to-text hook. */
// //   onVoiceToggle?: (listening: boolean) => void

// //   /** Fires whenever the field gains/loses focus — use this in the parent
// //    *  to hide things like quick-action pills while the user is typing,
// //    *  and bring them back once they click outside. */
// //   onFocusChange?: (focused: boolean) => void
// // }

// // function articleFor(label: string): 'a' | 'an' {
// //   return /^[aeiou]/i.test(label) ? 'an' : 'a'
// // }



// // // Apple-ish "ease out expo" — fast start, long smooth settle. Used for
// // // every distraction-free transition below so they all feel like one
// // // coordinated motion rather than several independently-timed ones.
// // const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// // const EXPAND_MS = 520

// // export function SearchBar({
// //   id,
// //   value,
// //   suggestion,
// //   isLoading,
// //   onChange,
// //   onSubmit,
// //   placeholder = 'I want to build a rear extension…',
// //   className,
// //   hintDefault = 'Get your free report · Then speak to an expert',
// //   onAcceptSuggestion,
// //   selectedActor = null,
// //   actorSuggestion = null,
// //   onSelectActor,
// //   onAcceptActorSuggestion,
// //   onVoiceToggle,
// //   onFocusChange,
// // }: SearchBarProps) {
// //   const inputRef = useRef<HTMLInputElement>(null)
// //   const inputId  = useId()

// //   const actorBtnRef  = useRef<HTMLButtonElement>(null)
// //   const actorMenuRef = useRef<HTMLDivElement>(null)
// //   const [actorMenuOpen, setActorMenuOpen] = useState(false)
// //   const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
// //   const [isListening, setIsListening] = useState(false)
// //   const [mounted, setMounted] = useState(false)

// //   // ── Distraction-free mode ──────────────────────────────────────
// //   // Expands the moment the field is focused (feels instant/responsive,
// //   // like Spotlight) and stays expanded for as long as there's text,
// //   // even after blur — so a half-typed query doesn't collapse on you.
// //   const [isFocused, setIsFocused] = useState(false)
// //   const hasText = value.trim().length > 0
// //   const isExpanded = isFocused || hasText

// //   // Let the parent react to focus/blur — e.g. to hide the quick-action
// //   // pills below the search bar while typing, and reveal them again on
// //   // outside click (blur), independent of whether text was entered.
// //   useEffect(() => {
// //     onFocusChange?.(isFocused)
// //   }, [isFocused, onFocusChange])

// //   const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

// //   const showActorBanner =
// //     actorSuggestion &&
// //     actorSuggestion.actorId !== selectedActor &&
// //     actorSuggestion.confidence >= 0.55

// //   // Portal target only exists client-side
// //   useEffect(() => { setMounted(true) }, [])

// //   // Recompute dropdown position whenever it opens, and keep it pinned
// //   // to the trigger button on scroll/resize while open.
// //   useLayoutEffect(() => {
// //     if (!actorMenuOpen) return

// //     const updatePosition = () => {
// //       const rect = actorBtnRef.current?.getBoundingClientRect()
// //       if (!rect) return
// //       setMenuPos({
// //         top: rect.bottom + 6,
// //         left: rect.left,
// //         width: rect.width,
// //       })
// //     }

// //     updatePosition()
// //     window.addEventListener('scroll', updatePosition, true)
// //     window.addEventListener('resize', updatePosition)
// //     return () => {
// //       window.removeEventListener('scroll', updatePosition, true)
// //       window.removeEventListener('resize', updatePosition)
// //     }
// //   }, [actorMenuOpen])

// //   // Click-outside handling — must check both the trigger button and the
// //   // portaled dropdown, since they're no longer in the same DOM subtree.
// //   useEffect(() => {
// //     function handleClickOutside(e: MouseEvent) {
// //       const target = e.target as Node
// //       const clickedButton = actorBtnRef.current?.contains(target)
// //       const clickedMenu    = actorMenuRef.current?.contains(target)
// //       if (!clickedButton && !clickedMenu) {
// //         setActorMenuOpen(false)
// //       }
// //     }
// //     document.addEventListener('mousedown', handleClickOutside)
// //     return () => document.removeEventListener('mousedown', handleClickOutside)
// //   }, [])

// //   // Close on Escape
// //   useEffect(() => {
// //     if (!actorMenuOpen) return
// //     function handleEscape(e: KeyboardEvent) {
// //       if (e.key === 'Escape') setActorMenuOpen(false)
// //     }
// //     document.addEventListener('keydown', handleEscape)
// //     return () => document.removeEventListener('keydown', handleEscape)
// //   }, [actorMenuOpen])

// //   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter') {
// //       e.preventDefault()
// //       if (needsActor) {
// //         toggleActorMenu()
// //         return
// //       }
// //       onSubmit()
// //     }
// //     if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
// //       e.preventDefault()
// //       onAcceptSuggestion(suggestion)
// //     }
// //     // Backspace at the very start of an empty input clears the actor prefix
// //     if (e.key === 'Backspace' && value.length === 0 && selectedActorMeta) {
// //       e.preventDefault()
// //       onSelectActor?.(null)
// //     }
// //   }

// //   const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     if (needsActor) {
// //       toggleActorMenu()
// //       return
// //     }
// //     onSubmit()
// //   }

// //   const handleSuggestionClick = () => {
// //     if (suggestion && onAcceptSuggestion) onAcceptSuggestion(suggestion)
// //   }

// //   const handleActorPillClick = (actorId: ActorId) => {
// //     onSelectActor?.(selectedActor === actorId ? null : actorId)
// //     setActorMenuOpen(false)
// //     inputRef.current?.focus()
// //   }

// //   const toggleActorMenu = () => {
// //     if (!actorMenuOpen && actorBtnRef.current) {
// //       const rect = actorBtnRef.current.getBoundingClientRect()
// //       setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
// //     }
// //     setActorMenuOpen(o => !o)
// //   }

// //   const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     e.stopPropagation()
// //     setIsListening(prev => {
// //       const next = !prev
// //       onVoiceToggle?.(next)
// //       return next
// //     })
// //   }

// //   const canSubmit = value.trim().length > 0 && !isLoading && !!selectedActor

// //   // Typing is always allowed with no actor picked — but once there's
// //   // text, we won't let it be submitted until an actor is chosen. This
// //   // flags that in-between state so the UI can nudge toward the picker
// //   // instead of just quietly refusing to submit.
// //   const needsActor = value.trim().length > 0 && !isLoading && !selectedActor

// //   // Mic/send only earn their place once there's text to act on, or the
// //   // mic is already mid-recording (so tapping "stop" stays reachable).
// //   const showActions = hasText || isListening

// //   // Default hint text collapses in distraction-free mode — but the
// //   // suggestion ("Tab to accept…") and the listening state stay visible
// //   // since those are actively useful while the person is typing.
// //   // Collapses once the field has text (or once expanded) — the inline
// //   // goal-suggestion callout used to show here too, but it's suppressed
// //   // now; Tab-to-accept still works, it's just not visually advertised.
// //   const hideDefaultHint = isExpanded && !isListening

// //   return (
// //     <div className={cn('w-full', className)} role="search">

// //       {/* ── Auto-detected actor banner ─────────────────────────── */}
// //       {showActorBanner && actorSuggestion && (
// //         <div
// //           className={cn(
// //             'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-[10px]',
// //             'bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.22)]',
// //             'animate-[fadeIn_0.2s_ease-out]'
// //           )}
// //           role="status"
// //           aria-live="polite"
// //         >
// //           <span className="text-[#00D4FF] text-sm shrink-0" aria-hidden="true">
// //             {actorSuggestion.wasCorrected ? '✏️' : '👋'}
// //           </span>
// //           <p className="flex-1 text-[12.5px] text-[#A8B8D8] leading-snug">
// //             {actorSuggestion.wasCorrected ? (
// //               <>
// //                 Did you mean{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>
// //                 {actorSuggestion.correctedFrom && (
// //                   <span className="text-[#5A6A8A]"> (we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)</span>
// //                 )}
// //                 ?
// //               </>
// //             ) : (
// //               <>
// //                 Looks like you're a{' '}
// //                 <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>{' '}
// //                 — should we set up your workspace for that?
// //               </>
// //             )}
// //           </p>
// //           <div className="flex items-center gap-1.5 shrink-0">
// //             <button
// //               type="button"
// //               onClick={onAcceptActorSuggestion}
// //               className="px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
// //             >
// //               ✓ Yes
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => onSelectActor?.(null)}
// //               className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
// //             >
// //               No
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── Glass search bar ───────────────────────────────────── */}
// //       <div className="relative">
// //         <div
// //           className={cn(
// //             'relative rounded-[24px]',
// //             'bg-white/[0.08] backdrop-blur-2xl backdrop-saturate-150',
// //             'border border-white/[0.14]',
// //             'transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
// //             'focus-within:border-[rgba(0,212,255,0.35)]',
// //             isExpanded
// //               ? 'shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_3px_rgba(0,212,255,0.14)] scale-[1.008]'
// //               : 'shadow-[0_10px_40px_rgba(0,0,0,0.45)]'
// //           )}
// //         >
// //           {/* Two rows: actor selector on its own line up top, input +
// //               mic/send on their own line below. Keeping the persona pill,
// //               free-text field, and action buttons on one shared row was
// //               fine on wide screens but crushed together badly on mobile,
// //               so the actor now always gets its own row regardless of
// //               viewport width. */}
// //           <div className="flex flex-col gap-2.5 px-4 sm:px-5 py-4 sm:py-5">
// //             {/* ── Row 1: actor selector ─────────────────────────── */}
// //             <div className="flex items-center gap-1">
// //               <button
// //                 ref={actorBtnRef}
// //                 type="button"
// //                 onClick={toggleActorMenu}
// //                 aria-haspopup="listbox"
// //                 aria-expanded={actorMenuOpen}
// //                 className={cn(
// //                   'flex items-center gap-1 pl-3.5 pr-3 py-2 rounded-full shrink-0',
// //                   'text-[13.5px] font-medium transition-colors border',
// //                   selectedActorMeta
// //                     ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
// //                     : 'bg-white/[0.05] border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.09] hover:border-white/[0.2]'
// //                 )}
// //               >
// //                 {selectedActorMeta ? (
// //                   <>
// //                     <span aria-hidden="true">{selectedActorMeta.emoji}</span>
// //                     {selectedActorMeta.label}
// //                   </>
// //                 ) : (
// //                   <>Step 1</>
// //                 )}
// //                 <svg
// //                   className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
// //                   viewBox="0 0 12 12" fill="none" aria-hidden="true"
// //                 >
// //                   <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
// //                 </svg>
// //               </button>

// //               {/* Small remove ("x") for the selected actor, sits right after the pill */}
// //               {selectedActorMeta && (
// //                 <button
// //                   type="button"
// //                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectActor?.(null) }}
// //                   aria-label={`Remove ${selectedActorMeta.label}`}
// //                   className="text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors shrink-0 p-1"
// //                 >
// //                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
// //                     <path d="M18 6 6 18M6 6l12 12"/>
// //                   </svg>
// //                 </button>
// //               )}
// //             </div>

// //             {/* ── Row 2: free text + mic/send ───────────────────── */}
// //             <div className="flex items-center gap-2">
// //               <input
// //                 ref={inputRef}
// //                 id={id ?? inputId}
// //                 type="text"
// //                 value={value}
// //                 onChange={e => onChange(e.target.value)}
// //                 onKeyDown={handleKey}
// //                 onFocus={() => setIsFocused(true)}
// //                 onBlur={() => setIsFocused(false)}
// //                 placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'I want to…' : placeholder)}
// //                 autoComplete="off"
// //                 spellCheck={false}
// //                 aria-label="Describe your planning goal"
// //                 // Native tooltip so a long pill-filled query that gets
// //                 // visually clipped by the single-line input can still be
// //                 // read in full on hover, without needing to click in and
// //                 // scroll through it.
// //                 title={value || undefined}
// //                 className={cn(
// //                   'flex-1 min-w-0 py-2 bg-transparent',
// //                   'font-sans text-[#E8F0FF] placeholder:text-[#7C88A6]',
// //                   'focus:outline-none',
// //                   'transition-[font-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
// //                   isExpanded ? 'text-[17px] sm:text-[18px]' : 'text-[16px]',
// //                   isListening && 'placeholder:text-[#00D4FF]'
// //                 )}
// //               />

// //               {isLoading && (
// //                 <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
// //                   <SpinnerIcon />
// //                 </span>
// //               )}

// //               {/* Mic + send stay out of the way until there's something to
// //                   act on — no point showing an inert greyed-out arrow next
// //                   to an empty field. They fade/slide in together once the
// //                   person starts typing (or is actively using the mic). */}
// //               <div
// //                 style={{
// //                   display: 'grid',
// //                   gridTemplateColumns: showActions ? '1fr' : '0fr',
// //                   opacity: showActions ? 1 : 0,
// //                   transition: `grid-template-columns ${EXPAND_MS}ms ${EASE}, opacity 200ms ${EASE}`,
// //                 }}
// //                 className="overflow-hidden shrink-0"
// //                 aria-hidden={!showActions}
// //               >
// //                 <div className="flex items-center gap-0.5 min-w-0 pl-0.5">
// //                   {/* Mic with listening animation */}
// //                   <button
// //                     type="button"
// //                     tabIndex={showActions ? 0 : -1}
// //                     onClick={handleMicClick}
// //                     aria-label={isListening ? 'Stop voice input' : 'Voice input'}
// //                     aria-pressed={isListening}
// //                     className={cn(
// //                       'relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors',
// //                       isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#A8B8D8] hover:bg-white/[0.08]'
// //                     )}
// //                   >
// //                     {isListening && (
// //                       <span className="absolute inset-0 rounded-full bg-[#00D4FF]/40 animate-ping" aria-hidden="true" />
// //                     )}
// //                     {isListening ? (
// //                       <span className="relative flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
// //                         {[0, 1, 2, 3].map(i => (
// //                           <span
// //                             key={i}
// //                             className="w-[2.5px] rounded-full bg-[#050A12] mic-bar"
// //                             style={{ animationDelay: `${i * 0.12}s` }}
// //                           />
// //                         ))}
// //                       </span>
// //                     ) : (
// //                       <MicIcon />
// //                     )}
// //                   </button>

// //                   {/* Submit arrow — wrapped so we can hang a "what's
// //                       missing" tooltip off it. The button turns yellow
// //                       once there's text but no actor picked yet (needsActor);
// //                       the tooltip spells out *why* on hover instead of
// //                       leaving the color as the only clue. */}
// //                   <div className="relative shrink-0 ml-0.5 group/tooltip">
// //                     <button
// //                       type="button"
// //                       tabIndex={showActions ? 0 : -1}
// //                       onClick={handleSubmitClick}
// //                       disabled={!canSubmit && !needsActor}
// //                       aria-label={needsActor ? 'Select who you are to continue' : 'Check planning route'}
// //                       aria-describedby={needsActor ? `${id ?? inputId}-arrow-tooltip` : undefined}
// //                       className={cn(
// //                         'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
// //                         'transition-all duration-150',
// //                         canSubmit
// //                           ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] active:scale-[0.95]'
// //                           : needsActor
// //                             ? 'bg-[rgba(242,201,76,0.14)] text-[#F2C94C] border border-[rgba(242,201,76,0.35)] hover:bg-[rgba(242,201,76,0.22)] active:scale-[0.95]'
// //                             : 'bg-white/[0.08] text-white/25 cursor-not-allowed'
// //                       )}
// //                     >
// //                       <ArrowUpIcon />
// //                     </button>

// //                     {needsActor && (
// //                       <span
// //                         id={`${id ?? inputId}-arrow-tooltip`}
// //                         role="tooltip"
// //                         className={cn(
// //                           'pointer-events-none absolute bottom-full right-0 mb-2 z-20',
// //                           'whitespace-nowrap rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-medium',
// //                           'bg-[#131A2C] text-[#F2C94C] border border-[rgba(242,201,76,0.32)]',
// //                           'shadow-[0_10px_24px_rgba(0,0,0,0.45)]',
// //                           'opacity-0 translate-y-1 scale-95 origin-bottom-right',
// //                           'transition-all duration-150 ease-out',
// //                           'group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100'
// //                         )}
// //                       >
// //                         Select who you are first
// //                         <span
// //                           aria-hidden="true"
// //                           className="absolute top-full right-3.5 -mt-px w-2 h-2 rotate-45 bg-[#131A2C] border-r border-b border-[rgba(242,201,76,0.32)]"
// //                         />
// //                       </span>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* ── Actor dropdown — portaled to <body> so it's never clipped ── */}
// //       {mounted && actorMenuOpen && menuPos && createPortal(
// //         <>
// //           <div
// //             className="fixed inset-0 z-[100]"
// //             onClick={() => setActorMenuOpen(false)}
// //             aria-hidden="true"
// //           />
// //           <div
// //   ref={actorMenuRef}
// //   role="listbox"
// //   aria-label="Select who you are"
// //   style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
// //   className={cn(
// //     'fixed z-[101] origin-top-left',
// //     'w-max max-w-[min(300px,86vw)] rounded-[16px] p-1.5',
// //     'bg-[#131A2C]/95 backdrop-blur-xl border border-white/[0.10]',
// //     'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
// //     'animate-[dropIn_0.15s_ease-out]'
// //   )}
// // >
// //   {/* Caret connecting the dropdown to the "I am a…" pill above */}
// //   <span
// //     aria-hidden="true"
// //     className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C]/95 border-l border-t border-white/[0.10]"
// //   />

// //   <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
// //     {ACTORS.map((actor, index) => {
// //       const isSelected = selectedActor === actor.id
// //       return (
// //         <button
// //           key={actor.id}
// //           type="button"
// //           role="option"
// //           aria-selected={isSelected}
// //           onClick={() => handleActorPillClick(actor.id)}
// //           className={cn(
// //             'flex items-center gap-3 px-2.5 py-2 rounded-[10px] text-left w-full',
// //             'transition-colors duration-150',
// //             isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
// //           )}
// //           style={{
// //             animationName: 'fadeInUp',
// //             animationDuration: '0.15s',
// //             animationFillMode: 'both',
// //             animationDelay: `${index * 25}ms`,
// //           }}
// //         >
// //           <span
// //             className={cn(
// //               'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
// //               isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
// //             )}
// //             aria-hidden="true"
// //           >
// //             {actor.emoji}
// //           </span>

// //           <span className="flex-1 min-w-0">
// //             <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
// //               {actor.label}
// //             </span>
// //             {actor.description && (
// //               <span className="block text-[11.5px] text-[#5A6A8A] truncate">
// //                 {actor.description}
// //               </span>
// //             )}
// //           </span>

// //           {isSelected && (
// //             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
// //               <path d="M20 6 9 17l-5-5" />
// //             </svg>
// //           )}
// //         </button>
// //       )
// //     })}
// //   </div>
// // </div>
// //         </>,
// //         document.body
// //       )}

// //       {/* ── Hint / suggestion row ─────────────────────────────── */}
// //       <div
// //         style={{
// //           display: 'grid',
// //           gridTemplateRows: hideDefaultHint ? '0fr' : '1fr',
// //           opacity: hideDefaultHint ? 0 : 1,
// //           transition: `grid-template-rows ${EXPAND_MS}ms ${EASE}, opacity 260ms ${EASE}`,
// //         }}
// //       >
// //         <div className="overflow-hidden">
// //           <p
// //             aria-live="polite"
// //             aria-atomic="true"
// //             className="mt-2.5 text-xs text-center min-h-[18px] mx-auto max-w-full px-2"
// //           >
// //             {isListening ? (
// //               <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
// //             ) : (
// //               <>
// //                 <span className="block sm:whitespace-nowrap text-[15px] sm:text-[16px] font-medium text-[#F2C94C]">
// //                   {hintDefault.split('·')[0].trim()}
// //                 </span>
// //                 <span className="block sm:whitespace-nowrap text-[13px] sm:text-[14px] text-[#5A6A8A] mt-0.5">
// //                   {hintDefault.split('·').slice(1).join('·').trim()}
// //                 </span>
// //               </>
// //             )}
// //           </p>
// //         </div>
// //       </div>

// //       <style jsx>{`
// //         @keyframes dropIn {
// //           from { opacity: 0; transform: translateY(-6px) scale(0.97); }
// //           to   { opacity: 1; transform: translateY(0) scale(1); }
// //         }
// //         @keyframes fadeInUp {
// //           from { opacity: 0; transform: translateY(6px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }
// //         .mic-bar {
// //           height: 100%;
// //           animation: micWave 0.9s ease-in-out infinite;
// //         }
// //         @keyframes micWave {
// //           0%, 100% { transform: scaleY(0.35); }
// //           50%      { transform: scaleY(1); }
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // function SpinnerIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //       <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
// //     </svg>
// //   )
// // }

// // function MicIcon() {
// //   return (
// //     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
// //       <rect x="9" y="2" width="6" height="12" rx="3"/>
// //       <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
// //     </svg>
// //   )
// // }

// // function ArrowUpIcon() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
// //       <path d="M12 19V5M5 12l7-7 7 7"/>
// //     </svg>
// //   )
// // }



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

//   /** Fires whenever the field gains/loses focus. */
//   onFocusChange?: (focused: boolean) => void
// }

// const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// const EXPAND_MS = 400

// export function SearchBar({
//   id,
//   value,
//   suggestion,
//   isLoading,
//   onChange,
//   onSubmit,
//   placeholder = 'Type your query here or select from the list below',
//   className,
//   // hintDefault = 'Free report ',
//   onAcceptSuggestion,
//   selectedActor = null,
//   actorSuggestion = null,
//   onSelectActor,
//   onAcceptActorSuggestion,
//   onVoiceToggle,
//   onFocusChange,
// }: SearchBarProps) {
//   const inputRef = useRef<HTMLInputElement>(null)
//   const inputId  = useId()

//   const actorBtnRef  = useRef<HTMLButtonElement>(null)
//   const actorMenuRef = useRef<HTMLDivElement>(null)
//   const [actorMenuOpen, setActorMenuOpen] = useState(false)
//   const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
//   const [isListening, setIsListening] = useState(false)
//   const [voiceSupported, setVoiceSupported] = useState(true)
//   const [mounted, setMounted] = useState(false)
//   const [isFocused, setIsFocused] = useState(false)

//   // Free, browser-native speech-to-text (Web Speech API — no key, no
//   // external calls). Chrome/Edge/Safari only; Firefox has no
//   // SpeechRecognition implementation, so the mic silently no-ops there
//   // (voiceSupported flips false on mount, see below).
//   const recognitionRef = useRef<any>(null)
//   const baseValueRef = useRef('')

//   useEffect(() => {
//     const SpeechRecognitionCtor =
//       typeof window !== 'undefined'
//         ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
//         : null
//     setVoiceSupported(!!SpeechRecognitionCtor)
//   }, [])

//   useEffect(() => {
//     return () => {
//       recognitionRef.current?.stop()
//     }
//   }, [])

//   useEffect(() => {
//     onFocusChange?.(isFocused)
//   }, [isFocused, onFocusChange])

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
//       if (needsActor) {
//         toggleActorMenu()
//         return
//       }
//       onSubmit()
//     }
//     if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
//       e.preventDefault()
//       onAcceptSuggestion(suggestion)
//     }
//     // Note: backspace-to-clear-actor intentionally removed — the actor
//     // pill, once selected, can only be changed by reopening the dropdown
//     // and picking a different option, not cleared from the input.
//   }

//   const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (needsActor) {
//       toggleActorMenu()
//       return
//     }
//     onSubmit()
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

//     // Already listening -> this click means "stop".
//     if (isListening) {
//       recognitionRef.current?.stop()
//       return
//     }

//     if (!voiceSupported) return

//     const SpeechRecognitionCtor =
//       (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
//     if (!SpeechRecognitionCtor) {
//       setVoiceSupported(false)
//       return
//     }

//     const recognition = new SpeechRecognitionCtor()
//     recognition.continuous = true
//     recognition.interimResults = true
//     recognition.lang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US'

//     // Preserve whatever the person already typed and append transcribed
//     // speech after it, rather than overwriting the field.
//     baseValueRef.current = value ? `${value} ` : ''

//     recognition.onresult = (event: any) => {
//       let transcript = ''
//       for (let i = 0; i < event.results.length; i++) {
//         transcript += event.results[i][0].transcript
//       }
//       onChange(`${baseValueRef.current}${transcript}`)
//     }

//     recognition.onerror = () => {
//       setIsListening(false)
//       onVoiceToggle?.(false)
//     }

//     recognition.onend = () => {
//       setIsListening(false)
//       onVoiceToggle?.(false)
//       recognitionRef.current = null
//     }

//     recognitionRef.current = recognition
//     recognition.start()
//     setIsListening(true)
//     onVoiceToggle?.(true)
//   }

//   const canSubmit = value.trim().length > 0 && !isLoading && !!selectedActor
//   const needsActor = value.trim().length > 0 && !isLoading && !selectedActor

//   return (
//     <div className={cn('w-full', className)} role="search">

//       {/* ── Auto-detected actor banner ─────────────────────────── */}
//       {showActorBanner && actorSuggestion && (
//         <div
//           className={cn(
//             'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-lg',
//             'bg-[#101627] border border-[rgba(0,212,255,0.22)]',
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
//               className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
//             >
//               ✓ Yes
//             </button>
//             <button
//               type="button"
//               onClick={() => onSelectActor?.(null)}
//               className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Flat solid card (no blur/glass) ───────────────────── */}
//       <div className="relative">
//         <div
//           className={cn(
//             'relative rounded-2xl',
//             'bg-[#0F1526]',
//             'border transition-colors duration-300',
//             isFocused ? 'border-[rgba(0,212,255,0.4)]' : 'border-white/[0.08]',
//           )}
//         >
//           {/* Actor selector row */}
//           <div className="flex items-center gap-1 px-4 sm:px-5 pt-4">
//             <button
//               ref={actorBtnRef}
//               type="button"
//               onClick={toggleActorMenu}
//               aria-haspopup="listbox"
//               aria-expanded={actorMenuOpen}
//               className={cn(
//                 'flex items-center gap-1 pl-3 pr-2.5 py-1.5 rounded-full shrink-0',
//                 'text-[12.5px] font-medium transition-colors border',
//                 selectedActorMeta
//                   ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
//                   : 'bg-[#151D33] border-white/[0.10] text-[#8A96B8] hover:border-white/[0.2]'
//               )}
//             >
//               {selectedActorMeta ? (
//                 <>
//                   <span aria-hidden="true">{selectedActorMeta.emoji}</span>
//                   {selectedActorMeta.label}
//                 </>
//               ) : (
//                 <>I am a ...</>
//               )}
//               <svg
//                 className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
//                 viewBox="0 0 12 12" fill="none" aria-hidden="true"
//               >
//                 <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </button>
//             {/* Standalone actor-removal "x" intentionally removed — the
//                 only way to change the selected actor is to reopen this
//                 dropdown and pick a different option. */}
//           </div>

//           {/* Input row */}
//           <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 pb-4">
//             <input
//               ref={inputRef}
//               id={id ?? inputId}
//               type="text"
//               value={value}
//               onChange={e => onChange(e.target.value)}
//               onKeyDown={handleKey}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'I want to…' : placeholder)}
//               autoComplete="off"
//               spellCheck={false}
//               aria-label="Describe your planning goal"
//               title={value || undefined}
//               className={cn(
//                 'flex-1 min-w-0 py-1.5 bg-transparent',
//                 'font-sans text-[17px] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
//                 'focus:outline-none',
//                 isListening && 'placeholder:text-[#00D4FF]'
//               )}
//             />

//             {isLoading && (
//               <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
//                 <SpinnerIcon />
//               </span>
//             )}

//             <button
//               type="button"
//               onClick={handleMicClick}
//               disabled={!voiceSupported}
//               aria-label={
//                 !voiceSupported
//                   ? 'Voice input not supported in this browser'
//                   : isListening ? 'Stop voice input' : 'Voice input'
//               }
//               title={!voiceSupported ? 'Voice input needs Chrome, Edge, or Safari' : undefined}
//               aria-pressed={isListening}
//               className={cn(
//                 'relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors',
//                 !voiceSupported && 'opacity-40 cursor-not-allowed',
//                 isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#5A6A8A] hover:bg-white/[0.06]'
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
//           </div>

//           {/* ── Footer bar: hint left, solid CTA button right ──── */}
//           <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-white/[0.06]">
//             {/* <p aria-live="polite" aria-atomic="true" className="text-[12.5px] text-[#E6B905] truncate">
//               {isListening ? (
//                 <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
//               ) : (
//                 hintDefault
//               )}
//             </p> */}

//             <div className="relative shrink-0 group/tooltip">
//               <button
//                 type="button"
//                 onClick={handleSubmitClick}
//                 disabled={!canSubmit && !needsActor}
//                 aria-label={needsActor ? 'Select who you are to continue' : 'Check planning route'}
//                 aria-describedby={needsActor ? `${id ?? inputId}-arrow-tooltip` : undefined}
//                 className={cn(
//                   'flex items-center gap-1.5 px-4 py-2 rounded-lg shrink-0',
//                   'text-[13.5px] font-semibold transition-colors duration-150',
//                   canSubmit
//                     ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white'
//                     : needsActor
//                       ? 'bg-[rgba(0,212,255,0.14)] text-[#00D4FF] border border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.22)]'
//                       : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
//                 )}
//               >
//                 Get your free report
//                 <ArrowUpIcon />
//               </button>

//               {needsActor && (
//                 <span
//                   id={`${id ?? inputId}-arrow-tooltip`}
//                   role="tooltip"
//                   className={cn(
//                     'pointer-events-none absolute bottom-full right-0 mb-2 z-20',
//                     'whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11.5px] font-medium',
//                     'bg-[#131A2C] text-[#00D4FF] border border-[rgba(0,212,255,0.32)]',
//                     'shadow-[0_10px_24px_rgba(0,0,0,0.45)]',
//                     'opacity-0 translate-y-1 scale-95 origin-bottom-right',
//                     'transition-all duration-150 ease-out',
//                     'group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100'
//                   )}
//                 >
//                   Select who you are first
//                   <span
//                     aria-hidden="true"
//                     className="absolute top-full right-3.5 -mt-px w-2 h-2 rotate-45 bg-[#131A2C] border-r border-b border-[rgba(0,212,255,0.32)]"
//                   />
//                 </span>
//               )}
//             </div>
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
//             ref={actorMenuRef}
//             role="listbox"
//             aria-label="Select who you are"
//             style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
//             className={cn(
//               'fixed z-[101] origin-top-left',
//               'w-max max-w-[min(300px,86vw)] rounded-xl p-1.5',
//               'bg-[#131A2C] border border-white/[0.10]',
//               'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
//               'animate-[dropIn_0.15s_ease-out]'
//             )}
//           >
//             {/* Caret connecting the dropdown to the "Step 1" pill above */}
//             <span
//               aria-hidden="true"
//               className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C] border-l border-t border-white/[0.10]"
//             />

//             <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
//               {ACTORS.map((actor, index) => {
//                 const isSelected = selectedActor === actor.id
//                 return (
//                   <button
//                     key={actor.id}
//                     type="button"
//                     role="option"
//                     aria-selected={isSelected}
//                     onClick={() => handleActorPillClick(actor.id)}
//                     className={cn(
//                       'flex items-center gap-3 px-2.5 py-2 rounded-lg text-left w-full',
//                       'transition-colors duration-150',
//                       isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
//                     )}
//                     style={{
//                       animationName: 'fadeInUp',
//                       animationDuration: '0.15s',
//                       animationFillMode: 'both',
//                       animationDelay: `${index * 25}ms`,
//                     }}
//                   >
//                     <span
//                       className={cn(
//                         'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
//                         isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
//                       )}
//                       aria-hidden="true"
//                     >
//                       {actor.emoji}
//                     </span>

//                     <span className="flex-1 min-w-0">
//                       <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
//                         {actor.label}
//                       </span>
//                       {actor.description && (
//                         <span className="block text-[11.5px] text-[#5A6A8A] truncate">
//                           {actor.description}
//                         </span>
//                       )}
//                     </span>

//                     {isSelected && (
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
//                         <path d="M20 6 9 17l-5-5" />
//                       </svg>
//                     )}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//         </>,
//         document.body
//       )}

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
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="9" y="2" width="6" height="12" rx="3"/>
//       <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
//     </svg>
//   )
// }

// function ArrowUpIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M5 12h14M13 6l6 6-6 6"/>
//     </svg>
//   )
// }




'use client'

import React, { useRef, useId, useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { ACTORS } from '@/lib/actors'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { MicButton } from '@/components/ui/MicButton'
import type { SearchSuggestion, ActorId, ActorSuggestion } from '@/types'

interface SearchBarProps {
  id?: string
  value:         string
  suggestion:    SearchSuggestion | null
  isLoading:     boolean
  onChange:      (value: string) => void
  onSubmit:      () => void
  placeholder?:  string
  className?:    string
  hintDefault?:  string
  onAcceptSuggestion?: (suggestion: SearchSuggestion) => void

  selectedActor?:      ActorId | null
  actorSuggestion?:    ActorSuggestion | null
  onSelectActor?:      (actorId: ActorId | null) => void
  onAcceptActorSuggestion?: () => void

  /** Called when voice input starts/stops. Wire this to your speech-to-text hook. */
  onVoiceToggle?: (listening: boolean) => void

  /** Fires whenever the field gains/loses focus. */
  onFocusChange?: (focused: boolean) => void
}

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EXPAND_MS = 400

export function SearchBar({
  id,
  value,
  suggestion,
  isLoading,
  onChange,
  onSubmit,
  placeholder = 'Type your query here or select from the list below',
  className,
  // hintDefault = 'Free report ',
  onAcceptSuggestion,
  selectedActor = null,
  actorSuggestion = null,
  onSelectActor,
  onAcceptActorSuggestion,
  onVoiceToggle,
  onFocusChange,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId  = useId()

  const actorBtnRef  = useRef<HTMLButtonElement>(null)
  const actorMenuRef = useRef<HTMLDivElement>(null)
  const [actorMenuOpen, setActorMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Free, browser-native speech-to-text (Web Speech API — no key, no
  // external calls). Chrome/Edge/Safari only; Firefox has no
  // SpeechRecognition implementation, so the mic silently disables
  // itself there (see useVoiceInput).
  const { isListening, supported: voiceSupported, toggle: toggleVoice } = useVoiceInput({
    value,
    onChange,
    onListeningChange: onVoiceToggle,
  })

  useEffect(() => {
    onFocusChange?.(isFocused)
  }, [isFocused, onFocusChange])

  const selectedActorMeta = ACTORS.find(a => a.id === selectedActor) ?? null

  const showActorBanner =
    actorSuggestion &&
    actorSuggestion.actorId !== selectedActor &&
    actorSuggestion.confidence >= 0.55

  // Portal target only exists client-side
  useEffect(() => { setMounted(true) }, [])

  // Recompute dropdown position whenever it opens, and keep it pinned
  // to the trigger button on scroll/resize while open.
  useLayoutEffect(() => {
    if (!actorMenuOpen) return

    const updatePosition = () => {
      const rect = actorBtnRef.current?.getBoundingClientRect()
      if (!rect) return
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [actorMenuOpen])

  // Click-outside handling — must check both the trigger button and the
  // portaled dropdown, since they're no longer in the same DOM subtree.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const clickedButton = actorBtnRef.current?.contains(target)
      const clickedMenu    = actorMenuRef.current?.contains(target)
      if (!clickedButton && !clickedMenu) {
        setActorMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!actorMenuOpen) return
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setActorMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [actorMenuOpen])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (needsActor) {
        toggleActorMenu()
        return
      }
      onSubmit()
    }
    if (e.key === 'Tab' && suggestion && onAcceptSuggestion) {
      e.preventDefault()
      onAcceptSuggestion(suggestion)
    }
    // Note: backspace-to-clear-actor intentionally removed — the actor
    // pill, once selected, can only be changed by reopening the dropdown
    // and picking a different option, not cleared from the input.
  }

  const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (needsActor) {
      toggleActorMenu()
      return
    }
    onSubmit()
  }

  const handleActorPillClick = (actorId: ActorId) => {
    onSelectActor?.(selectedActor === actorId ? null : actorId)
    setActorMenuOpen(false)
    inputRef.current?.focus()
  }

  const toggleActorMenu = () => {
    if (!actorMenuOpen && actorBtnRef.current) {
      const rect = actorBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    }
    setActorMenuOpen(o => !o)
  }

  const canSubmit = value.trim().length > 0 && !isLoading && !!selectedActor
  const needsActor = value.trim().length > 0 && !isLoading && !selectedActor

  return (
    <div className={cn('w-full', className)} role="search">

      {/* ── Auto-detected actor banner ─────────────────────────── */}
      {showActorBanner && actorSuggestion && (
        <div
          className={cn(
            'flex items-center gap-2.5 mb-2.5 px-3.5 py-2 rounded-lg',
            'bg-[#101627] border border-[rgba(0,212,255,0.22)]',
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
                <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>
                {actorSuggestion.correctedFrom && (
                  <span className="text-[#5A6A8A]"> (we read &ldquo;{actorSuggestion.correctedFrom}&rdquo;)</span>
                )}
                ?
              </>
            ) : (
              <>
                Looks like you're a{' '}
                <span className="text-[#E8F0FF] font-semibold">{actorSuggestion.label}</span>{' '}
                — should we set up your workspace for that?
              </>
            )}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onAcceptActorSuggestion}
              className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] transition-colors"
            >
              ✓ Yes
            </button>
            <button
              type="button"
              onClick={() => onSelectActor?.(null)}
              className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.06] transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* ── Flat solid card (no blur/glass) ───────────────────── */}
      <div className="relative">
        <div
          className={cn(
            'relative rounded-2xl',
            'bg-[#0F1526]',
            'border transition-colors duration-300',
            isFocused ? 'border-[rgba(0,212,255,0.4)]' : 'border-white/[0.08]',
          )}
        >
          {/* Actor selector row */}
          <div className="flex items-center gap-1 px-4 sm:px-5 pt-4">
            <button
              ref={actorBtnRef}
              type="button"
              onClick={toggleActorMenu}
              aria-haspopup="listbox"
              aria-expanded={actorMenuOpen}
              className={cn(
                'flex items-center gap-1 pl-3 pr-2.5 py-1.5 rounded-full shrink-0',
                'text-[12.5px] font-medium transition-colors border',
                selectedActorMeta
                  ? 'bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.28)] text-[#00D4FF]'
                  : 'bg-[#151D33] border-white/[0.10] text-[#8A96B8] hover:border-white/[0.2]'
              )}
            >
              {selectedActorMeta ? (
                <>
                  <span aria-hidden="true">{selectedActorMeta.emoji}</span>
                  {selectedActorMeta.label}
                </>
              ) : (
                <>I am a ...</>
              )}
              <svg
                className={cn('w-3 h-3 transition-transform duration-150', actorMenuOpen && 'rotate-180')}
                viewBox="0 0 12 12" fill="none" aria-hidden="true"
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Standalone actor-removal "x" intentionally removed — the
                only way to change the selected actor is to reopen this
                dropdown and pick a different option. */}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 pb-4">
            <input
              ref={inputRef}
              id={id ?? inputId}
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isListening ? 'Listening…' : (selectedActorMeta ? 'I want to…' : placeholder)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Describe your planning goal"
              title={value || undefined}
              className={cn(
                'flex-1 min-w-0 py-1.5 bg-transparent',
                'font-sans text-[17px] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
                'focus:outline-none',
                isListening && 'placeholder:text-[#00D4FF]'
              )}
            />

            {isLoading && (
              <span className="shrink-0 text-[#7C88A6] animate-spin" aria-hidden="true">
                <SpinnerIcon />
              </span>
            )}

            <MicButton isListening={isListening} supported={voiceSupported} onClick={toggleVoice} />
          </div>

          {/* ── Footer bar: hint left, solid CTA button right ──── */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-white/[0.06]">
            {/* <p aria-live="polite" aria-atomic="true" className="text-[12.5px] text-[#E6B905] truncate">
              {isListening ? (
                <span className="text-[#00D4FF] font-medium">Listening… tap the mic again to stop</span>
              ) : (
                hintDefault
              )}
            </p> */}

            <div className="relative shrink-0 group/tooltip">
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={!canSubmit && !needsActor}
                aria-label={needsActor ? 'Select who you are to continue' : 'Check planning route'}
                aria-describedby={needsActor ? `${id ?? inputId}-arrow-tooltip` : undefined}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg shrink-0',
                  'text-[13.5px] font-semibold transition-colors duration-150',
                  canSubmit
                    ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#2A6BF0] hover:text-white'
                    : needsActor
                      ? 'bg-[rgba(0,212,255,0.14)] text-[#00D4FF] border border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.22)]'
                      : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
                )}
              >
                Get your free report
                <ArrowUpIcon />
              </button>

              {needsActor && (
                <span
                  id={`${id ?? inputId}-arrow-tooltip`}
                  role="tooltip"
                  className={cn(
                    'pointer-events-none absolute bottom-full right-0 mb-2 z-20',
                    'whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11.5px] font-medium',
                    'bg-[#131A2C] text-[#00D4FF] border border-[rgba(0,212,255,0.32)]',
                    'shadow-[0_10px_24px_rgba(0,0,0,0.45)]',
                    'opacity-0 translate-y-1 scale-95 origin-bottom-right',
                    'transition-all duration-150 ease-out',
                    'group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100'
                  )}
                >
                  Select who you are first
                  <span
                    aria-hidden="true"
                    className="absolute top-full right-3.5 -mt-px w-2 h-2 rotate-45 bg-[#131A2C] border-r border-b border-[rgba(0,212,255,0.32)]"
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Actor dropdown — portaled to <body> so it's never clipped ── */}
      {mounted && actorMenuOpen && menuPos && createPortal(
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setActorMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={actorMenuRef}
            role="listbox"
            aria-label="Select who you are"
            style={{ top: menuPos.top, left: menuPos.left, minWidth: Math.max(menuPos.width, 260) }}
            className={cn(
              'fixed z-[101] origin-top-left',
              'w-max max-w-[min(300px,86vw)] rounded-xl p-1.5',
              'bg-[#131A2C] border border-white/[0.10]',
              'shadow-[0_16px_36px_rgba(0,0,0,0.5)]',
              'animate-[dropIn_0.15s_ease-out]'
            )}
          >
            {/* Caret connecting the dropdown to the "Step 1" pill above */}
            <span
              aria-hidden="true"
              className="absolute -top-[6px] left-4 w-3 h-3 rotate-45 bg-[#131A2C] border-l border-t border-white/[0.10]"
            />

            <div className="relative flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
              {ACTORS.map((actor, index) => {
                const isSelected = selectedActor === actor.id
                return (
                  <button
                    key={actor.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleActorPillClick(actor.id)}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-2 rounded-lg text-left w-full',
                      'transition-colors duration-150',
                      isSelected ? 'bg-[rgba(0,212,255,0.12)]' : 'hover:bg-white/[0.06]'
                    )}
                    style={{
                      animationName: 'fadeInUp',
                      animationDuration: '0.15s',
                      animationFillMode: 'both',
                      animationDelay: `${index * 25}ms`,
                    }}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-[15px] shrink-0',
                        isSelected ? 'bg-[#00D4FF]/15' : 'bg-white/[0.06]'
                      )}
                      aria-hidden="true"
                    >
                      {actor.emoji}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className={cn('block text-[13.5px] font-medium', isSelected ? 'text-[#00D4FF]' : 'text-[#E8F0FF]')}>
                        {actor.label}
                      </span>
                      {actor.description && (
                        <span className="block text-[11.5px] text-[#5A6A8A] truncate">
                          {actor.description}
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>,
        document.body
      )}

      <style jsx>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  )
}