'use client'

import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

/**
 * Toggle
 * ───────
 * Accessible pill-style toggle switch. No shadcn dependency.
 * Uses the auth design system colours (bg-[#141C30], accent #135BEC).
 */
export function Toggle({ checked, onChange, disabled, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full',
        'border transition-colors duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#135BEC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1525]',
        checked
          ? 'bg-[#135BEC] border-[#135BEC]'
          : 'bg-[#1E2A42] border-white/[0.12]',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-[16px] w-[16px] rounded-full shadow-sm',
          'transition-transform duration-200',
          checked ? 'translate-x-[20px] bg-[#0A0E1A]' : 'translate-x-[2px] bg-[#5A6A8A]'
        )}
      />
    </button>
  )
}