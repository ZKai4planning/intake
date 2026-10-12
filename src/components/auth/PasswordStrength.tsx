'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/cn'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface StrengthResult {
  score:    0 | 1 | 2 | 3 | 4
  label:    string
  color:    string
  checks:   { label: string; passed: boolean }[]
}

function analyse(password: string): StrengthResult {
  const checks = [
    { label: 'At least 8 characters',         passed: password.length >= 8 },
    { label: 'Uppercase letter',               passed: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',               passed: /[a-z]/.test(password) },
    { label: 'Number',                         passed: /\d/.test(password) },
    { label: 'Special character (!@#$%…)',     passed: /[^A-Za-z0-9]/.test(password) },
  ]

  const passed = checks.filter(c => c.passed).length as 0 | 1 | 2 | 3 | 4

  const score = Math.min(4, passed) as 0 | 1 | 2 | 3 | 4

  const meta: Record<number, { label: string; color: string }> = {
    0: { label: '',         color: 'bg-white/[0.08]'             },
    1: { label: 'Weak',     color: 'bg-[#F87171]'                },
    2: { label: 'Fair',     color: 'bg-[#F59E0B]'                },
    3: { label: 'Good',     color: 'bg-[#00D4FF]'                },
    4: { label: 'Strong',   color: 'bg-[#135BEC]'                },
  }

  return { score, label: meta[score].label, color: meta[score].color, checks }
}

/**
 * PasswordStrength
 * ─────────────────
 * Shows a 4-bar strength meter + checklist as the user types.
 * Only renders when password.length > 0.
 */
export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const result = useMemo(() => analyse(password), [password])

  if (!password) return null

  return (
    <div className={cn('mt-2 space-y-2.5', className)}>
      {/* Bars */}
      <div className="flex gap-1.5" aria-label={`Password strength: ${result.label}`}>
        {[1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              result.score >= level ? result.color : 'bg-white/[0.08]'
            )}
          />
        ))}
        {result.label && (
          <span className="ml-1 text-[11px] font-medium text-[#5A6A8A] shrink-0 leading-none self-center">
            {result.label}
          </span>
        )}
      </div>

      {/* Checklist */}
      <ul className="space-y-1" aria-label="Password requirements">
        {result.checks.map(c => (
          <li
            key={c.label}
            className={cn(
              'flex items-center gap-2 text-[12px] transition-colors duration-150',
              c.passed ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
            )}
          >
            <span aria-hidden="true">{c.passed ? '✓' : '○'}</span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
