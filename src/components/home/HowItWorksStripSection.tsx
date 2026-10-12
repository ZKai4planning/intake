'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'

interface Step {
  number: string
  title:  string
  body:   string
  icon:   React.ReactNode
}

const STEPS: Step[] = [
  {
    number: '1',
    title:  'You ask',
    body:   'Tell us what you want to do with your property.',
    icon:   <AskGlyph />,
  },
  {
    number: '2',
    title:  'We analyse',
    body:   'AI4Planning checks your project and provides a free planning snapshot.',
    icon:   <AnalyseGlyph />,
  },
  {
    number: '3',
    title:  'We connect',
    body:   'If you need specialist support, we match you with the right professional partner.',
    icon:   <ConnectGlyph />,
  },
  {
    number: '4',
    title:  'You get results',
    body:   'You get the right advice and support. Our partners grow their business.',
    icon:   <ResultsGlyph />,
  },
]

/**
 * HowItWorksStripSection
 * ─────────────────────────
 * New homepage section, sits directly below the hero. Deliberately
 * lighter-weight than the older HowItWorksSection (kept in the
 * codebase, unused for now) — a compact 4-step strip that mirrors
 * the flow a person actually goes through once they've picked
 * homeowner/business in the hero: ask → analyse → connect → results.
 */
export function HowItWorksStripSection() {
  return (
    <section className="relative py-14 sm:py-16 bg-[#0F1525] border-t border-white/[0.05]" aria-labelledby="how-it-works-strip-heading">
      <div className="max-w-[1000px] mx-auto px-5 sm:px-8">
        <motion.h2
          id="how-it-works-strip-heading"
          className="text-center font-display text-[22px] sm:text-[26px] font-normal text-[#E8F0FF] tracking-tight mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          From planning question to the right solution
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {STEPS.map(step => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)] text-[#00D4FF]">
                {step.icon}
              </div>
              <h3 className="text-[13.5px] font-semibold text-[#E8F0FF] mb-1">
                {step.number}. {step.title}
              </h3>
              <p className="text-[12px] text-[#8A96B8] leading-relaxed max-w-[180px]">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-10 pt-6 border-t border-white/[0.06] text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[12px] text-[#5A6A8A]">
            Trusted data. Local planning rules. Better outcomes.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ── Icons ───────────────────────────────────────────────────────────
function AskGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  )
}
function AnalyseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
    </svg>
  )
}
function ConnectGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3.5 19c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <path d="M11.5 19c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
    </svg>
  )
}
function ResultsGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  )
}
