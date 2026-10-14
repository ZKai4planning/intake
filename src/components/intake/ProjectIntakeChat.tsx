// 'use client'

// import { useRef, useState } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { HelpCircle } from 'lucide-react'
// import { INTAKE_STEPS, WELCOME_NEEDS_CLICK, getRole } from '@/lib/intake/config'
// import { getCategory, getSubtype, summariseProject } from '@/lib/intake/projectTypes'
// import type { IntakeDraft, IntakeStepId } from '@/lib/intake/types'
// import { AssistantShell, Reveal, UserBubble } from './ChatBits'
// import { IntakeProgress } from './IntakeProgress'
// import { DetailsCard } from './steps/DetailsCard'
// import { PlanningCard } from './steps/PlanningCard'
// import { PropertyCard } from './steps/PropertyCard'
// import { ReviewCard } from './steps/ReviewCard'
// import { TellMoreCard } from './steps/TellMoreCard'
// import { WelcomeCard } from './steps/WelcomeCard'
// import { useIntakeDraft } from './useIntakeDraft'

// const NAVBAR_HEIGHT = 60

// /**
//  * ProjectIntakeChat  (/start)
//  * ─────────────────────────────
//  * Guided "Project Intake" conversation: Welcome → Your details → Property →
//  * What are you planning? → Tell us more → verify email.
//  *
//  * Each step is a card inside an assistant bubble. Once answered it collapses
//  * into a short summary + the person's reply bubble (with "Change"), so the
//  * page reads as a chat rather than a long form. The transcript is derived
//  * from state — no message list to keep in sync — and state is persisted by
//  * useIntakeDraft, so refresh/resume just works.
//  */
// export function ProjectIntakeChat() {
//   const router = useRouter()
//   const { draft, patch, resumable, resume, startFresh } = useIntakeDraft()
//   const [direction, setDirection] = useState<'forward' | 'back'>('forward')
//   const [started, setStarted] = useState(!WELCOME_NEEDS_CLICK)
//   const activeRef = useRef<HTMLDivElement>(null)

//   const stepIdx = INTAKE_STEPS.indexOf(draft.step)

//   function goTo(step: IntakeStepId) {
//     setDirection(INTAKE_STEPS.indexOf(step) < stepIdx ? 'back' : 'forward')
//     patch({ step })
//   }
//   const next = () => goTo(INTAKE_STEPS[Math.min(stepIdx + 1, INTAKE_STEPS.length - 1)])
//   const back = () => (stepIdx === 0 ? router.push('/') : goTo(INTAKE_STEPS[stepIdx - 1]))

//   const scrollToActive = () => requestAnimationFrame(() => activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
//   const delay = direction === 'back' ? 0 : draft.step === 'details' ? 1100 : 450

//   function renderActive() {
//     switch (draft.step) {
//       case 'details':
//         return <DetailsCard value={draft.details} onChange={details => patch({ details })} onBack={back} onNext={next} />
//       case 'property':
//         return <PropertyCard value={draft.property} onChange={property => patch({ property })} onBack={back} onNext={next} />
//       case 'planning':
//         return <PlanningCard value={draft.planning} onChange={planning => patch({ planning })} onBack={back} onNext={next} />
//       case 'more':
//         return <TellMoreCard property={draft.property} planning={draft.planning} value={draft.more} onChange={more => patch({ more })} onBack={back} onNext={next} />
//       case 'review':
//         return <ReviewCard draft={draft} onEdit={goTo} onBack={back} />
//     }
//   }

//   return (
//     <div className="fixed inset-x-0 bottom-0 z-0 flex flex-col bg-[#0A0E1A]" style={{ top: NAVBAR_HEIGHT }}>
//       {/* Header + journey bar */}
//       <div className="shrink-0 border-b border-white/[0.06] px-4 pb-3 pt-3 sm:px-8">
//         <div className="mx-auto max-w-[920px]">
//           <div className="mb-3 flex items-center justify-between gap-3">
//             <div className="min-w-0">
//               <h1 className="text-[17px] font-semibold text-[#E8F0FF] sm:text-[19px]">Project Intake</h1>
//               <p className="hidden text-[12.5px] text-[#A8B8D8] sm:block">Tell us what you&apos;re planning. We&apos;ll work out the appropriate planning route.</p>
//             </div>
//             <Link href="/contact" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#A8B8D8] transition-colors hover:text-[#E8F0FF]">
//               <HelpCircle className="h-3.5 w-3.5 text-[#00D4FF]" />
//               Need help?
//             </Link>
//           </div>
//           <IntakeProgress current={draft.step} onJump={goTo} />
//         </div>
//       </div>

//       {/* Conversation */}
//       <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
//         <div className="mx-auto max-w-[720px] space-y-5">
//           {resumable && (
//             <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-3">
//               <p className="text-[12.5px] text-[#A8B8D8]">Welcome back — continue where you left off?</p>
//               <div className="flex shrink-0 items-center gap-2">
//                 <button type="button" onClick={startFresh} className="px-2 py-1 text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8]">
//                   Start fresh
//                 </button>
//                 <button type="button" onClick={resume} className="rounded-full bg-[#135BEC] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2A6BF0]">
//                   Resume
//                 </button>
//               </div>
//             </div>
//           )}

//           <Reveal delayMs={350}>
//             <WelcomeCard onStart={WELCOME_NEEDS_CLICK && !started ? () => setStarted(true) : undefined} />
//           </Reveal>

//           {started &&
//             INTAKE_STEPS.slice(0, stepIdx).map(step => <CompletedStep key={step} step={step} draft={draft} onChange={() => goTo(step)} />)}

