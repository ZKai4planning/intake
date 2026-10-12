// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { Lock } from 'lucide-react'
// import ServiceExpandPanel from './ServiceExpandPanel'
// import { SERVICES, type Service } from '@/lib/services'

// /**
//  * ServicesSection
//  * ─────────────────
//  * "What can we help you with" — idle state is a plain grid of service
//  * cards (matching the reference design: label, title, blurb, and
//  * either "Get Started" or a locked "Currently Unavailable" state).
//  * Clicking an *active* card switches to the expand-panel layout, where
//  * that service opens up in detail and the rest collapse to thin
//  * strips down the side.
//  */
// export function ServicesSection() {
//   const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)
//   const expandedContainerRef = useRef<HTMLDivElement>(null)
//   const servicesSectionRef = useRef<HTMLElement>(null)
//   const [isMobile, setIsMobile] = useState(false)

//   // Close the expanded panel on an outside click.
//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (
//         expandedContainerRef.current &&
//         !expandedContainerRef.current.contains(e.target as Node)
//       ) {
//         setExpandedServiceId(null)
//       }
//     }
//     if (expandedServiceId) {
//       document.addEventListener('mousedown', handleClickOutside)
//       return () => document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [expandedServiceId])

//   // Track mobile viewport — the expand-panel layout is desktop/tablet only;
//   // mobile always shows the plain card grid.
//   useEffect(() => {
//     if (typeof window === 'undefined') return
//     const mediaQuery = window.matchMedia('(max-width: 767px)')
//     const handleChange = () => setIsMobile(mediaQuery.matches)
//     handleChange()
//     mediaQuery.addEventListener('change', handleChange)
//     return () => mediaQuery.removeEventListener('change', handleChange)
//   }, [])

//   useEffect(() => {
//     if (isMobile) setExpandedServiceId(null)
//   }, [isMobile])

//   // On tablet, scroll the expanded panel into view so it isn't cut off.
//   useEffect(() => {
//     if (!expandedServiceId) return
//     if (typeof window === 'undefined') return
//     const mediaQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
//     if (!mediaQuery.matches) return
//     requestAnimationFrame(() => {
//       servicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
//     })
//   }, [expandedServiceId])

//   const showExpandLayout = !isMobile && expandedServiceId !== null

//   return (
//     <section
//       id="services"
//       ref={servicesSectionRef}
//       className="relative py-16 sm:py-20 border-t border-white/[0.05]"
//       aria-labelledby="services-heading"
//     >
//       <div className="max-w-[1740px] mx-auto px-5 sm:px-6 md:px-10">

//         <div className="text-center max-w-[560px] mx-auto mb-10">
//           <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
//             Services
//           </p>
//           <h2 id="services-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
//             What can we help you with?
//           </h2>
//           <p className="mt-3 text-[14.5px] text-[#A8B8D8] leading-relaxed max-w-[520px] mx-auto">
//             Pick what&apos;s closest to your situation to see what&apos;s on offer. Locked
//             services are launching soon.
//           </p>
//         </div>

//         {showExpandLayout ? (
//           <div ref={expandedContainerRef} className="flex gap-2 h-[650px]">
//             {SERVICES.map((service, index) => (
//               <ServiceExpandPanel
//                 key={service.id}
//                 index={index}
//                 service={service}
//                 isExpanded={expandedServiceId === service.id}
//                 onExpand={() => setExpandedServiceId(service.id)}
//                 onClose={() => setExpandedServiceId(null)}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {SERVICES.map(service => (
//               <ServiceCard
//                 key={service.id}
//                 service={service}
//                 onOpen={() => setExpandedServiceId(service.id)}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }

// function ServiceCard({ service, onOpen }: { service: Service; onOpen: () => void }) {
//   const isActive = service.status === 'active'

//   const cardBody = (
//     <>
//       <div className="flex items-start justify-between gap-3 mb-3">
//         <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-blue-400">
//           {service.label}
//         </p>
//         {!isActive && (
//           <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-300">
//             <Lock className="h-2.5 w-2.5" />
//             Inactive
//           </span>
//         )}
//       </div>

//       <h3 className="text-[15.5px] font-bold mb-2.5 leading-snug text-[#E8F0FF]">
//         {service.shortTitle}
//       </h3>

//       <p className="text-[13px] text-white/60 italic leading-relaxed mb-5">
//         &quot;{service.description.length > 110 ? `${service.description.slice(0, 110)}…` : service.description}&quot;
//       </p>

//       {isActive ? (
//         <span className="text-[13px] font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
//           {service.cta} →
//         </span>
//       ) : (
//         <span className="text-[12px] font-medium text-white/35">
//           Currently unavailable
//         </span>
//       )}
//     </>
//   )

