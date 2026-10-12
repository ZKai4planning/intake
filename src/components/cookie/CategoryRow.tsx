'use client'

import { useState } from 'react'
import { Toggle }   from '@/components/ui/Toggle'
import { cn }       from '@/lib/cn'
import type { CategoryMeta, ConsentCategory } from './cookie-consent.types'

interface CategoryRowProps {
  category: CategoryMeta
  checked:  boolean
  onChange: (id: ConsentCategory, value: boolean) => void
}

/**
 * CategoryRow
 * ────────────
 * Single expandable row inside the cookie settings panel.
 * Toggle fires onChange; chevron expands the description.
 */
export function CategoryRow({ category, checked, onChange }: CategoryRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="py-4 border-b border-white/[0.06] last:border-0">
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Toggle */}
        <Toggle
          checked={checked}
          onChange={val => onChange(category.id, val)}
          disabled={category.required}
          label={`${category.label} cookies`}
        />

        {/* Label — clicking expands description */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex-1 flex items-center justify-between text-left group"
        >
          <span className="text-[13px] font-medium text-[#E8F0FF]">
            {category.label}{' '}
            <span className="text-[#5A6A8A] font-normal">({category.count})</span>
          </span>

          {/* Chevron */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              'text-[#5A6A8A] shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {open && (
        <p className="mt-2.5 ml-[52px] text-[12px] text-[#5A6A8A] leading-relaxed">
          {category.description}
        </p>
      )}
    </div>
  )
}