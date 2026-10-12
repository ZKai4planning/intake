'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ActorId } from '@/types'

interface ActorCardConfig {
  actorId:     ActorId
  title:       string
  body:        string
  cta:         string
  accent:      'cyan' | 'purple'
  icon:        React.ReactNode
}

const ACTOR_CARDS: ActorCardConfig[] = [
  {
    actorId: 'homeowner',
    title:   "I'm a homeowner",
    body:    'Get clear guidance for your property project.',
    cta:     'Continue',
    accent:  'cyan',
    icon:    <HomeGlyph />,
  },
  {
    actorId: 'business',
    title:   "I'm a business / professional",
    body:    'Win more work and run your business more efficiently.',
    cta:     'Explore professional tools',
    accent:  'purple',
    icon:    <BriefcaseGlyph />,
  },
]

/**
 * HeroActorSelect
 * ─────────────────
 * Hero shows a single "Get started" button first; pressing it reveals
 * the "I'm a homeowner" / "I'm a business" choice, which routes on. Homeowners → /start (the guided Project Intake
 * chat, which asks for their role, so there's no need to carry ?actor=).
 * The business card still hands off to the professional site.
 */
export function HeroActorSelect({ className }: { className?: string }) {
  const router = useRouter()
  // Step 1: only the "Get started" button is shown.
  // Step 2: pressing it reveals "I'm a homeowner" (+ business / professional).
  const [open, setOpen] = useState(false)

  const handleSelect = (actorId: ActorId) => {
    if (actorId === 'business') {
      window.location.href = 'https://planningconsultant.vercel.app/'
      return
    }

    // Homeowners go to the guided Project Intake chat (details → property →
    // project → questions → verify email). See components/intake/.
    router.push('/start')
  }

  return (
    <div className={cn('flex w-full flex-col items-center', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="hero-actor-options"
        className={cn(
          'group inline-flex items-center gap-2 rounded-full px-8 py-3.5',
          'bg-gradient-to-r from-[#135BEC] to-[#00D4FF] text-[15px] font-semibold text-white',
          'shadow-[0_8px_28px_rgba(19,91,236,0.35)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]'
        )}
      >
        Get started
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25}
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={cn('transition-transform duration-300', open ? 'rotate-90' : 'group-hover:translate-x-0.5')}
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="hero-actor-options"
            key="options"
            className="mt-6 w-full overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6A8A]">
              I am a…
            </p>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {ACTOR_CARDS.map(card => (
                <motion.button
                  key={card.actorId}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  onClick={() => handleSelect(card.actorId)}
                  className={cn(
                    'group relative text-left p-5 rounded-[14px]',
                    'bg-[rgba(15,21,37,0.85)] border border-white/[0.12]',
                    'transition-colors duration-300',
                    card.accent === 'cyan'
                      ? 'hover:border-[rgba(0,212,255,0.4)]'
                      : 'hover:border-[rgba(139,92,246,0.45)]'
                  )}
                >
                  <div
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center mb-4',
                      card.accent === 'cyan'
                        ? 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF]'
                        : 'bg-[rgba(139,92,246,0.12)] text-[#8B5CF6]'
                    )}
                  >
                    {card.icon}
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">{card.title}</h3>
                  <p className="text-[13px] text-[#8A96B8] leading-relaxed mb-5">{card.body}</p>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-[13px] font-semibold',
                      card.accent === 'cyan' ? 'text-[#00D4FF]' : 'text-[#8B5CF6]'
                    )}
                  >
                    {card.cta}
                    <ArrowGlyph />
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────
function HomeGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V15a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V10" />
    </svg>
  )
}
function BriefcaseGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </svg>
  )
}
function ArrowGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}
