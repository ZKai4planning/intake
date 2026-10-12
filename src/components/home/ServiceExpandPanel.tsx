// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import Image from 'next/image'
// import { motion } from 'framer-motion'
// import {
//   X,
//   Lock,
//   ArrowLeft,
//   FileEdit,
//   Megaphone,
//   TreePine,
//   Gavel,
//   Landmark,
//   Home,
//   CheckCircle2,
//   ClipboardCheck,
//   FileCheck2,
//   PenTool,
//   ClipboardList,
//   Building2,
//   Route,
//   ShieldCheck,
//   Headset,
//   LineChart,
//   Search,
//   Settings2,
//   FileText,
//   Layers,
//   HardHat,
//   Cog,
//   CalendarClock,
//   Milestone,
//   Store,
//   ListChecks,
//   UserCog,
//   Network,
//   HelpCircle,
// } from 'lucide-react'
// import { useAuthRedirect } from '@/hooks/useAuthRedirect'
// import { createDraftId } from '@/lib/projects'
// import { inferActorForService, type Service, type ServiceFeature } from '@/lib/services'

// /**
//  * ── BOOKING SWITCH ──────────────────────────────────────────────
//  * 'external' → "Apply for this Service" / "Get started" open the
//  *              Calendly link to book a call.
//  * 'internal' → restores the normal in-app flow via useAuthRedirect:
//  *              logged in → straight to the relevant destination,
//  *              logged out → /login, returning them afterwards.
//  * Flip this one value when the internal flow is ready to go live.
//  */
// const BOOKING_MODE: 'external' | 'internal' = 'external'
// const EXTERNAL_BOOKING_URL = 'https://calendly.com/ai4planning-info/30min'

// interface ServiceExpandPanelProps {
//   service: Service
//   isExpanded: boolean
//   onExpand: () => void
//   onClose: () => void
//   index: number
// }

// /* ================= FEATURE ICON MAPPING ================= */
// function getFeatureIcon(title: string) {
//   const t = title.toLowerCase()
//   if (t.includes('tree')) return TreePine
//   if (t.includes('advert') || t.includes('signage')) return Megaphone
//   if (t.includes('lawful') || t.includes('certificate') || t.includes('legal')) return Gavel
//   if (t.includes('listed')) return Landmark
//   if (t.includes('household') || t.includes('extension')) return Home
//   if (t.includes('prior approval')) return CheckCircle2
//   if (t.includes('discharge') || t.includes('condition')) return ClipboardCheck
//   if (t.includes('full planning')) return FileCheck2
//   if (t.includes('outline')) return PenTool
//   if (t.includes('reserved matters')) return ClipboardList
//   if (t.includes('amendment')) return FileEdit
//   if (t.includes('scheme') || t.includes('development') || t.includes('commercial')) return Building2
//   if (t.includes('phasing') || t.includes('roadmap')) return Route
//   if (t.includes('risk') || t.includes('compliance') || t.includes('qa') || t.includes('quality')) return ShieldCheck
//   if (t.includes('guidance') || t.includes('advisory') || t.includes('support')) return Headset
//   if (t.includes('strategy') || t.includes('planning &')) return LineChart
//   if (t.includes('analysis')) return Search
//   if (t.includes('technology') || t.includes('workflow')) return Settings2
//   if (t.includes('drawing') || t.includes('production')) return FileText
//   if (t.includes('architectural') || t.includes('technical')) return ClipboardCheck
//   if (t.includes('capacity')) return Layers
//   if (t.includes('construction') || t.includes('build')) return HardHat
//   if (t.includes('management') || t.includes('coordination')) return Cog
//   if (t.includes('programme') || t.includes('delivery')) return CalendarClock
//   if (t.includes('single-point')) return Milestone
//   if (t.includes('marketplace')) return Store
//   if (t.includes('task-based')) return ListChecks
//   if (t.includes('project management')) return UserCog
//   if (t.includes('network') || t.includes('cross-discipline')) return Network
//   return HelpCircle
// }

// /* ================= COMPONENT ================= */
// export default function ServiceExpandPanel({
//   service,
//   isExpanded,
//   onExpand,
//   onClose,
//   index,
// }: ServiceExpandPanelProps) {
//   const panelRef = useRef<HTMLDivElement>(null)
//   const goToApp = useAuthRedirect()

//   const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0)
//   const [showDetail, setShowDetail] = useState(false)

//   const selectedFeature: ServiceFeature | undefined =
//     service.features[selectedFeatureIndex] ?? service.features[0]

