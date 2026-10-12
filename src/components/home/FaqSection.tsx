// 'use client'

// import { useState } from 'react'
// import { cn } from '@/lib/cn'

// interface FaqItem {
//   question: string
//   answer:   string
// }

// const FAQS: FaqItem[] = [
//   {
//     question: 'Is this a substitute for formal planning advice?',
//     answer:   "No. Your result is an eligibility snapshot to help you understand your options quickly — it isn't formal planning advice and doesn't replace a decision from your local planning authority. For anything with real risk attached, we'll point you to a vetted consultant.",
//   },
//   {
//     question: 'How accurate is the check?',
//     answer:   "We check your exact address against real constraint data — conservation area boundaries, listed building status, Article 4 directions, flood risk, and your council's Local Plan policy. Designations do change, so we always recommend a final check with your council before submitting.",
//   },
//   {
//     question: 'Do you submit the planning application for me?',
//     answer:   "Our guided tools help you prepare everything you need — document checklists, drafts, and supporting statements — and you can submit yourself. If you'd rather hand it off entirely, you can book a consultant to manage the submission for you.",
//   },
//   {
//     question: 'What does it cost?',
//     answer:   'Your first eligibility snapshot is free. What you need after that depends on your situation — a homeowner checking one extension needs very little, while a developer or consultant managing many sites gets a workspace built for that scale.',
//   },
//   {
//     question: 'Is my address and project data secure?',
//     answer:   "Yes — your projects and answers are tied to your account and never shared with third parties without your consent. Property and constraint data comes from publicly available planning sources.",
//   },
//   {
//     question: 'Do you cover the whole of the UK?',
//     answer:   'Coverage depends on the local authority — we check against your specific council\'s published data. If a designation looks out of date for your area, let us know via Get Help in your dashboard.',
//   },
// ]

// /**
//  * FaqSection
//  * ────────────
//  * Single-open accordion. Answers speak plainly to the trust questions
//  * a first-time visitor actually has (is this real advice? what does it
//  * cost? is my data safe?) rather than generic marketing FAQ filler.
//  */
// export function FaqSection() {
//   const [openIndex, setOpenIndex] = useState<number | null>(0)

//   return (
//     <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="faq-heading">
//       <div className="max-w-[760px] mx-auto px-5 sm:px-8">

//         <div className="text-center mb-10">
//           <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
//             Questions
//           </p>
//           <h2 id="faq-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
//             Before you get started
//           </h2>
//         </div>

//         <div className="rounded-[16px] border border-white/[0.08] bg-[#0F1525] overflow-hidden divide-y divide-white/[0.06]">
//           {FAQS.map((item, i) => {
//             const isOpen = openIndex === i
//             const panelId = `faq-panel-${i}`
//             const buttonId = `faq-button-${i}`
//             return (
//               <div key={item.question}>
//                 <h3>
//                   <button
//                     id={buttonId}
//                     type="button"
//                     aria-expanded={isOpen}
//                     aria-controls={panelId}
//                     onClick={() => setOpenIndex(isOpen ? null : i)}
//                     className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
//                   >
//                     <span className="text-[14px] font-medium text-[#E8F0FF]">{item.question}</span>
//                     <ChevronGlyph className={cn('shrink-0 text-[#5A6A8A] transition-transform duration-200', isOpen && 'rotate-180')} />
//                   </button>
//                 </h3>
//                 <div
//                   id={panelId}
//                   role="region"
//                   aria-labelledby={buttonId}
//                   className={cn('grid transition-all duration-200 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
//                 >
//                   <div className="overflow-hidden">
//                     <p className="px-5 pb-4 text-[13px] text-[#A8B8D8] leading-relaxed">
//                       {item.answer}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </section>
//   )
// }

// function ChevronGlyph({ className }: { className?: string }) {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
//       <polyline points="6 9 12 15 18 9" />
//     </svg>
//   )
// }


'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, viewportOnce } from '@/lib/motion'


interface FaqItem {
  question: string
  answer:   string
}

const FAQS: FaqItem[] = [
  {
    question: 'Is this a substitute for formal planning advice?',
    answer:   "No. Your result is an eligibility snapshot to help you understand your options quickly — it isn't formal planning advice and doesn't replace a decision from your local planning authority. For anything with real risk attached, we'll point you to a vetted consultant.",
  },
  {
    question: 'How accurate is the check?',
    answer:   "We check your exact address against real constraint data — conservation area boundaries, listed building status, Article 4 directions, flood risk, and your council's Local Plan policy. Designations do change, so we always recommend a final check with your council before submitting.",
  },
  {
    question: 'Do you submit the planning application for me?',
    answer:   "Our guided tools help you prepare everything you need — document checklists, drafts, and supporting statements — and you can submit yourself. If you'd rather hand it off entirely, you can book a consultant to manage the submission for you.",
  },
  {
    question: 'What does it cost?',
    answer:   'Your first eligibility snapshot is free. What you need after that depends on your situation — a homeowner checking one extension needs very little, while a developer or consultant managing many sites gets a workspace built for that scale.',
  },
  {
    question: 'Is my address and project data secure?',
    answer:   "Yes — your projects and answers are tied to your account and never shared with third parties without your consent. Property and constraint data comes from publicly available planning sources.",
  },
  {
    question: 'Do you cover the whole of the UK?',
    answer:   'Coverage depends on the local authority — we check against your specific council\'s published data. If a designation looks out of date for your area, let us know via Get Help in your dashboard.',
  },
]

/**
 * FaqSection
 * ────────────
 * Single-open accordion. Answers speak plainly to the trust questions
 * a first-time visitor actually has (is this real advice? what does it
 * cost? is my data safe?) rather than generic marketing FAQ filler.
 */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="faq-heading">
      <div className="max-w-[760px] mx-auto px-5 sm:px-8">

        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Questions
          </p>
          <h2 id="faq-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
            Before you get started
          </h2>
        </motion.div>

        <motion.div
          className="rounded-[16px] border border-white/[0.08] bg-[#0F1525] overflow-hidden divide-y divide-white/[0.06]"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            const panelId = `faq-panel-${i}`
            const buttonId = `faq-button-${i}`
            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-[14px] font-medium text-[#E8F0FF]">{item.question}</span>
                    <motion.span
                      className="shrink-0 text-[#5A6A8A]"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    >
                      <ChevronGlyph />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-[13px] text-[#A8B8D8] leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}