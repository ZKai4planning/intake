'use client'

import React from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import type { Option } from '@/lib/intake/projectTypes'

/**
 * Shared building blocks for the intake chat cards. Layout and feel follow
 * the Project Intake design; colours are the existing brand palette
 * (navy surfaces, #135BEC primary, #00D4FF selection accent).
 */

export const SELECTED =
  'border-[#00D4FF]/60 bg-[rgba(0,212,255,0.08)] text-[#E8F0FF] shadow-[0_0_0_1px_rgba(0,212,255,0.18),0_0_18px_rgba(0,212,255,0.10)]'
export const IDLE =
  'border-white/[0.10] bg-[#141C30] text-[#A8B8D8] hover:border-white/25 hover:text-[#E8F0FF]'
const INVALID = 'border-[rgba(248,113,113,0.6)]'

// ── Card shell ────────────────────────────────────────────────────────

export function StepCard({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.35)] animate-fade-up',
        className,
      )}
    >
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#00D4FF]/30 bg-gradient-to-br from-[#135BEC]/25 to-[#00D4FF]/15 text-[15px] font-semibold text-[#00D4FF]">
          {icon}
        </span>
        <h2 className="flex-1 rounded-[10px] bg-white/[0.03] px-3.5 py-2 text-[15px] font-semibold text-[#E8F0FF]">{title}</h2>
      </header>
      <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">{children}</div>
    </section>
  )
}

export function StepActions({
  onBack,
  nextLabel = 'Next',
  nextDisabled,
  loading,
  hint,
  onNext,
}: {
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  loading?: boolean
  hint?: string
  /** Omit to make the button a form submit (Enter key works). */
  onNext?: () => void
}) {
  return (
    <div className="mt-6">
      {hint && <p className="mb-3 text-right text-[12px] text-[#5A6A8A]">{hint}</p>}
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-1 py-2 text-[13.5px] font-medium text-[#A8B8D8] transition-colors hover:text-[#E8F0FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span />
        )}
        <Button
          type={onNext ? 'button' : 'submit'}
          onClick={onNext}
          size="lg"
          className="min-w-[128px] rounded-full"
          disabled={nextDisabled}
          isLoading={loading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return (
    <p className="mt-1.5 text-[12px] leading-snug text-[#F87171]" role="alert">
      {children}
    </p>
  )
}

// ── Inputs ────────────────────────────────────────────────────────────

const INPUT_TEXT =
  'w-full bg-transparent text-[16px] sm:text-[14.5px] text-[#E8F0FF] placeholder:text-[#55648A] outline-none focus-visible:outline-none'

/** Icon + small label + value, as in the design's "Your details" card. */
export function IconField({
  icon,
  label,
  error,
  ...input
}: { icon: React.ReactNode; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        className={cn(
          'flex items-center gap-3 rounded-[12px] border bg-[#141C30] px-3.5 py-2 transition-all',
          'focus-within:border-[#135BEC] focus-within:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]',
          error ? INVALID : 'border-white/[0.10]',
        )}
      >
        <span className="shrink-0 text-[#5A6A8A]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[11px] leading-none text-[#5A6A8A]">{label}</span>
          <input {...input} className={cn(INPUT_TEXT, input.className)} />
        </span>
      </label>
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function TextArea({
  invalid,
  ...props
}: { invalid?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn(
        'w-full resize-none rounded-[12px] border bg-[#141C30] px-3.5 py-3',
        'text-[16px] sm:text-[14px] text-[#E8F0FF] placeholder:text-[#55648A] outline-none focus-visible:outline-none',
        'transition-all focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]',
        invalid ? INVALID : 'border-white/[0.10]',
        props.className,
      )}
    />
  )
}

export function SelectBox({
  value,
  onChange,
  options,
  invalid,
  placeholder = 'Select…',
}: {
  value: string
  onChange: (v: string) => void
  options: Option[]
  invalid?: boolean
  placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-[12px] border bg-[#141C30] py-3 pl-3.5 pr-10',
          'text-[16px] sm:text-[14px] outline-none focus-visible:outline-none transition-all',
          'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]',
          value ? 'text-[#E8F0FF]' : 'text-[#5A6A8A]',
          invalid ? INVALID : 'border-white/[0.10]',
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

// ── Choices ───────────────────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
        selected ? 'border-[#00D4FF] bg-[#00D4FF] text-[#0A0E1A]' : 'border-white/30',
      )}
    >
      {selected && <Check className="h-3 w-3" strokeWidth={3.5} />}
    </span>
  )
}

/** Pill with a radio circle — for multi-option single choice. */
export function ChoicePill({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn('flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[13.5px] transition-all', selected ? SELECTED : IDLE)}
    >
      <RadioDot selected={selected} />
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  )
}

