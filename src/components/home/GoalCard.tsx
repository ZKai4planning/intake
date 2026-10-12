'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Goal } from '@/types'

interface GoalCardProps {
  goal:      Goal
  className?: string
}

/**
 * GoalCard
 * ─────────
 * Rendered in a CSS grid for the 5 top homeowner goals.
 * On click navigates to /check/[goalId] — the question flow.
 */
export function GoalCard({ goal, className }: GoalCardProps) {
  return (
    <Link
      href={goal.href}
      className={cn(
        'group relative flex flex-col items-center text-center',
        'rounded-[16px] px-3.5 py-5',
        'bg-[#0F1525] border border-white/[0.08]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)]',
        'transition-all duration-200 cursor-pointer select-none',
        'hover:border-[#00E87A] hover:-translate-y-1',
        'hover:shadow-[0_0_20px_rgba(0,232,122,0.2),0_4px_24px_rgba(0,0,0,0.5)]',
        'hover:bg-[#141C30]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E87A]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A]',
        className
      )}
      aria-label={`${goal.title} — ${goal.subtitle}`}
    >
      {/* Emoji icon */}
      <span
        className="text-[26px] mb-2.5 block leading-none transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      >
        {goal.emoji}
      </span>

      {/* Title */}
      <span className="text-[13px] font-semibold text-[#E8F0FF] leading-snug">
        {goal.title}
      </span>

      {/* Subtitle */}
      <span className="mt-1 text-[11px] text-[#5A6A8A] leading-snug">
        {goal.subtitle}
      </span>

      {/* Subtle glow on hover — pseudo via box-shadow above */}
    </Link>
  )
}
