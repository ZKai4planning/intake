'use client'

import { motion } from 'framer-motion'
import { TeamCarousel, type TeamMember } from '@/components/team/TeamCarousel'
import { fadeUp, viewportOnce } from '@/lib/motion'

// Placeholder roster — swap in real names, roles, bios, and photos.
const TEAM: TeamMember[] = [
  {
    name: 'Team member name',
    role: 'Role / title',
    bio:  'A short line on what they do and why it matters to the product.',
    src:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Team member name',
    role: 'Role / title',
    bio:  'A short line on what they do and why it matters to the product.',
    src:  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Team member name',
    role: 'Role / title',
    bio:  'A short line on what they do and why it matters to the product.',
    src:  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
]

/**
 * TeamSection
 * ─────────────
 * Wrapper for TeamCarousel with a section heading, matching the
 * header pattern used across the rest of the site. Roster is
 * placeholder data — swap TEAM for the real team before shipping.
 */
export function TeamSection() {
  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="team-heading">
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
        </motion.div>

        <TeamCarousel members={TEAM} />
      </div>
    </section>
  )
}