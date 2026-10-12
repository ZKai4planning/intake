// import { cn } from '@/lib/cn'

// interface Step {
//   number: string
//   title:  string
//   body:   string
//   icon:   React.ReactNode
// }

// const STEPS: Step[] = [
//   {
//     number: '01',
//     title:  'Tell us your goal',
//     body:   'Describe what you want to do in plain English — no planning terminology needed.',
//     icon:   <SearchGlyph />,
//   },
//   {
//     number: '02',
//     title:  'We check your address',
//     body:   'We pull live constraints for your exact site — conservation areas, listed buildings, Article 4 directions, flood risk, and Local Plan policy.',
//     icon:   <MapGlyph />,
//   },
//   {
//     number: '03',
//     title:  'Get your free result',
//     body:   'A clear eligibility snapshot in under two minutes: what you likely need, and why.',
//     icon:   <ReportGlyph />,
//   },
//   {
//     number: '04',
//     title:  'Apply, or bring in an expert',
//     body:   'Continue with our guided application tools yourself, or hand it to a vetted planning consultant.',
//     icon:   <PathGlyph />,
//   },
// ]

// /**
//  * HowItWorksSection
//  * ────────────────────
//  * The actual sequence a person goes through, start to finish — this is
//  * the one section on the page where numbered steps genuinely carry
//  * information (order matters), so they're used deliberately here.
//  */
// export function HowItWorksSection() {
//   return (
//     <section id="how-it-works" className="relative py-16 sm:py-20 bg-[#0F1525] border-t border-white/[0.05]" aria-labelledby="how-it-works-heading">
//       <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

//         <div className="text-center max-w-[560px] mx-auto mb-12">
//           <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
//             How it works
//           </p>
//           <h2 id="how-it-works-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
//             From question to answer in four steps
//           </h2>
//         </div>

//         <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
//           {/* Connecting line — desktop only, sits behind the step numbers */}
//           <div
//             aria-hidden="true"
//             className="hidden lg:block absolute top-[27px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
//           />

//           {STEPS.map(step => (
//             <div key={step.number} className="relative flex flex-col items-start lg:items-center lg:text-center">
//               <div
//                 className={cn(
//                   'relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0',
//                   'bg-[#0A0E1A] border border-[rgba(0,212,255,0.3)] text-[#00D4FF]'
//                 )}
//                 style={{ boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}
//               >
//                 {step.icon}
//               </div>
//               <span className="text-[11px] font-mono font-semibold text-[#5A6A8A] mb-1.5 tracking-wider">
//                 {step.number}
//               </span>
//               <h3 className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">
//                 {step.title}
//               </h3>
//               <p className="text-[13px] text-[#A8B8D8] leading-relaxed">
//                 {step.body}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// // ── Icons ───────────────────────────────────────────────────────────
// function SearchGlyph() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="11" cy="11" r="7" />
//       <path d="M21 21l-4.3-4.3" />
//     </svg>
//   )
// }
// function MapGlyph() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
//       <circle cx="12" cy="10" r="2.5" />
//     </svg>
//   )
// }
// function ReportGlyph() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
//       <path d="M14 3v5h5" />
//       <path d="M9 13h6M9 17h6" />
//     </svg>
//   )
// }
// function PathGlyph() {
//   return (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="6" cy="6" r="2.5" />
//       <circle cx="18" cy="18" r="2.5" />
//       <path d="M8.2 7.8c2 1 3.5 2.7 4.3 4.7.8 2 2.3 3.7 4.3 4.7" />
//     </svg>
//   )
// }


'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'


interface Step {
  number: string
  title:  string
  body:   string
  icon:   React.ReactNode
}

const STEPS: Step[] = [
  {
    number: '01',
    title:  'Tell us your goal',
    body:   'Describe what you want to do in plain English — no planning terminology needed.',
    icon:   <SearchGlyph />,
  },
  {
    number: '02',
    title:  'We check your address',
    body:   'We pull live constraints for your exact site — conservation areas, listed buildings, Article 4 directions, flood risk, and Local Plan policy.',
    icon:   <MapGlyph />,
  },
  {
    number: '03',
    title:  'Get your free result',
    body:   'A clear eligibility snapshot in under two minutes: what you likely need, and why.',
    icon:   <ReportGlyph />,
  },
  {
    number: '04',
    title:  'Apply, or bring in an expert',
    body:   'Continue with our guided application tools yourself, or hand it to a vetted planning consultant.',
    icon:   <PathGlyph />,
  },
]

/**
 * HowItWorksSection
 * ────────────────────
 * The actual sequence a person goes through, start to finish — this is
 * the one section on the page where numbered steps genuinely carry
 * information (order matters), so they're used deliberately here.
 */
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-16 sm:py-20 bg-[#0F1525] border-t border-white/[0.05]" aria-labelledby="how-it-works-heading">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

        <motion.div
          className="text-center max-w-[560px] mx-auto mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            How it works
          </p>
          <h2 id="how-it-works-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
            From question to answer in four steps
          </h2>
        </motion.div>

        <motion.div
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {/* Connecting line — desktop only, sits behind the step numbers */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[27px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
          />

          {STEPS.map(step => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative flex flex-col items-start lg:items-center lg:text-center"
            >
              <div
                className={cn(
                  'relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]',
                  'bg-[#0A0E1A] border border-[rgba(0,212,255,0.3)] text-[#00D4FF]'
                )}
                style={{ boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}
              >
                {step.icon}
              </div>
              <span className="text-[11px] font-mono font-semibold text-[#5A6A8A] mb-1.5 tracking-wider">
                {step.number}
              </span>
              <h3 className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">
                {step.title}
              </h3>
              <p className="text-[13px] text-[#A8B8D8] leading-relaxed">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Icons ───────────────────────────────────────────────────────────
function SearchGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}
function MapGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
function ReportGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  )
}
function PathGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 7.8c2 1 3.5 2.7 4.3 4.7.8 2 2.3 3.7 4.3 4.7" />
    </svg>
  )
}