//           {started && (
//             <div ref={activeRef} className="scroll-mt-4" key={draft.step}>
//               <Reveal delayMs={delay} onShown={scrollToActive}>
//                 {renderActive()}
//               </Reveal>
//             </div>
//           )}

//           <div className="h-24" aria-hidden />
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Collapsed answers ─────────────────────────────────────────────────

// function CompletedStep({ step, draft, onChange }: { step: IntakeStepId; draft: IntakeDraft; onChange: () => void }) {
//   const { details, property, planning, more } = draft
//   let question = ''
//   let title = ''
//   let lines: string[] = []

//   switch (step) {
//     case 'details':
//       question = 'Who are you?'
//       title = details.fullName
//       lines = [details.email, ...(details.mobile ? [details.mobile] : []), getRole(details.role).label]
//       break
//     case 'property':
//       question = 'Which property is this?'
//       title = property?.line1 ?? 'Property'
//       lines = [[property?.town, property?.postcode].filter(Boolean).join(' · ')].filter(Boolean)
//       break
//     case 'planning': {
//       const cat = getCategory(planning.categoryId)
//       question = 'What are you planning?'
//       title = cat?.label ?? 'Project'
//       lines = [
//         ...(planning.categoryId === 'unsure' && planning.describe ? [planning.describe] : []),
//         planning.routeKnown === 'yes' ? 'I already know my planning route' : 'Planning route: you decide for me',
//       ]
//       break
//     }
//     case 'more': {
//       const sub = getSubtype(planning.categoryId, more.subtypeId)
//       const s = summariseProject(planning.categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)
//       question = 'A few more details'
//       title = planning.routeKnown === 'yes' ? 'Planning route details' : sub?.label ?? s.category
//       const shown = s.lines.slice(0, 4).map(l => `${l.label}: ${l.value}`)
//       lines = s.lines.length > 4 ? [...shown, `+ ${s.lines.length - 4} more`] : shown
//       break
//     }
//     default:
//       return null
//   }

//   return (
//     <div className="space-y-2.5">
//       <AssistantShell>
//         <div className="inline-block animate-fade-in rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] px-4 py-2.5 text-[13.5px] font-medium text-[#E8F0FF]">
//           {question}
//         </div>
//       </AssistantShell>
//       <UserBubble title={title} lines={lines} onChange={onChange} />
//     </div>
//   )
// }


// 'use client'

// import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { Check, ChevronLeft, ChevronRight, HelpCircle, Home, Lightbulb, Pencil, Sparkles, User } from 'lucide-react'
// import { cn } from '@/lib/cn'
// import { INTAKE_STEPS, getRole } from '@/lib/intake/config'
// import { getCategory, getSubtype, summariseProject } from '@/lib/intake/projectTypes'
// import { mediaUrl } from '@/lib/intake/propertyClient'
// import type { IntakeDraft, IntakeStepId } from '@/lib/intake/types'
// import { IntakeProgress } from './IntakeProgress'
// import { DetailsCard } from './steps/DetailsCard'
// import { PlanningCard } from './steps/PlanningCard'
// import { PropertyCard } from './steps/PropertyCard'
// import { ReviewCard } from './steps/ReviewCard'
// import { TellMoreCard } from './steps/TellMoreCard'
// import { WelcomeCard } from './steps/WelcomeCard'
// import { useIntakeDraft } from './useIntakeDraft'

// /** The site Navbar is `h-24` (96px) — the intake sits directly under it. */
// const NAVBAR_HEIGHT = 96

// const STEP_LABEL: Record<IntakeStepId, string> = {
//   details: 'Your details',
//   property: 'Property',
//   planning: 'Project',
//   more: 'More details',
//   review: 'Review',
// }

// type TileId = 'welcome' | IntakeStepId

// const HINTS: Record<IntakeStepId, string> = {
//   details: 'We send a one-time sign-in code to your email, so you can come back to your project any time.',
//   property: 'We look up the address to find nearby buildings and planning constraints, such as conservation areas.',
//   planning: 'Not sure which option fits? Choose “I’m not sure” and describe it in your own words. We’ll work out the route.',
//   more: 'These questions change with your project type. Your answers are saved as you go.',
//   review: 'Check everything, then we’ll email you a code to continue.',
// }

// /**
//  * ProjectIntakeChat  (/start)
//  * ─────────────────────────────
//  *   [Welcome] [done] [done]  │  ACTIVE CARD (always centred)  │
//  *   └─ scrolls sideways ─┘
//  *
//  * - The active card is always in the exact centre of the screen.
//  * - Everything that already happened sits to its left as cards (Welcome is
//  *   always the first one; the property card shows the street-view photo).
//  *   That left side scrolls sideways — with arrows and a visible scrollbar
//  *   when there are more cards than fit.
//  * - Nothing to the right: upcoming steps are never shown, and you can only
//  *   move forward with Next.
//  * - Editing a step that has completed steps after it asks first.
//  * - The page itself scrolls vertically, so tall cards / the address
//  *   dropdown are never clipped.
//  */
// export function ProjectIntakeChat() {
//   const router = useRouter()
//   const { draft, patch, resumable, resume, startFresh } = useIntakeDraft()
//   const [started, setStarted] = useState(false)
//   const [pendingEdit, setPendingEdit] = useState<IntakeStepId | null>(null)
//   const [edge, setEdge] = useState({ left: false, right: false })
//   const pageRef = useRef<HTMLDivElement>(null)
//   const histRef = useRef<HTMLDivElement>(null)
//   const activeRef = useRef<HTMLDivElement>(null)
//   const dirRef = useRef<'fwd' | 'back'>('fwd')

//   const stepIdx = INTAKE_STEPS.indexOf(draft.step)

