'use client'

import { cn } from '@/lib/cn'
import type { UpsellEvent } from '@/types/questions'

interface UpsellBannerProps {
  events: UpsellEvent[]
  onBookConsultation: () => void
  className?: string
}

/**
 * UpsellBanner
 * ─────────────
 * Surfaces every "Don't know" / "Unsure" answer as a soft consultation
 * prompt — never blocks form progress, just sits below the question list.
 *
 * This directly implements the "Revenue / Consultation Triggers" column
 * from the workbook: each flagged row maps to one entry here.
 */
export function UpsellBanner({ events, onBookConsultation, className }: UpsellBannerProps) {
  if (events.length === 0) return null

  return (
    <div
      className={cn(
        'rounded-[14px] border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.06)] p-4',
        'animate-[fadeIn_0.2s_ease-out]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-[#F59E0B] text-lg shrink-0" aria-hidden="true">💡</span>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[#F59E0B] mb-1">
            {events.length === 1
              ? 'One area could use expert input'
              : `${events.length} areas could use expert input`}
          </p>
          <p className="text-[12px] text-[#A8B8D8] leading-relaxed mb-3">
            A planning consultant can resolve these quickly so your application
            isn&rsquo;t delayed at submission.
          </p>

          <ul className="space-y-1.5 mb-3">
            {events.map(e => (
              <li key={e.rowId} className="flex items-start gap-2 text-[12px] text-[#A8B8D8]">
                <span className="text-[#5A6A8A] shrink-0 font-mono text-[10px] mt-0.5">{e.rowId}</span>
                <span>
                  <span className="text-[#E8F0FF] font-medium">{e.field}</span>
                  {' — '}{e.suggestedAction}
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onBookConsultation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#F59E0B] text-[#1A1206] text-[12.5px] font-semibold hover:bg-[#FBAF2E] transition-colors"
          >
            Book a quick consultation →
          </button>
        </div>
      </div>
    </div>
  )
}
