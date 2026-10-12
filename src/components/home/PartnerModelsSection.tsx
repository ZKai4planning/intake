'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'

interface PartnerModel {
  title: string
  body:  string
  icon:  React.ReactNode
}

const MODELS: PartnerModel[] = [
  {
    title: 'Use AI4Planning on our platform',
    body:  'Leverage our software, data and workflow tools to run your business.',
    icon:  <PlugGlyph />,
  },
  {
    title: 'Get your own space on AI4Planning',
    body:  'Have a dedicated branded workspace within the AI4Planning platform.',
    icon:  <SpaceGlyph />,
  },
  {
    title: 'We build your platform powered by AI4Planning',
    body:  'We create a bespoke solution for your business using our technology and experience.',
    icon:  <BuildGlyph />,
  },
]

/**
 * PartnerModelsSection
 * ───────────────────────
 * New homepage section, sits below AudienceSplitSection. Three ways
 * a business/professional partner can work with AI4Planning — informational
 * only, no CTA of its own; conversion still happens via the business
 * card in the hero or the AudienceSplitSection CTA above it.
 */
export function PartnerModelsSection() {
  return (
    <section className="relative py-16 sm:py-20 bg-[#0F1525] border-t border-white/[0.05]" aria-labelledby="partner-models-heading">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
        <motion.div
          className="text-center max-w-[560px] mx-auto mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Partner with AI4Planning
          </p>
          <h2 id="partner-models-heading" className="font-display text-[24px] sm:text-[28px] font-normal text-[#E8F0FF] tracking-tight">
            Three ways to partner
          </h2>
          <p className="text-[13px] text-[#8A96B8] leading-relaxed mt-3">
            Choose the model that fits your business. Built on one intelligent platform.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {MODELS.map(model => (
            <motion.div
              key={model.title}
              variants={fadeUp}
              className="flex flex-col items-start p-5 rounded-[14px] bg-[#0A0E1A] border border-white/[0.08]"
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00D4FF]">
                {model.icon}
              </div>
              <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-1.5">
                {model.title}
              </h3>
              <p className="text-[12.5px] text-[#8A96B8] leading-relaxed">
                {model.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Icons ───────────────────────────────────────────────────────────
function PlugGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v4M15 2v4" />
      <path d="M6 6h12v4a6 6 0 0 1-12 0V6z" />
      <path d="M12 16v6" />
    </svg>
  )
}
function SpaceGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 21h8" />
    </svg>
  )
}
function BuildGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8.5 4.9v8.2L12 21l-8.5-4.9V7.9L12 3z" />
      <path d="M12 12l8.5-4.9M12 12v9M12 12L3.5 7.1" />
    </svg>
  )
}