//   function goTo(step: IntakeStepId) {
//     dirRef.current = INTAKE_STEPS.indexOf(step) < stepIdx ? 'back' : 'fwd'
//     patch({ step })
//   }
//   const next = () => goTo(INTAKE_STEPS[Math.min(stepIdx + 1, INTAKE_STEPS.length - 1)])
//   /** Back from the first form step returns to the Welcome card. */
//   const back = () => {
//     if (stepIdx > 0) return goTo(INTAKE_STEPS[stepIdx - 1])
//     dirRef.current = 'back'
//     setStarted(false)
//   }
//   const begin = () => {
//     dirRef.current = 'fwd'
//     setStarted(true)
//   }

//   /** Edit / progress-bar jump. Only ever goes backwards. */
//   function requestEdit(step: IntakeStepId) {
//     const target = INTAKE_STEPS.indexOf(step)
//     if (target < 0 || target >= stepIdx) return
//     if (target < stepIdx - 1) setPendingEdit(step)
//     else goTo(step)
//   }

//   // ── sideways scrolling of the "what happened" cards ──
//   const updateEdge = useCallback(() => {
//     const el = histRef.current
//     if (!el) return
//     setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
//   }, [])

//   useEffect(() => {
//     const el = histRef.current
//     if (!el) return
//     updateEdge()
//     el.addEventListener('scroll', updateEdge, { passive: true })
//     const ro = new ResizeObserver(updateEdge)
//     ro.observe(el)
//     return () => {
//       el.removeEventListener('scroll', updateEdge)
//       ro.disconnect()
//     }
//   }, [updateEdge, stepIdx, started])

//   // On every step change: newest card slides into view, page back to top.
//   useEffect(() => {
//     const id = requestAnimationFrame(() => {
//       const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
//       const h = histRef.current
//       h?.scrollTo({ left: h.scrollWidth, behavior })
//       pageRef.current?.scrollTo({ top: 0, behavior })
//     })
//     return () => cancelAnimationFrame(id)
//   }, [draft.step, started])

//   // Move focus into the new card (first field on desktop) so keyboard
//   // and screen-reader users land in the right place.
//   useEffect(() => {
//     const id = requestAnimationFrame(() => {
//       const root = activeRef.current
//       if (!root) return
//       const coarse = window.matchMedia('(pointer: coarse)').matches
//       const field = coarse ? null : root.querySelector<HTMLElement>('input:not([type=radio]):not([type=checkbox]), textarea, select')
//       ;(field ?? root).focus({ preventScroll: true })
//     })
//     return () => cancelAnimationFrame(id)
//   }, [draft.step, started])

//   function scrollHist(dir: -1 | 1) {
//     const h = histRef.current
//     if (!h) return
//     h.scrollBy({ left: dir * Math.max(240, h.clientWidth * 0.8), behavior: 'smooth' })
//   }

//   function renderActive() {
//     if (!started) return <WelcomeCard onStart={begin} />
//     switch (draft.step) {
//       case 'details':
//         return <DetailsCard value={draft.details} onChange={details => patch({ details })} onBack={back} onNext={next} />
//       case 'property':
//         return <PropertyCard value={draft.property} onChange={property => patch({ property })} onBack={back} onNext={next} />
//       case 'planning':
//         return <PlanningCard value={draft.planning} onChange={planning => patch({ planning })} onBack={back} onNext={next} />
//       case 'more':
//         return <TellMoreCard property={draft.property} planning={draft.planning} value={draft.more} onChange={more => patch({ more })} onBack={back} onNext={next} />
//       case 'review':
//         return <ReviewCard draft={draft} onEdit={requestEdit} onBack={back} />
//     }
//   }

//   const tiles: TileId[] = started ? ['welcome', ...INTAKE_STEPS.slice(0, stepIdx)] : []
//   const laterLabels = pendingEdit ? INTAKE_STEPS.slice(INTAKE_STEPS.indexOf(pendingEdit) + 1, stepIdx).map(s => STEP_LABEL[s]) : []

//   return (
//     // Full-screen layer (z-20, under the z-30 Navbar) so the page footer behind
//     // it can never show through the translucent navbar or the gap under it.
//     <div className="fixed inset-0 z-20 flex flex-col bg-[#0A0E1A]" style={{ paddingTop: NAVBAR_HEIGHT }}>
//       {/* Compact header: title · journey bar · help (one row on large screens) */}
//       <div className="shrink-0 border-b border-white/[0.06] px-4 py-2.5 sm:px-8">
//         <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2.5">
//           <div className="order-1 min-w-0">
//             <h1 className="text-[16px] font-semibold leading-tight text-[#E8F0FF] sm:text-[18px]">Project Intake</h1>
//             <p className="hidden text-[11.5px] text-[#5A6A8A] sm:block">Your answers save automatically</p>
//           </div>
//           <Link
//             href="/contact"
//             className="order-2 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#A8B8D8] transition-colors hover:text-[#E8F0FF] lg:order-3 lg:ml-0"
//           >
//             <HelpCircle className="h-3.5 w-3.5 text-[#00D4FF]" />
//             Need help?
//           </Link>
//           <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1">
//             <div className="lg:flex lg:justify-center">
//               <IntakeProgress current={draft.step} onJump={requestEdit} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {resumable && (
//         <div className="shrink-0 px-4 pt-3 sm:px-8">
//           <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-3">
//             <p className="text-[12.5px] text-[#A8B8D8]">Welcome back — continue where you left off?</p>
//             <div className="flex shrink-0 items-center gap-2">
//               <button type="button" onClick={() => { startFresh(); setStarted(false) }} className="px-2 py-1 text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8]">
//                 Start fresh
//               </button>
//               <button type="button" onClick={() => { resume(); setStarted(true) }} className="rounded-full bg-[#135BEC] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2A6BF0]">
//                 Resume
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Page scrolls vertically; nothing inside is clipped */}
//       <div ref={pageRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
//         <div className="mx-auto grid w-full max-w-[2400px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6">
//           {/* LEFT: what already happened (scrolls sideways) */}
//           <div className="relative min-w-0">
//             <div
//               ref={histRef}
//               className={cn(
//                 'overflow-x-auto overflow-y-hidden px-1 pb-3 pt-1 [scrollbar-color:#24324F_transparent] [scrollbar-width:thin]',
//                 // older cards softly fade out instead of being cut off
//                 edge.left && '[-webkit-mask-image:linear-gradient(to_right,transparent,black_72px)] [mask-image:linear-gradient(to_right,transparent,black_72px)]',
//               )}
//               aria-label="Completed steps"
//             >
//               {/* ml-auto keeps the newest card hugging the active card */}
//               <div className="ml-auto flex w-max items-start gap-2 xl:gap-3">
//                 {tiles.map((t, i) => (
//                   <Tile key={t} id={t} draft={draft} dist={tiles.length - 1 - i} onEdit={t === 'welcome' ? undefined : () => requestEdit(t)} />
//                 ))}
//               </div>
//             </div>