//   useEffect(() => {
//     if (!isExpanded) return
//     if (typeof window === 'undefined') return
//     const mediaQuery = window.matchMedia('(max-width: 1279px)')
//     if (!mediaQuery.matches) return

//     requestAnimationFrame(() => {
//       panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
//     })
//   }, [isExpanded])

//   const handleClose = () => {
//     if (showDetail) {
//       setShowDetail(false)
//       return
//     }
//     onClose()
//   }

//   const handleApply = () => {
//     if (BOOKING_MODE === 'external') {
//       window.open(EXTERNAL_BOOKING_URL, '_blank', 'noopener,noreferrer')
//       return
//     }
//     // No persona is implied by a service pick, so actor stays null — but
//     // a direct "Apply" click means they know what they want, so send
//     // them straight into the eligibility-check flow (intent → intake
//     // form) rather than dropping them on the bare dashboard.
//     goToApp(null, '/dashboard/new/intent')
//   }

//   const handleApplyForFeature = (feature: ServiceFeature) => {
//     if (BOOKING_MODE === 'external') {
//       window.open(EXTERNAL_BOOKING_URL, '_blank', 'noopener,noreferrer')
//       return
//     }
//     // They picked a service AND a specific subservice — enough to skip
//     // the generic intent flow entirely and go straight into the
//     // eligibility wizard, scoped to just the questions that feature
//     // needs (see lib/eligibilityRelevance.ts).
//     const draftId = createDraftId()
//     const actorId = inferActorForService(service.id)
//     const query = new URLSearchParams({ service: service.id, feature: feature.title })
//     goToApp(actorId, `/dashboard/new/${draftId}/eligibility?${query.toString()}`)
//   }

//   return (
//     <motion.div
//       layout
//       initial={false}
//       ref={panelRef}
//       style={{ flex: isExpanded ? '3 1 0%' : '0 0 64px' }}
//       transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
//       className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden
//         ${isExpanded ? 'min-h-[42rem] xl:min-h-0' : 'h-16 md:h-20 xl:h-auto w-full xl:w-16'}`}
//     >
//       {/* Collapsed state */}
//       {!isExpanded && (
//         <button
//           onClick={service.status === 'active' ? onExpand : undefined}
//           disabled={service.status !== 'active'}
//           aria-disabled={service.status !== 'active'}
//           className={`absolute inset-0 flex items-center justify-center gap-2 ${
//             service.status === 'active' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
//           }`}
//         >
//           {service.status !== 'active' && (
//             <Lock className="h-3 w-3 text-amber-300/80 xl:mb-1" />
//           )}
//           <motion.span
//             animate={service.status === 'active' ? { y: index % 2 === 0 ? [-8, 12, -7] : [10, -7, 10] } : undefined}
//             transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, delay: index * 0.1 }}
//             className="font-bold uppercase tracking-[0.4em] text-xs text-[#A8B8D8] xl:[writing-mode:vertical-rl] xl:rotate-180"
//           >
//             {service.shortTitle}
//           </motion.span>
//         </button>
//       )}

//       {/* Expanded content */}
//       {isExpanded && (
//         <motion.div
//           className="flex w-full flex-1 flex-col xl:flex-row"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           {/* Left image */}
//           <div className="flex h-56 w-full items-center justify-center border-b border-white/10 bg-white/5 sm:h-72 md:h-80 xl:h-auto xl:w-[30%] xl:border-b-0 xl:border-r">
//             <div className="relative w-full h-full overflow-hidden">
//               <Image src={service.image} alt={service.title} fill sizes="(min-width: 1280px) 30vw, 100vw" className="object-cover" priority />
//               <div className="absolute inset-0 bg-[#0A1A3A]/40" />
//               <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050B18]/95 via-[#050B18]/65 to-transparent" />
//               <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
//                 <h3 className="mt-2 font-bold text-white text-lg lg:text-2xl">{service.title}</h3>
//                 <p className="mt-1 text-white/70 text-xs lg:text-sm">{service.description}</p>
//               </div>
//             </div>
//           </div>

//           {/* Right content */}
//           <div className="relative flex w-full flex-1 flex-col bg-white/5 p-5 sm:p-6 md:p-8 xl:p-10">
//             <button
//               onClick={handleClose}
//               className="absolute top-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white sm:top-6 sm:right-6"
//               aria-label={showDetail ? 'Back to feature list' : 'Close'}
//             >
//               {showDetail ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
//             </button>

