'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Goal } from '@/types'

interface GoalStripProps {
  goal:       Goal
  className?: string
}

/**
 * GoalStrip
 * ──────────
 * Full-width horizontal row for the 5 professional / landlord / developer goals.
 * Slides right on hover, arrow also animates right.
 */
export function GoalStrip({ goal, className }: GoalStripProps) {
  return (
    <Link
      href={goal.href}
      className={cn(
        'group flex items-center gap-3.5',
        'rounded-[12px] px-4 py-3.5',
        'bg-[#0F1525] border border-white/[0.08]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)]',
        'transition-all duration-150 cursor-pointer select-none',
        'hover:border-[#00E87A] hover:translate-x-1 hover:bg-[#141C30]',
        'hover:shadow-[0_0_16px_rgba(0,232,122,0.15)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E87A]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A]',
        className
      )}
      aria-label={`${goal.title} — ${goal.subtitle}`}
    >
      {/* Emoji */}
      <span
        className="text-[20px] w-9 text-center shrink-0 leading-none"
        aria-hidden="true"
      >
        {goal.emoji}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#E8F0FF] leading-snug truncate">
          {goal.title}
        </p>
        <p className="mt-[2px] text-[12px] text-[#5A6A8A] leading-snug truncate">
          {goal.subtitle}
        </p>
      </div>

      {/* Arrow */}
      <span
        className="shrink-0 text-[#5A6A8A] text-lg transition-all duration-150 group-hover:text-[#00E87A] group-hover:translate-x-1"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  )
}