//             {edge.left && (
//               <button
//                 type="button"
//                 onClick={() => scrollHist(-1)}
//                 aria-label="Show earlier steps"
//                 className="absolute left-1 top-24 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#0F1525] text-[#E8F0FF] shadow-lg hover:border-[#00D4FF]/60"
//               >
//                 <ChevronLeft className="h-5 w-5" />
//               </button>
//             )}
//             {edge.right && (
//               <button
//                 type="button"
//                 onClick={() => scrollHist(1)}
//                 aria-label="Back to latest step"
//                 className="absolute right-1 top-24 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#0F1525] text-[#E8F0FF] shadow-lg hover:border-[#00D4FF]/60"
//               >
//                 <ChevronRight className="h-5 w-5" />
//               </button>
//             )}
//           </div>

//           {/* CENTRE: the active card — always centred */}
//           <div
//             ref={activeRef}
//             key={started ? draft.step : 'welcome'}
//             tabIndex={-1}
//             aria-live="polite"
//             className={cn('w-[min(640px,calc(100vw-136px))] outline-none', dirRef.current === 'back' ? 'intake-in-back' : 'intake-in-fwd')}
//           >
//             {renderActive()}
//           </div>

//           {/* RIGHT: never shows upcoming steps — only a short "why we ask" tip */}
//           <aside className="hidden min-w-0 xl:block" aria-label="Tip">
//             {started && HINTS[draft.step] && (
//               <div key={draft.step} className="intake-in-fwd max-w-[300px] rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
//                 <p className="flex items-center gap-2 text-[12px] font-medium text-[#00D4FF]">
//                   <Lightbulb className="h-4 w-4" />
//                   Why we ask
//                 </p>
//                 <p className="mt-2 text-[13px] leading-relaxed text-[#A8B8D8]">{HINTS[draft.step]}</p>
//               </div>
//             )}
//           </aside>
//         </div>
//       </div>

//       <style>{`
//         @keyframes intakeInFwd{from{opacity:0;transform:translateX(56px)}to{opacity:1;transform:none}}
//         @keyframes intakeInBack{from{opacity:0;transform:translateX(-56px)}to{opacity:1;transform:none}}
//         @media (prefers-reduced-motion:no-preference){
//           .intake-in-fwd{animation:intakeInFwd .4s cubic-bezier(.22,.68,0,1) both}
//           .intake-in-back{animation:intakeInBack .4s cubic-bezier(.22,.68,0,1) both}
//         }
//       `}</style>

//       {pendingEdit && (
//         <ConfirmEditDialog
//           stepLabel={STEP_LABEL[pendingEdit]}
//           laterLabels={laterLabels}
//           onCancel={() => setPendingEdit(null)}
//           onConfirm={() => {
//             const s = pendingEdit
//             setPendingEdit(null)
//             goTo(s)
//           }}
//         />
//       )}
//     </div>
//   )
// }

// // ── Cards for finished steps ──────────────────────────────────────────

// interface TileInfo {
//   label: string
//   title: string
//   lines: string[]
// }

// function tileInfo(id: TileId, draft: IntakeDraft): TileInfo | null {
//   const { details, property, planning, more } = draft
//   switch (id) {
//     case 'welcome':
//       return { label: 'Welcome', title: 'Let’s get started', lines: ['Takes about 5 minutes'] }
//     case 'details':
//       return { label: STEP_LABEL.details, title: details.fullName, lines: [details.email, ...(details.mobile ? [details.mobile] : []), getRole(details.role).label] }
//     case 'property':
//       return { label: STEP_LABEL.property, title: property?.line1 ?? 'Property', lines: [[property?.town, property?.postcode].filter(Boolean).join(' · ')].filter(Boolean) }
//     case 'planning': {
//       const cat = getCategory(planning.categoryId)
//       return {
//         label: STEP_LABEL.planning,
//         title: cat?.label ?? 'Project',
//         lines: [
//           ...(planning.categoryId === 'unsure' && planning.describe ? [planning.describe] : []),
//           planning.routeKnown === 'yes' ? 'I already know my planning route' : 'Planning route: you decide for me',
//         ],
//       }
//     }
//     case 'more': {
//       const sub = getSubtype(planning.categoryId, more.subtypeId)
//       const s = summariseProject(planning.categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)
//       const shown = s.lines.slice(0, 3).map(l => `${l.label}: ${l.value}`)
//       return {
//         label: STEP_LABEL.more,
//         title: planning.routeKnown === 'yes' ? 'Planning route details' : sub?.label ?? s.category,
//         lines: s.lines.length > 3 ? [...shown, `+ ${s.lines.length - 3} more`] : shown,
//       }
//     }
//     default:
//       return null
//   }
// }