//             {showDetail ? (
//               <div className="flex-1">
//                 <div className="mb-4 w-fit inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
//                   Service Selection
//                 </div>
//                 <h2 className="text-2xl xl:text-3xl font-bold mb-6">Detailed Service View</h2>

//                 <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.4fr]">
//                   {/* Feature list */}
//                   <div className="flex flex-col gap-3">
//                     {service.features.map((feature, i) => {
//                       const isActive = i === selectedFeatureIndex
//                       const Icon = getFeatureIcon(feature.title)
//                       return (
//                         <button
//                           key={feature.title}
//                           type="button"
//                           onClick={() => setSelectedFeatureIndex(i)}
//                           className={`group relative flex items-center gap-3 rounded-2xl border px-4 py-2 text-left transition-all duration-200 ${
//                             isActive
//                               ? 'border-blue-400/50 bg-blue-500/10'
//                               : 'border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10'
//                           }`}
//                         >
//                           <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-300' : 'text-white/60'}`} />
//                           <div className="flex flex-col">
//                             {isActive && (
//                               <span className="text-[10px] uppercase tracking-[0.18em] text-blue-300">
//                                 Active Selection
//                               </span>
//                             )}
//                             <span className="text-sm text-white/90 font-semibold">{feature.title}</span>
//                           </div>
//                         </button>
//                       )
//                     })}
//                   </div>

//                   {/* Feature detail card */}
//                   <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-black/30">
//                     <div className="flex items-start gap-4">
//                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300 shrink-0">
//                         {(() => {
//                           const Icon = getFeatureIcon(selectedFeature?.title ?? '')
//                           return <Icon className="h-6 w-6" />
//                         })()}
//                       </div>
//                       <div>
//                         <h3 className="text-lg xl:text-xl font-bold text-white">{selectedFeature?.title}</h3>
//                         <p className="text-xs xl:text-sm text-blue-300/90">{service.label}</p>
//                       </div>
//                     </div>
//                     <div className="mt-6">
//                       <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Service Overview</p>
//                       <p className="mt-3 leading-relaxed text-white/70 text-xs xl:text-sm">
//                         {selectedFeature?.description ?? service.description}
//                       </p>
//                     </div>

//                     <div className="mb-2 mt-6 flex items-center justify-center gap-4 rounded-2xl px-4 py-3">
//                       <button
//                         type="button"
//                         onClick={() => selectedFeature && handleApplyForFeature(selectedFeature)}
//                         className="rounded-full px-5 py-2 font-semibold text-white text-sm bg-blue-500 hover:bg-blue-400 transition"
//                       >
//                         Apply for this Service
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="flex-1">
//                   <h2 className="text-2xl xl:text-3xl font-bold mb-4">{service.title}</h2>
//                   <p className="text-white/70 mb-6 leading-relaxed italic text-sm xl:text-base">
//                     &quot;{service.description}&quot;
//                   </p>

//                   <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
//                     {service.features.map((feature, i) => {
//                       const Icon = getFeatureIcon(feature.title)
//                       return (
//                         <button
//                           key={feature.title}
//                           type="button"
//                           onClick={() => {
//                             setSelectedFeatureIndex(i)
//                             setShowDetail(true)
//                           }}
//                           className="group relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all duration-200 hover:border-blue-400/60 hover:bg-white/10"
//                         >
//                           <Icon className="h-5 w-5 shrink-0 text-blue-300" />
//                           <span className="text-sm font-semibold text-white/90">{feature.title}</span>
//                         </button>
//                       )
//                     })}
//                   </div>
//                 </div>

//                 <div className="mt-auto flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4 sm:flex-row sm:items-center">
//                   <div className="flex items-center gap-3">
//                     <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 shrink-0">
//                       <HelpCircle className="h-5 w-5" />
//                     </span>
//                     <div>
//                       <p className="text-sm font-semibold text-white">Not sure where to start?</p>
//                       <p className="text-xs text-white/60">Get personalised guidance for your unique project.</p>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={handleApply}
//                     className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20"
//                   >
//                     Get started
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   )
// }


'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  X,
  Lock,
  ExternalLink,
  CalendarClock,
  FileEdit,
  Megaphone,
  TreePine,
  Gavel,
  Landmark,
  Home,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  PenTool,
  ClipboardList,
  Building2,
  Route,
  ShieldCheck,
  Headset,
  LineChart,
  Search,
  Settings2,
  FileText,
  Layers,
  HardHat,
  Cog,
  CalendarClock as CalendarIcon,
  Milestone,
  Store,
  ListChecks,
  UserCog,
  Network,
  HelpCircle,
} from 'lucide-react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { createDraftId } from '@/lib/projects'
import { inferActorForService, type Service, type ServiceFeature } from '@/lib/services'

