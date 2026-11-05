'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'

interface PartnerModel {
  title: string
  body:  string
  image: string
  icon:  React.ReactNode
}

const MODELS: PartnerModel[] = [
  {
    title: 'Use AI4Planning on our platform',
    body:  'Leverage our software, data and workflow tools to run your business.',
    image: '/images/home/data-layers.jpg',
    icon:  <PlugGlyph />,
  },
  {
    title: 'Get your own space on AI4Planning',
    body:  'Have a dedicated branded workspace within the AI4Planning platform.',
    image: '/images/home/professional.jpg',
    icon:  <SpaceGlyph />,
  },
  {
    title: 'We build your platform powered by AI4Planning',
    body:  'We create a bespoke solution for your business using our technology and experience.',
    image: '/images/home/app-phone.jpg',
    icon:  <BuildGlyph />,
  },
  {
    title: 'Become a trusted partner',
    body:  'Join our trusted partner network and receive planning application projects.',
    image: '/images/home/consultant.jpg',
    icon:  <HandshakeGlyph />,
  },
]

/**
 * PartnerModelsSection
 * ───────────────────────
 * Homepage section below AudienceSplitSection. Four ways a business /
 * professional partner can work with AI4Planning, shown as image cards
 * in the same style as the Services section. Informational only —
 * conversion still happens via the business card in the hero or the
 * AudienceSplitSection CTA above it.
 */
export function PartnerModelsSection() {
  return (
    <section className="relative section-y bg-[#0F1525] border-t border-white/[0.05]" aria-labelledby="partner-models-heading">
      <div className="max-w-[1740px] mx-auto px-5 sm:px-6 md:px-10">
        <motion.div
          className="text-center max-w-[640px] mx-auto mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Partner with AI4Planning
          </p>
          <h2 id="partner-models-heading" className="font-display text-[30px] sm:text-[38px] font-normal text-[#E8F0FF] tracking-tight">
            Four ways to partner
          </h2>
          <p className="text-[15px] text-[#A8B8D8] leading-relaxed mt-3">
            Choose the model that fits your business. Built on one intelligent platform.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {MODELS.map(model => (
            <motion.div
              key={model.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group flex flex-col overflow-hidden rounded-2xl bg-[#0A0E1A] border border-white/10 transition-colors duration-300 hover:border-[#00D4FF]/50 hover:shadow-[0_0_24px_rgba(0,212,255,0.12)]"
            >
              <div className="relative h-[190px] w-full overflow-hidden">
                <Image
                  src={model.image}
                  alt={model.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/30 to-transparent" />
                <div className="absolute left-5 bottom-4 w-11 h-11 rounded-[10px] flex items-center justify-center bg-[rgba(10,14,26,0.8)] backdrop-blur-sm border border-[rgba(0,212,255,0.35)] text-[#00D4FF]">
                  {model.icon}
                </div>
              </div>
              <div className="p-6 pt-5">
                <h3 className="text-[18px] font-semibold text-[#E8F0FF] mb-2 leading-snug">
                  {model.title}
                </h3>
                <p className="text-[15px] text-[#A8B8D8] leading-relaxed">
                  {model.body}
                </p>
              </div>
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v4M15 2v4" />
      <path d="M6 6h12v4a6 6 0 0 1-12 0V6z" />
      <path d="M12 16v6" />
    </svg>
  )
}
function SpaceGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 21h8" />
    </svg>
  )
}
function BuildGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8.5 4.9v8.2L12 21l-8.5-4.9V7.9L12 3z" />
      <path d="M12 12l8.5-4.9M12 12v9M12 12L3.5 7.1" />
    </svg>
  )
}
function HandshakeGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