// /** Top picture of a card: house photo, street view, project image or initials. */
// function TileMedia({ id, draft }: { id: TileId; draft: IntakeDraft }) {
//   const [failed, setFailed] = useState(false)
//   let src: string | null = null
//   let alt = ''

//   if (id === 'welcome') {
//     src = '/intake/welcome-house.png'
//     alt = 'A welcoming home at dusk'
//   } else if (id === 'property') {
//     const p = draft.property
//     if (p && p.applicationId && !p.manual) {
//       src = mediaUrl(p.applicationId, p.streetViewAvailable ? 'street-view' : 'aerial', p.fullAddress)
//       alt = `${p.streetViewAvailable ? 'Street view' : 'Aerial view'} of ${p.fullAddress}`
//     }
//   } else if (id === 'planning' || id === 'more') {
//     const cat = getCategory(draft.planning.categoryId)
//     if (cat?.image) {
//       src = cat.image
//       alt = cat.label
//     }
//   }

//   if (src && !failed) {
//     return (
//       // eslint-disable-next-line @next/next/no-img-element
//       <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
//     )
//   }

//   const initials = id === 'details' ? draft.details.fullName.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') : ''
//   return (
//     <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#135BEC]/30 to-[#00D4FF]/15 text-[#00D4FF]">
//       {initials ? <span className="text-[26px] font-semibold">{initials}</span> : id === 'property' ? <Home className="h-8 w-8" /> : id === 'details' ? <User className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
//     </div>
//   )
// }

// function Tile({ id, draft, dist, onEdit }: { id: TileId; draft: IntakeDraft; dist: number; onEdit?: () => void }) {
//   const info = tileInfo(id, draft)
//   if (!info) return null

//   // Newest card is fully lit; older ones recede. Hover / focus brings any card back.
//   const style = { '--o': Math.max(0.5, 1 - dist * 0.14) } as CSSProperties

//   const shell = cn(
//     'group relative flex shrink-0 animate-fade-in flex-col overflow-hidden rounded-2xl text-left',
//     'border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_6px_20px_rgba(0,0,0,0.25)]',
//     'opacity-[var(--o)] transition-all duration-200 hover:opacity-100 focus-visible:opacity-100',
//     // narrow screens: slim strip · wide screens: full card
//     'w-11 min-h-[220px] xl:w-[210px] xl:min-h-0',
//     onEdit &&
//       'hover:-translate-y-0.5 hover:border-[#00D4FF]/40 hover:shadow-[0_10px_28px_rgba(0,212,255,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]',
//   )

//   const body = (
//     <>
//       {/* Slim strip (below xl) */}
//       <span className="flex flex-1 flex-col items-center gap-3 py-3 xl:hidden">
//         <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00D4FF]/15 text-[#00D4FF]">
//           <Check className="h-3 w-3" strokeWidth={3} />
//         </span>
//         <span className="flex-1 text-[12.5px] font-medium text-[#E8F0FF] [writing-mode:vertical-rl]" style={{ transform: 'rotate(180deg)' }}>
//           {info.label}
//         </span>
//         {onEdit && <Pencil className="h-3.5 w-3.5 text-[#A8B8D8]" aria-hidden />}
//       </span>

//       {/* Full card (xl and up): picture, one title, one line — nothing else */}
//       <span className="hidden xl:block">
//         <span className="relative block h-[112px] w-full overflow-hidden bg-[#141C30]">
//           <TileMedia id={id} draft={draft} />
//           <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/60 via-transparent to-transparent" />
//           <span className="absolute left-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0A0E1A]/80 text-[#00D4FF] backdrop-blur">
//             <Check className="h-3 w-3" strokeWidth={3} />
//           </span>
//           {onEdit && (
//             <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#0A0E1A]/80 px-2 py-1 text-[11px] font-medium text-[#E8F0FF] opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
//               <Pencil className="h-3 w-3" />
//               Edit
//             </span>
//           )}
//         </span>
//         <span className="block px-3.5 pb-3.5 pt-3">
//           <span className="block text-[10.5px] font-medium uppercase tracking-wider text-[#5A6A8A]">{info.label}</span>
//           <span className="mt-1 block truncate text-[14.5px] font-semibold text-[#E8F0FF]">{info.title}</span>
//           {info.lines[0] && <span className="mt-0.5 block truncate text-[12.5px] text-[#A8B8D8]">{info.lines[0]}</span>}
//         </span>
//       </span>
//     </>
//   )

//   return onEdit ? (
//     <button type="button" onClick={onEdit} aria-label={`Edit ${info.label}: ${info.title}`} className={shell} style={style}>
//       {body}
//     </button>
//   ) : (
//     <div className={shell} style={style}>
//       {body}
//     </div>
//   )
// }

// // ── Confirm before editing an earlier step ────────────────────────────

// function ConfirmEditDialog({
//   stepLabel,
//   laterLabels,
//   onCancel,
//   onConfirm,
// }: {
//   stepLabel: string
//   laterLabels: string[]
//   onCancel: () => void
//   onConfirm: () => void
// }) {
//   const confirmRef = useRef<HTMLButtonElement>(null)
//   const cancelRef = useRef(onCancel)
//   cancelRef.current = onCancel

