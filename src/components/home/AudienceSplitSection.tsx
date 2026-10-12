'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface AudiencePoint {
  title: string
  body:  string
}

interface AudienceColumn {
  eyebrow: string
  heading: string
  body:    string
  points:  AudiencePoint[]
  cta:     string
  actorId: 'business' | 'homeowner'
  accent:  'purple' | 'cyan'
}

const COLUMNS: AudienceColumn[] = [
  {
    eyebrow: 'For business & professional partners',
    heading: 'Win more suitable work, run it efficiently',
    body:    'AI4Planning helps your business win the right work, deliver it efficiently and scale with confidence.',
    points: [
      { title: 'Win more suitable work',    body: 'Receive qualified opportunities from homeowners who need your expertise.' },
      { title: 'Run projects more efficiently', body: 'End-to-end workflow tools, automated documents, and customer management.' },
      { title: 'Scale without overhead',    body: 'Structured operational and production support when workloads increase.' },
    ],
    cta:     'See business solutions',
    actorId: 'business',
    accent:  'purple',
  },
  {
    eyebrow: 'For homeowners & property owners',
    heading: 'Clear guidance, right when you need it',
    body:    'Clear guidance, trusted information and access to the right professionals when you need them.',
    points: [
      { title: 'Understand your options',   body: 'Get a free planning snapshot and see the most suitable routes for your project.' },
      { title: 'Know the risks and next steps', body: 'We highlight key constraints, requirements and what to check next.' },
      { title: 'Get the right professional help', body: 'When specialist support is needed, we connect you with approved experts.' },
    ],
    cta:     'Start your free check',
    actorId: 'homeowner',
    accent:  'cyan',
  },
]

/**
 * AudienceSplitSection
 * ───────────────────────
 * New homepage section, sits below HowItWorksStripSection. Mirrors
 * the choice already made in the hero (homeowner vs business/pro)
 * with more detail and its own CTA, for anyone scrolling rather than
 * converting straight from the hero cards. Both CTAs route the same
 * way the hero cards do — through /check/unsure with the actor set.
 */
export function AudienceSplitSection() {
  const router = useRouter()

  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="audience-split-heading">
      <h2 id="audience-split-heading" className="sr-only">
        Solutions for homeowners and for business and professional partners
      </h2>
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {COLUMNS.map(col => (
            <motion.div
              key={col.actorId}
              variants={fadeUp}
              className={cn(
                'rounded-[16px] p-6 sm:p-7 border bg-[#0F1525]',
                col.accent === 'purple'
                  ? 'border-[rgba(139,92,246,0.3)]'
                  : 'border-[rgba(0,212,255,0.3)]'
              )}
            >
              <p
                className={cn(
                  'text-[11px] font-bold tracking-[0.08em] uppercase mb-2',
                  col.accent === 'purple' ? 'text-[#8B5CF6]' : 'text-[#00D4FF]'
                )}
              >
                {col.eyebrow}
              </p>
              <p className="text-[13px] text-[#A8B8D8] leading-relaxed mb-6">
                {col.body}
              </p>

              <ul className="space-y-4 mb-7">
                {col.points.map(point => (
                  <li key={point.title}>
                    <p
                      className={cn(
                        'text-[13.5px] font-semibold mb-0.5',
                        col.accent === 'purple' ? 'text-[#B9A9F5]' : 'text-[#7FE0FF]'
                      )}
                    >
                      {point.title}
                    </p>
                    <p className="text-[12.5px] text-[#8A96B8] leading-relaxed">
                      {point.body}
                    </p>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => router.push(`/check/unsure?actor=${col.actorId}`)}
                className={cn(
                  'w-full py-3 rounded-[10px] text-[13.5px] font-semibold transition-colors',
                  col.accent === 'purple'
                    ? 'bg-transparent border border-[rgba(139,92,246,0.5)] text-[#B9A9F5] hover:bg-[rgba(139,92,246,0.1)]'
                    : 'bg-[#00D4FF] text-[#042C53] hover:bg-[#2A6BF0] hover:text-white'
                )}
              >
                {col.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
