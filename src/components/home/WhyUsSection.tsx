// interface ValueProp {
//   title: string
//   body:  string
//   icon:  React.ReactNode
// }

// const VALUE_PROPS: ValueProp[] = [
//   {
//     title: 'Real constraint data, not a guess',
//     body:  "We check your exact address against your council's actual designations — conservation areas, listed buildings, Article 4 directions, flood zones, and Local Plan policy — not a generic AI estimate.",
//     icon:  <ShieldGlyph />,
//   },
//   {
//     title: 'Minutes, not weeks',
//     body:  'A free eligibility snapshot before you spend anything on drawings, fees, or a consultant call.',
//     icon:  <ClockGlyph />,
//   },
//   {
//     title: 'Plain English, always',
//     body:  'Every result explains what applies to your project and why — no planning jargon, no guesswork.',
//     icon:  <ChatGlyph />,
//   },
//   {
//     title: 'A real consultant when you need one',
//     body:  'For anything beyond a DIY check, book a vetted planning consultant directly from your result.',
//     icon:  <PersonGlyph />,
//   },
// ]

// /**
//  * WhyUsSection
//  * ──────────────
//  * Four parallel differentiators — deliberately NOT numbered, since
//  * these don't have an order; they're independent reasons to trust the
//  * result, not steps in a process (see HowItWorksSection for that).
//  */
// export function WhyUsSection() {
//   return (
//     <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="why-us-heading">
//       <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

//         <div className="max-w-[560px] mb-12">
//           <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
//             Why AI4Planning
//           </p>
//           <h2 id="why-us-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
//             Built on real planning data, not a chatbot's best guess
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
//           {VALUE_PROPS.map(vp => (
//             <div
//               key={vp.title}
//               className="flex gap-4 p-5 rounded-[14px] bg-[#0F1525] border border-white/[0.08]"
//             >
//               <div className="shrink-0 w-10 h-10 rounded-[10px] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00D4FF] flex items-center justify-center">
//                 {vp.icon}
//               </div>
//               <div>
//                 <h3 className="text-[14.5px] font-semibold text-[#E8F0FF] mb-1.5">
//                   {vp.title}
//                 </h3>
//                 <p className="text-[13px] text-[#A8B8D8] leading-relaxed">
//                   {vp.body}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// // ── Icons ───────────────────────────────────────────────────────────
// function ShieldGlyph() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//       <path d="M9 12l2 2 4-4" />
//     </svg>
//   )
// }
// function ClockGlyph() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="12" cy="12" r="9" />
//       <path d="M12 7v5l3.5 2" />
//     </svg>
//   )
// }
// function ChatGlyph() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
//     </svg>
//   )
// }
// function PersonGlyph() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//       <circle cx="12" cy="7" r="4" />
//     </svg>
//   )
// }


'use client'

import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'
import { motion } from 'framer-motion'


interface ValueProp {
  title: string
  body:  string
  icon:  React.ReactNode
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: 'Real constraint data, not a guess',
    body:  "We check your exact address against your council's actual designations — conservation areas, listed buildings, Article 4 directions, flood zones, and Local Plan policy — not a generic AI estimate.",
    icon:  <ShieldGlyph />,
  },
  {
    title: 'Minutes, not weeks',
    body:  'A free eligibility snapshot before you spend anything on drawings, fees, or a consultant call.',
    icon:  <ClockGlyph />,
  },
  {
    title: 'Plain English, always',
    body:  'Every result explains what applies to your project and why — no planning jargon, no guesswork.',
    icon:  <ChatGlyph />,
  },
  {
    title: 'A real consultant when you need one',
    body:  'For anything beyond a DIY check, book a vetted planning consultant directly from your result.',
    icon:  <PersonGlyph />,
  },
]

/**
 * WhyUsSection
 * ──────────────
 * Four parallel differentiators — deliberately NOT numbered, since
 * these don't have an order; they're independent reasons to trust the
 * result, not steps in a process (see HowItWorksSection for that).
 *
 * Header is centered and cards are icon-top/centered to match the
 * visual grammar of HowItWorksSection immediately above it — the two
 * "four item" sections should read as one family, not two different
 * layouts stacked back to back.
 */
export function WhyUsSection() {
  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="why-us-heading">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

        <motion.div
          className="text-center max-w-[560px] mx-auto mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Why AI4Planning
          </p>
          <h2 id="why-us-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
            Built on real planning data, not a chatbot&apos;s best guess
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {VALUE_PROPS.map(vp => (
            <motion.div
              key={vp.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative flex flex-col items-start lg:items-center lg:text-center p-5 rounded-[14px] bg-[#0F1525] border border-white/[0.08] transition-colors duration-300 hover:border-[rgba(0,212,255,0.35)]"
            >
              <div
                className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 bg-[#0A0E1A] border border-[rgba(0,212,255,0.3)] text-[#00D4FF] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]"
                style={{ boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}
              >
                {vp.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">
                {vp.title}
              </h3>
              <p className="text-[13px] text-[#A8B8D8] leading-relaxed">
                {vp.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Icons ───────────────────────────────────────────────────────────
function ShieldGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function ClockGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}
function ChatGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
function PersonGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}