//   if (!isActive) {
//     return (
//       <div
//         aria-disabled="true"
//         className="group relative bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl cursor-not-allowed opacity-70"
//       >
//         {cardBody}
//       </div>
//     )
//   }

//   return (
//     <button
//       type="button"
//       onClick={onOpen}
//       className="group relative text-left bg-white/5 border border-white/10 p-6 rounded-2xl transition hover:border-blue-400/60 hover:bg-white/[0.07]"
//     >
//       {cardBody}
//     </button>
//   )
// }

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import ServiceExpandPanel from './ServiceExpandPanel'
import { SERVICES, type Service } from '@/lib/services'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'

/**
 * ServicesSection
 * ─────────────────
 * "What can we help you with" — idle state is a plain grid of service
 * cards (matching the reference design: label, title, blurb, and
 * either "Get Started" or a locked "Currently Unavailable" state).
 * Clicking an *active* card switches to the expand-panel layout, where
 * that service opens up in detail and the rest collapse to thin
 * strips down the side.
 */
export function ServicesSection() {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)
  const expandedContainerRef = useRef<HTMLDivElement>(null)
  const servicesSectionRef = useRef<HTMLElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Close the expanded panel on an outside click.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        expandedContainerRef.current &&
        !expandedContainerRef.current.contains(e.target as Node)
      ) {
        setExpandedServiceId(null)
      }
    }
    if (expandedServiceId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [expandedServiceId])

  // Track mobile viewport — the expand-panel layout is desktop/tablet only;
  // mobile always shows the plain card grid.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = () => setIsMobile(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (isMobile) setExpandedServiceId(null)
  }, [isMobile])

  // On tablet, scroll the expanded panel into view so it isn't cut off.
  useEffect(() => {
    if (!expandedServiceId) return
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    if (!mediaQuery.matches) return
    requestAnimationFrame(() => {
      servicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [expandedServiceId])

  const showExpandLayout = !isMobile && expandedServiceId !== null

  return (
    <section
      id="services"
      ref={servicesSectionRef}
      className="relative py-16 sm:py-20 border-t border-white/[0.05]"
      aria-labelledby="services-heading"
    >
      <div className="max-w-[1740px] mx-auto px-5 sm:px-6 md:px-10">

        <motion.div
          className="text-center max-w-[560px] mx-auto mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Services
          </p>
          <h2 id="services-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
            What can we help you with?
          </h2>
          <p className="mt-3 text-[14.5px] text-[#A8B8D8] leading-relaxed max-w-[520px] mx-auto">
            Pick what&apos;s closest to your situation to see what&apos;s on offer. Locked
            services are launching soon.
          </p>
        </motion.div>

        {showExpandLayout ? (
          <div ref={expandedContainerRef} className="flex gap-2 h-[650px]">
            {SERVICES.map((service, index) => (
              <ServiceExpandPanel
                key={service.id}
                index={index}
                service={service}
                isExpanded={expandedServiceId === service.id}
                onExpand={() => setExpandedServiceId(service.id)}
                onClose={() => setExpandedServiceId(null)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            {SERVICES.map(service => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.3333%-1rem)]"
              >
                <ServiceCard
                  service={service}
                  onOpen={() => setExpandedServiceId(service.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

function ServiceCard({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const isActive = service.status === 'active'

  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-blue-400">
          {service.label}
        </p>
        {!isActive && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-300">
            <Lock className="h-2.5 w-2.5" />
            Inactive
          </span>
        )}
      </div>

      <h3 className="text-[15.5px] font-bold mb-2.5 leading-snug text-[#E8F0FF]">
        {service.shortTitle}
      </h3>

      <p className="text-[13px] text-white/60 italic leading-relaxed mb-5">
        &quot;{service.description.length > 110 ? `${service.description.slice(0, 110)}…` : service.description}&quot;
      </p>

      {isActive ? (
        <span className="text-[13px] font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
          {service.cta} →
        </span>
      ) : (
        <span className="text-[12px] font-medium text-white/35">
          Currently unavailable
        </span>
      )}
    </>
  )

  if (!isActive) {
    return (
      <div
        aria-disabled="true"
        className="group relative w-full bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl cursor-not-allowed opacity-70"
      >
        {cardBody}
      </div>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative w-full text-left bg-white/5 border border-white/10 p-6 rounded-2xl transition-colors duration-300 hover:border-blue-400/60 hover:bg-white/[0.07] hover:shadow-[0_0_24px_rgba(0,212,255,0.12)]"
    >
      {cardBody}
    </motion.button>
  )
}