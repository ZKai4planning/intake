'use client'

import { motion } from 'framer-motion'
import { fadeUp, viewportOnce } from '@/lib/motion'

/**
 * MissionStatementSection
 * ───────────────────────────
 * A single centered statement, given real room to breathe (full-bleed,
 * min-height) rather than a tight text block — a deliberate "beat" in
 * the page rhythm between the feature-heavy sections above and below.
 *
 * Background is built entirely from CSS/SVG (blueprint grid + skyline
 * silhouette + ambient glow) rather than a photo — keeps it crisp at
 * any resolution, on-brand with the navy/cyan palette, and avoids
 * shipping/licensing an external image asset.
 */
export function MissionStatementSection() {
  return (
    <section className="relative overflow-hidden border-t border-b border-white/[0.05] bg-[#050912]">
      {/* Blueprint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 40%, transparent 90%)',
        }}
      />

      {/* Skyline silhouette */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[140px] sm:h-[200px] opacity-[0.18]"
      >
        <rect x="0" y="120" width="60" height="100" fill="#00D4FF" />
        <rect x="70" y="80" width="50" height="140" fill="#00D4FF" />
        <rect x="130" y="150" width="40" height="70" fill="#00D4FF" />
        <rect x="180" y="60" width="55" height="160" fill="#00D4FF" />
        <rect x="245" y="110" width="45" height="110" fill="#00D4FF" />
        <rect x="300" y="30" width="60" height="190" fill="#00D4FF" />
        <rect x="370" y="90" width="50" height="130" fill="#00D4FF" />
        <rect x="430" y="140" width="65" height="80" fill="#00D4FF" />
        <rect x="505" y="50" width="55" height="170" fill="#00D4FF" />
        <rect x="570" y="100" width="45" height="120" fill="#00D4FF" />
        <rect x="625" y="20" width="60" height="200" fill="#00D4FF" />
        <rect x="695" y="95" width="50" height="125" fill="#00D4FF" />
        <rect x="755" y="140" width="40" height="80" fill="#00D4FF" />
        <rect x="805" y="65" width="55" height="155" fill="#00D4FF" />
        <rect x="870" y="115" width="45" height="105" fill="#00D4FF" />
        <rect x="925" y="40" width="60" height="180" fill="#00D4FF" />
        <rect x="995" y="100" width="50" height="120" fill="#00D4FF" />
        <rect x="1055" y="150" width="45" height="70" fill="#00D4FF" />
        <rect x="1110" y="75" width="55" height="145" fill="#00D4FF" />
      </svg>

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.14) 0%, transparent 70%)' }}
      />

      {/* Top/bottom fade into surrounding sections */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#050912] to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050912] to-transparent" />

      <motion.div
        className="relative z-10 flex items-center justify-center min-h-[52vh] sm:min-h-[60vh] px-5 sm:px-8 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
      >
        <div className="max-w-[820px] text-center">
          <p className="font-display text-[24px] sm:text-[34px] lg:text-[38px] font-normal leading-[1.35] tracking-tight text-[#E8F0FF]">
            The intelligence layer for UK planning: from instant eligibility
            checks to AI-guided applications — AI4Planning is changing how
            homeowners understand, prepare, and submit planning applications.
          </p>
          <p className="mt-6 text-[14px] sm:text-[15px] font-semibold tracking-wide text-[#00D4FF]">
            Built on real council data, not guesswork
          </p>
        </div>
      </motion.div>
    </section>
  )
}