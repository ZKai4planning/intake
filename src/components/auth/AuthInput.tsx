'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { FieldState } from '@/types/auth'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:       string
  fieldState?: FieldState
  message?:    string
  rightSlot?:  React.ReactNode  // e.g. show/hide password toggle
}

/**
 * AuthInput
 * ──────────
 * Labelled input with three visual states: idle | valid | error.
 * Forwards ref so react-hook-form or custom focus logic works.
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    { label, fieldState = 'idle', message, rightSlot, className, id, ...rest },
    ref
  ) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    const borderColor = {
      idle:  'border-white/[0.12] focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]',
      valid: 'border-[rgba(19,91,236,0.5)] shadow-[0_0_0_3px_rgba(19,91,236,0.10)]',
      error: 'border-[rgba(248,113,113,0.6)] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]',
    }[fieldState]

    const messageColor = fieldState === 'error' ? 'text-[#F87171]' : 'text-[#135BEC]'

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#5A6A8A]"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[10px] px-4 py-3',
              'bg-[#141C30] text-[#E8F0FF] text-[14px] font-sans',
              'placeholder:text-[#5A6A8A]',
              'border transition-all duration-150 outline-none',
              borderColor,
              rightSlot && 'pr-11',
              className
            )}
            {...rest}
          />

          {rightSlot && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}

          {/* Validation icon */}
          {fieldState === 'valid' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#135BEC]" aria-hidden="true">
              <CheckIcon />
            </span>
          )}
          {fieldState === 'error' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F87171]" aria-hidden="true">
              <ErrorIcon />
            </span>
          )}
        </div>

        {message && (
          <p className={cn('text-[12px] leading-snug', messageColor)} role={fieldState === 'error' ? 'alert' : undefined}>
            {message}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'

// ── Icons ─────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}
function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>
  )
}
