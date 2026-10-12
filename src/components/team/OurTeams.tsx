'use client'

import { motion } from 'framer-motion'
import { CircularTestimonials } from '@/components/circular-testimonials'
import { teamShowcaseMembers } from '@/lib/team-showcase'
import { fadeUp, viewportOnce } from '@/lib/motion'

/**
 * OurTeams
 * ──────────
 * Team showcase section. Reworked from the reference version to match
 * the rest of the site: the eyebrow-label + font-display heading
 * pattern used everywhere else (not the ad-hoc "MEET OUR TEAM" italic
 * treatment), and CircularTestimonials' colours are now baked into
 * the component itself (#00D4FF accent) rather than passed in as a
 * one-off blue/gray palette that didn't match anything else on site.
 */
export function OurTeams() {
  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05] bg-[#050912]" aria-labelledby="team-heading">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

        <motion.div
          className="text-center max-w-[560px] mx-auto mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Our team
          </p>
          <h2 id="team-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
            The people behind AI4Planning
          </h2>
          <p className="mt-3 text-[14.5px] text-[#A8B8D8] leading-relaxed max-w-[480px] mx-auto">
            Meet the team leading the vision, delivery, and client experience.
          </p>
        </motion.div>

        <div className="relative flex w-full items-center justify-center">
          <CircularTestimonials testimonials={teamShowcaseMembers} autoplay />
        </div>
      </div>
    </section>
  )
}