//   useEffect(() => {
//     confirmRef.current?.focus()
//     const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancelRef.current()
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//   }, [])

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="confirm-edit-title"
//         className="w-full max-w-[420px] rounded-2xl border border-white/[0.10] bg-[#0F1525] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
//         onClick={e => e.stopPropagation()}
//       >
//         <h2 id="confirm-edit-title" className="text-[17px] font-semibold text-[#E8F0FF]">
//           Change &ldquo;{stepLabel}&rdquo;?
//         </h2>
//         <p className="mt-2 text-[13.5px] leading-relaxed text-[#A8B8D8]">
//           This may affect {laterLabels.length > 1 ? 'your later steps' : 'a later step'} ({laterLabels.join(', ')}). Your answers are kept, but you&apos;ll go
//           through each of those steps again to check them.
//         </p>
//         <div className="mt-5 flex items-center justify-end gap-3">
//           <button type="button" onClick={onCancel} className="px-3 py-2 text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF]">
//             Keep my answers
//           </button>
//           <button
//             ref={confirmRef}
//             type="button"
//             onClick={onConfirm}
//             className="rounded-full bg-[#135BEC] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#2A6BF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
//           >
//             Yes, edit it
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, HelpCircle, Home, Lightbulb, Pencil, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { INTAKE_STEPS, getRole } from '@/lib/intake/config'
import { getCategory, getSubtype, summariseProject } from '@/lib/intake/projectTypes'
import { mediaUrl } from '@/lib/intake/propertyClient'
import type { IntakeDraft, IntakeStepId } from '@/lib/intake/types'
import { IntakeProgress } from './IntakeProgress'
import { DetailsCard } from './steps/DetailsCard'
import { PlanningCard } from './steps/PlanningCard'
import { PropertyCard } from './steps/PropertyCard'
import { ReviewCard } from './steps/ReviewCard'
import { TellMoreCard } from './steps/TellMoreCard'
import { WelcomeCard } from './steps/WelcomeCard'
import { useIntakeDraft } from './useIntakeDraft'

/** The site Navbar is `h-24` (96px) — the intake sits directly under it. */
const NAVBAR_HEIGHT = 96

const STEP_LABEL: Record<IntakeStepId, string> = {
  details: 'Your details',
  property: 'Property',
  planning: 'Project',
  more: 'More details',
  review: 'Review',
}

type TileId = 'welcome' | IntakeStepId

const HINTS: Record<IntakeStepId, string> = {
  details: 'We send a one-time sign-in code to your email, so you can come back to your project any time.',
  property: 'We look up the address to find nearby buildings and planning constraints, such as conservation areas.',
  planning: 'Not sure which option fits? Choose “I’m not sure” and describe it in your own words. We’ll work out the route.',
  more: 'These questions change with your project type. Your answers are saved as you go.',
  review: 'Check everything, then we’ll email you a code to continue.',
}

/**
 * ProjectIntakeChat  (/start)
 * ─────────────────────────────
 *   [Welcome] [done] [done]  │  ACTIVE CARD (always centred)  │
 *   └─ scrolls sideways ─┘
 *
 * - The active card is always in the exact centre of the screen.
 * - Everything that already happened sits to its left as cards (Welcome is
 *   always the first one; the property card shows the street-view photo).
 *   That left side scrolls sideways — with arrows and a visible scrollbar
 *   when there are more cards than fit.
 * - Nothing to the right: upcoming steps are never shown, and you can only
 *   move forward with Next.
 * - Editing a step that has completed steps after it asks first.
 * - The page itself scrolls vertically, so tall cards / the address
 *   dropdown are never clipped.
 */