/** Equal-width Yes / No / I'm not sure style buttons with a tick when chosen. */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: Option[]
  value: string | undefined
  onChange: (v: string) => void
}) {
  return (
    <div role="radiogroup" className={cn('grid gap-2', options.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {options.map(o => {
        const selected = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn('flex items-center justify-center gap-2 rounded-[10px] border px-2 py-2.5 text-[13px] font-medium transition-all', selected ? SELECTED : IDLE)}
          >
            {o.label}
            {selected && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-[#0A0E1A]">
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Plain radio row (circle + label) — for the "I am a:" list. */
export function RadioRow({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors hover:bg-white/[0.04]',
        selected ? 'text-[#E8F0FF]' : 'text-[#A8B8D8]',
      )}
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-[#00D4FF]' : 'border-white/30',
        )}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.6)]" />}
      </span>
      {children}
    </button>
  )
}

export function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-[#A8B8D8]">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
      <span
        className={cn(
          'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-[#135BEC]',
          checked ? 'border-[#00D4FF] bg-[#00D4FF] text-[#0A0E1A]' : 'border-white/30 bg-[#141C30]',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
      </span>
      {children}
    </label>
  )
}

// ── Numbers ───────────────────────────────────────────────────────────

const NUM_INPUT =
  'h-11 w-[104px] rounded-[10px] border bg-[#141C30] px-3 text-[16px] sm:text-[14.5px] text-[#E8F0FF] placeholder:text-[#55648A] outline-none focus-visible:outline-none transition-all focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)] disabled:opacity-40'

export function cleanNumber(raw: string): string {
  const v = raw.replace(',', '.').replace(/[^0-9.]/g, '')
  const [whole, ...rest] = v.split('.')
  return (rest.length ? `${whole}.${rest.join('')}` : whole).slice(0, 7)
}

export function NumberInput({
  value,
  onChange,
  unit,
  allowUnknown,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  unit?: string
  allowUnknown?: boolean
  invalid?: boolean
}) {
  const unknown = value === 'unknown'
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
      <div className="flex items-center gap-2.5">
        <input
          inputMode="decimal"
          value={unknown ? '' : value}
          disabled={unknown}
          placeholder="0.0"
          onChange={e => onChange(cleanNumber(e.target.value))}
          className={cn(NUM_INPUT, invalid ? INVALID : 'border-white/[0.10]')}
        />
        {unit && <span className="text-[13px] text-[#A8B8D8]">{unit}</span>}
      </div>
      {allowUnknown && (
        <CheckboxRow checked={unknown} onChange={c => onChange(c ? 'unknown' : '')}>
          I don&apos;t know yet
        </CheckboxRow>
      )}
    </div>
  )
}

export function DimensionsInput({
  value,
  onChange,
  unit,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  unit?: string
  invalid?: boolean
}) {
  const [length = '', width = ''] = (value ?? '').split('x')
  const set = (l: string, w: string) => onChange(l || w ? `${l}x${w}` : '')
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <input
        inputMode="decimal"
        value={length}
        placeholder="4.0"
        aria-label="Length"
        onChange={e => set(cleanNumber(e.target.value), width)}
        className={cn(NUM_INPUT, invalid ? INVALID : 'border-white/[0.10]')}
      />
      <span className="text-[#5A6A8A]">×</span>
      <input
        inputMode="decimal"
        value={width}
        placeholder="3.0"
        aria-label="Width"
        onChange={e => set(length, cleanNumber(e.target.value))}
        className={cn(NUM_INPUT, invalid ? INVALID : 'border-white/[0.10]')}
      />
      {unit && <span className="text-[13px] text-[#A8B8D8]">{unit}</span>}
    </div>
  )
}