/**
 * ── BOOKING SWITCH ──────────────────────────────────────────────
 * 'external' → every CTA (feature row, "Get started") opens the
 *              Calendly link directly — no in-between detail screen.
 * 'internal' → restores the normal in-app flow via useAuthRedirect:
 *              logged in → straight to the relevant destination,
 *              logged out → /login, returning them afterwards.
 * Flip this one value when the internal flow is ready to go live.
 */
const BOOKING_MODE: 'external' | 'internal' = 'external'
const EXTERNAL_BOOKING_URL = 'https://calendly.com/ai4planning-info/30min'

interface ServiceExpandPanelProps {
  service: Service
  isExpanded: boolean
  onExpand: () => void
  onClose: () => void
  index: number
}

/* ================= FEATURE ICON MAPPING ================= */
function getFeatureIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('tree')) return TreePine
  if (t.includes('advert') || t.includes('signage')) return Megaphone
  if (t.includes('lawful') || t.includes('certificate') || t.includes('legal')) return Gavel
  if (t.includes('listed')) return Landmark
  if (t.includes('household') || t.includes('extension')) return Home
  if (t.includes('prior approval')) return CheckCircle2
  if (t.includes('discharge') || t.includes('condition')) return ClipboardCheck
  if (t.includes('full planning')) return FileCheck2
  if (t.includes('outline')) return PenTool
  if (t.includes('reserved matters')) return ClipboardList
  if (t.includes('amendment')) return FileEdit
  if (t.includes('scheme') || t.includes('development') || t.includes('commercial')) return Building2
  if (t.includes('phasing') || t.includes('roadmap')) return Route
  if (t.includes('risk') || t.includes('compliance') || t.includes('qa') || t.includes('quality')) return ShieldCheck
  if (t.includes('guidance') || t.includes('advisory') || t.includes('support')) return Headset
  if (t.includes('strategy') || t.includes('planning &')) return LineChart
  if (t.includes('analysis')) return Search
  if (t.includes('technology') || t.includes('workflow')) return Settings2
  if (t.includes('drawing') || t.includes('production')) return FileText
  if (t.includes('architectural') || t.includes('technical')) return ClipboardCheck
  if (t.includes('capacity')) return Layers
  if (t.includes('construction') || t.includes('build')) return HardHat
  if (t.includes('management') || t.includes('coordination')) return Cog
  if (t.includes('programme') || t.includes('delivery')) return CalendarIcon
  if (t.includes('single-point')) return Milestone
  if (t.includes('marketplace')) return Store
  if (t.includes('task-based')) return ListChecks
  if (t.includes('project management')) return UserCog
  if (t.includes('network') || t.includes('cross-discipline')) return Network
  return HelpCircle
}