export function ProjectIntakeChat() {
  const { draft, patch, resumable, resume, startFresh } = useIntakeDraft()
  const [started, setStarted] = useState(false)
  const [pendingEdit, setPendingEdit] = useState<IntakeStepId | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const dirRef = useRef<'fwd' | 'back'>('fwd')

  const stepIdx = INTAKE_STEPS.indexOf(draft.step)

  function goTo(step: IntakeStepId) {
    dirRef.current = INTAKE_STEPS.indexOf(step) < stepIdx ? 'back' : 'fwd'
    patch({ step })
  }
  const next = () => goTo(INTAKE_STEPS[Math.min(stepIdx + 1, INTAKE_STEPS.length - 1)])
  /** Back from the first form step returns to the Welcome card. */
  const back = () => {
    if (stepIdx > 0) return goTo(INTAKE_STEPS[stepIdx - 1])
    dirRef.current = 'back'
    setStarted(false)
  }
  const begin = () => {
    dirRef.current = 'fwd'
    setStarted(true)
  }

  /** Edit / progress-bar jump. Only ever goes backwards. */
  function requestEdit(step: IntakeStepId) {
    const target = INTAKE_STEPS.indexOf(step)
    if (target < 0 || target >= stepIdx) return
    if (target < stepIdx - 1) setPendingEdit(step)
    else goTo(step)
  }

  // On every step change: page back to the top of the new card.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      pageRef.current?.scrollTo({ top: 0, behavior })
    })
    return () => cancelAnimationFrame(id)
  }, [draft.step, started])

  // Move focus into the new card (first field on desktop) so keyboard
  // and screen-reader users land in the right place.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const root = activeRef.current
      if (!root) return
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const field = coarse ? null : root.querySelector<HTMLElement>('input:not([type=radio]):not([type=checkbox]), textarea, select')
      ;(field ?? root).focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(id)
  }, [draft.step, started])

  function renderActive() {
    if (!started) return <WelcomeCard onStart={begin} />
    switch (draft.step) {
      case 'details':
        return <DetailsCard value={draft.details} onChange={details => patch({ details })} onBack={back} onNext={next} />
      case 'property':
        return <PropertyCard value={draft.property} onChange={property => patch({ property })} onBack={back} onNext={next} />
      case 'planning':
        return <PlanningCard value={draft.planning} onChange={planning => patch({ planning })} onBack={back} onNext={next} />
      case 'more':
        return <TellMoreCard property={draft.property} planning={draft.planning} value={draft.more} onChange={more => patch({ more })} onBack={back} onNext={next} />
      case 'review':
        return <ReviewCard draft={draft} onEdit={requestEdit} onBack={back} />
    }
  }

  const tiles: TileId[] = started ? ['welcome', ...INTAKE_STEPS.slice(0, stepIdx)] : []
  const laterLabels = pendingEdit ? INTAKE_STEPS.slice(INTAKE_STEPS.indexOf(pendingEdit) + 1, stepIdx).map(s => STEP_LABEL[s]) : []

  return (
    // Full-screen layer (z-20, under the z-30 Navbar) so the page footer behind
    // it can never show through the translucent navbar or the gap under it.
    <div className="fixed inset-0 z-20 flex flex-col bg-[#0A0E1A]" style={{ paddingTop: NAVBAR_HEIGHT }}>
      {/* Compact header: title · journey bar · help (one row on large screens) */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-2.5 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2.5">
          <div className="order-1 min-w-0">
            <h1 className="text-[16px] font-semibold leading-tight text-[#E8F0FF] sm:text-[18px]">Project Intake</h1>
            <p className="hidden text-[11.5px] text-[#5A6A8A] sm:block">Your answers save automatically</p>
          </div>
          <Link
            href="/contact"
            className="order-2 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#A8B8D8] transition-colors hover:text-[#E8F0FF] lg:order-3 lg:ml-0"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#00D4FF]" />
            Need help?
          </Link>
          <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1">
            <div className="lg:flex lg:justify-center">
              <IntakeProgress current={draft.step} onJump={requestEdit} />
            </div>
          </div>
        </div>
      </div>

      {resumable && (
        <div className="shrink-0 px-4 pt-3 sm:px-8">
          <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-3">
            <p className="text-[12.5px] text-[#A8B8D8]">Welcome back — continue where you left off?</p>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => { startFresh(); setStarted(false) }} className="px-2 py-1 text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8]">
                Start fresh
              </button>
              <button type="button" onClick={() => { resume(); setStarted(true) }} className="rounded-full bg-[#135BEC] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2A6BF0]">
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page scrolls vertically; nothing inside is clipped */}
      <div ref={pageRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto grid w-full max-w-[2400px] grid-cols-1 items-start gap-5 px-4 py-4 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* LEFT (wide screens): everything done so far — a grid, no scrolling */}
          <aside className="hidden min-w-0 xl:block" aria-label="Completed steps">
            <HistoryGrid tiles={tiles} draft={draft} onEdit={requestEdit} />
          </aside>

          {/* CENTRE: the active card — always centred */}
          <div
            ref={activeRef}
            key={started ? draft.step : 'welcome'}
            tabIndex={-1}
            aria-live="polite"
            className={cn('mx-auto w-full max-w-[640px] outline-none xl:w-[640px]', dirRef.current === 'back' ? 'intake-in-back' : 'intake-in-fwd')}
          >
            {renderActive()}
          </div>

          {/* RIGHT (wide screens): never shows upcoming steps — only a short "why we ask" tip */}
          <aside className="hidden min-w-0 xl:block" aria-label="Tip">
            {started && HINTS[draft.step] && (
              <div key={draft.step} className="intake-in-fwd max-w-[300px] rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="flex items-center gap-2 text-[12px] font-medium text-[#00D4FF]">
                  <Lightbulb className="h-4 w-4" />
                  Why we ask
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#A8B8D8]">{HINTS[draft.step]}</p>
              </div>
            )}
          </aside>

          {/* BELOW (smaller screens): the same cards as a 1 / 2 / 3 column grid */}
          <section className="mx-auto w-full max-w-[960px] xl:hidden" aria-label="Completed steps">
            <HistoryGrid tiles={tiles} draft={draft} onEdit={requestEdit} />
          </section>
        </div>
      </div>

      <style>{`
        @keyframes intakeInFwd{from{opacity:0;transform:translateX(56px)}to{opacity:1;transform:none}}
        @keyframes intakeInBack{from{opacity:0;transform:translateX(-56px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:no-preference){
          .intake-in-fwd{animation:intakeInFwd .4s cubic-bezier(.22,.68,0,1) both}
          .intake-in-back{animation:intakeInBack .4s cubic-bezier(.22,.68,0,1) both}
        }
      `}</style>

      {pendingEdit && (
        <ConfirmEditDialog
          stepLabel={STEP_LABEL[pendingEdit]}
          laterLabels={laterLabels}
          onCancel={() => setPendingEdit(null)}
          onConfirm={() => {
            const s = pendingEdit
            setPendingEdit(null)
            goTo(s)
          }}
        />
      )}
    </div>
  )
}

// ── Cards for finished steps ──────────────────────────────────────────

interface TileInfo {
  label: string
  title: string
  lines: string[]
}

function tileInfo(id: TileId, draft: IntakeDraft): TileInfo | null {
  const { details, property, planning, more } = draft
  switch (id) {
    case 'welcome':
      return { label: 'Welcome', title: 'Let’s get started', lines: ['Takes about 5 minutes'] }
    case 'details':
      return { label: STEP_LABEL.details, title: details.fullName, lines: [details.email, ...(details.mobile ? [details.mobile] : []), getRole(details.role).label] }
    case 'property':
      return { label: STEP_LABEL.property, title: property?.line1 ?? 'Property', lines: [[property?.town, property?.postcode].filter(Boolean).join(' · ')].filter(Boolean) }
    case 'planning': {
      const cat = getCategory(planning.categoryId)
      return {
        label: STEP_LABEL.planning,
        title: cat?.label ?? 'Project',
        lines: [
          ...(planning.categoryId === 'unsure' && planning.describe ? [planning.describe] : []),
          planning.routeKnown === 'yes' ? 'I already know my planning route' : 'Planning route: you decide for me',
        ],
      }
    }
    case 'more': {
      const sub = getSubtype(planning.categoryId, more.subtypeId)
      const s = summariseProject(planning.categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)
      const shown = s.lines.slice(0, 3).map(l => `${l.label}: ${l.value}`)
      return {
        label: STEP_LABEL.more,
        title: planning.routeKnown === 'yes' ? 'Planning route details' : sub?.label ?? s.category,
        lines: s.lines.length > 3 ? [...shown, `+ ${s.lines.length - 3} more`] : shown,
      }
    }
    default:
      return null
  }
}

/** Top picture of a card: house photo, street view, project image or initials. */
function TileMedia({ id, draft }: { id: TileId; draft: IntakeDraft }) {
  const [failed, setFailed] = useState(false)
  let src: string | null = null
  let alt = ''

  if (id === 'welcome') {
    src = '/intake/welcome-house.png'
    alt = 'A welcoming home at dusk'
  } else if (id === 'property') {
    const p = draft.property
    if (p && p.applicationId && !p.manual) {
      src = mediaUrl(p.applicationId, p.streetViewAvailable ? 'street-view' : 'aerial', p.fullAddress)
      alt = `${p.streetViewAvailable ? 'Street view' : 'Aerial view'} of ${p.fullAddress}`
    }
  } else if (id === 'planning' || id === 'more') {
    const cat = getCategory(draft.planning.categoryId)
    if (cat?.image) {
      src = cat.image
      alt = cat.label
    }
  }

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
    )
  }

  const initials = id === 'details' ? draft.details.fullName.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') : ''
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#135BEC]/30 to-[#00D4FF]/15 text-[#00D4FF]">
      {initials ? <span className="text-[26px] font-semibold">{initials}</span> : id === 'property' ? <Home className="h-8 w-8" /> : id === 'details' ? <User className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
    </div>
  )
}