/* ================= COMPONENT ================= */
export default function ServiceExpandPanel({
  service,
  isExpanded,
  onExpand,
  onClose,
  index,
}: ServiceExpandPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const goToApp = useAuthRedirect()

  useEffect(() => {
    if (!isExpanded) return
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 1279px)')
    if (!mediaQuery.matches) return

    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [isExpanded])

  const handleApply = () => {
    if (BOOKING_MODE === 'external') {
      window.open(EXTERNAL_BOOKING_URL, '_blank', 'noopener,noreferrer')
      return
    }
    // No persona is implied by a service pick, so actor stays null — but
    // a direct "Apply" click means they know what they want, so send
    // them straight into the eligibility-check flow (intent → intake
    // form) rather than dropping them on the bare dashboard.
    goToApp(null, '/dashboard/new/intent')
  }

  const handleApplyForFeature = (feature: ServiceFeature) => {
    if (BOOKING_MODE === 'external') {
      window.open(EXTERNAL_BOOKING_URL, '_blank', 'noopener,noreferrer')
      return
    }
    // They picked a service AND a specific subservice — enough to skip
    // the generic intent flow entirely and go straight into the
    // eligibility wizard, scoped to just the questions that feature
    // needs (see lib/eligibilityRelevance.ts).
    const draftId = createDraftId()
    const actorId = inferActorForService(service.id)
    const query = new URLSearchParams({ service: service.id, feature: feature.title })
    goToApp(actorId, `/dashboard/new/${draftId}/eligibility?${query.toString()}`)
  }

  return (
    <motion.div
      layout
      initial={false}
      ref={panelRef}
      style={{ flex: isExpanded ? '3 1 0%' : '0 0 64px' }}
      transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
      className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden
        ${isExpanded ? 'min-h-[42rem] xl:h-[44rem]' : 'h-16 md:h-20 xl:h-auto w-full xl:w-16'}`}
    >
      {/* Collapsed state */}
      {!isExpanded && (
        <button
          onClick={service.status === 'active' ? onExpand : undefined}
          disabled={service.status !== 'active'}
          aria-disabled={service.status !== 'active'}
          className={`absolute inset-0 flex items-center justify-center gap-2 overflow-hidden ${
            service.status === 'active' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
        >
          {service.status !== 'active' && (
            <Lock className="h-3 w-3 text-amber-300/80 xl:mb-1 shrink-0" />
          )}
          <motion.span
            animate={service.status === 'active' ? { y: [-4, 4, -4] } : undefined}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, delay: index * 0.1 }}
            className="font-bold uppercase tracking-[0.4em] text-xs text-[#A8B8D8] whitespace-nowrap xl:[writing-mode:vertical-rl] xl:rotate-180"
          >
            {service.shortTitle}
          </motion.span>
        </button>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          className="flex w-full flex-1 flex-col xl:flex-row xl:h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Left image */}
          <div className="flex h-56 w-full items-center justify-center border-b border-white/10 bg-white/5 sm:h-72 md:h-80 xl:h-auto xl:w-[30%] xl:border-b-0 xl:border-r">
            <div className="relative w-full h-full overflow-hidden">
              <Image src={service.image} alt={service.title} fill sizes="(min-width: 1280px) 30vw, 100vw" className="object-cover" priority />
              <div className="absolute inset-0 bg-[#0A1A3A]/40" />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050B18]/95 via-[#050B18]/65 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
                <h3 className="mt-2 font-bold text-white text-lg lg:text-2xl">{service.title}</h3>
                <p className="mt-1 text-white/70 text-xs lg:text-sm">{service.description}</p>
              </div>
            </div>
          </div>

          {/* Right content — fixed-height column (panel now has an
              explicit xl height) so the feature list can scroll
              internally instead of overflowing into the header/CTA. */}
          <div className="relative flex w-full flex-1 flex-col bg-white/5 p-5 sm:p-6 md:p-8 xl:p-10 xl:h-full xl:overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white sm:top-6 sm:right-6"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header block — fixed height, doesn't grow */}
            <div className="shrink-0 pr-12">
              {/* Sets expectation up front: everything below leads to a Calendly booking, not another in-app step. */}
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-blue-300">
                <CalendarClock className="h-3 w-3" />
                Free 30-min call · via Calendly
              </div>

              <h2 className="text-2xl xl:text-3xl font-bold mb-2">{service.title}</h2>
              <p className="text-white/70 mb-2 leading-relaxed italic text-sm xl:text-base">
                &quot;{service.description}&quot;
              </p>
              <p className="text-white/40 text-xs">
                Tap what best matches your project — it'll open Calendly in a new tab so you can book a call.
              </p>
            </div>

            {/* Feature grid — this is the section that was overflowing.
                It's now a bounded, independently scrollable region: the
                inner wrapper is min-h-full so short lists (6 items)
                still center nicely, but long lists (9-12 items) grow
                past that and scroll within this box instead of
                bleeding into the header above or the CTA below. */}
            <div className="flex-1 min-h-0 overflow-y-auto py-6 -mx-1 px-1">
              <div className="min-h-full flex flex-col justify-center">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 auto-rows-fr">
                  {service.features.map(feature => {
                    const Icon = getFeatureIcon(feature.title)
                    return (
                      <button
                        key={feature.title}
                        type="button"
                        onClick={() => handleApplyForFeature(feature)}
                        title={`Book a free call about "${feature.title}" — opens Calendly`}
                        className="group/feature relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-left transition-all duration-200 hover:border-blue-400/60 hover:bg-white/10"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-blue-300" />
                        <span className="flex-1 text-sm font-semibold text-white/90">{feature.title}</span>
                        {/* Hidden until hover/focus so the grid stays clean, but always reachable via keyboard focus too */}
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-300 opacity-0 transition-opacity duration-150 group-hover/feature:opacity-100 group-focus-visible/feature:opacity-100">
                          Book a free call
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom CTA — always pinned to the very bottom of the panel */}
            <div className="shrink-0 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 shrink-0">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Not sure where to start?</p>
                  <p className="text-xs text-white/60">Get personalised guidance for your unique project.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApply}
                title="Book a free 30-minute call — opens Calendly in a new tab"
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20"
              >
                Book a free call
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}