/** All finished cards, wrapping into 1, 2 or 3 columns depending on the space. */
function HistoryGrid({ tiles, draft, onEdit }: { tiles: TileId[]; draft: IntakeDraft; onEdit: (s: IntakeStepId) => void }) {
  if (tiles.length === 0) return null
  return (
    <div>
      <h2 className="mb-2.5 px-1 text-[11px] font-medium uppercase tracking-wider text-[#5A6A8A]">So far</h2>
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {tiles.map(t => (
          <Tile key={t} id={t} draft={draft} onEdit={t === 'welcome' ? undefined : () => onEdit(t)} />
        ))}
      </div>
    </div>
  )
}

function Tile({ id, draft, onEdit }: { id: TileId; draft: IntakeDraft; onEdit?: () => void }) {
  const info = tileInfo(id, draft)
  if (!info) return null

  const shell = cn(
    'group relative flex w-full min-w-0 animate-fade-in items-center gap-3 rounded-2xl p-2.5 pr-3.5 text-left',
    'border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_6px_20px_rgba(0,0,0,0.25)]',
    'transition-all duration-200',
    onEdit &&
      'hover:-translate-y-0.5 hover:border-[#00D4FF]/40 hover:shadow-[0_10px_28px_rgba(0,212,255,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]',
  )

  const body = (
    <>
      <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#141C30]">
        <TileMedia id={id} draft={draft} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-[#5A6A8A]">
          <Check className="h-3 w-3 text-[#00D4FF]" strokeWidth={3} />
          {info.label}
        </span>
        <span className="mt-0.5 block truncate text-[14px] font-semibold text-[#E8F0FF]" title={info.title}>
          {info.title}
        </span>
        {info.lines[0] && <span className="block truncate text-[12.5px] text-[#A8B8D8]">{info.lines[0]}</span>}
      </span>
      {onEdit && (
        <span className="shrink-0 text-[#5A6A8A] transition-colors group-hover:text-[#00D4FF] group-focus-visible:text-[#00D4FF]" aria-hidden>
          <Pencil className="h-4 w-4" />
        </span>
      )}
    </>
  )

  return onEdit ? (
    <button type="button" onClick={onEdit} title="Edit" aria-label={`Edit ${info.label}: ${info.title}`} className={shell}>
      {body}
    </button>
  ) : (
    <div className={shell}>{body}</div>
  )
}

// ── Confirm before editing an earlier step ────────────────────────────

function ConfirmEditDialog({
  stepLabel,
  laterLabels,
  onCancel,
  onConfirm,
}: {
  stepLabel: string
  laterLabels: string[]
  onCancel: () => void
  onConfirm: () => void
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel

  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancelRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-edit-title"
        className="w-full max-w-[420px] rounded-2xl border border-white/[0.10] bg-[#0F1525] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirm-edit-title" className="text-[17px] font-semibold text-[#E8F0FF]">
          Change &ldquo;{stepLabel}&rdquo;?
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#A8B8D8]">
          This may affect {laterLabels.length > 1 ? 'your later steps' : 'a later step'} ({laterLabels.join(', ')}). Your answers are kept, but you&apos;ll go
          through each of those steps again to check them.
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-3 py-2 text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF]">
            Keep my answers
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#135BEC] px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#2A6BF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
          >
            Yes, edit it
          </button>
        </div>
      </div>
    </div>
  )
}