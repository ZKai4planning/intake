'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { AuthInput } from '@/components/auth'
import { cn } from '@/lib/cn'

/**
 * /reset-password
 * ────────────────
 * Single-field password reset. Assumes the user already arrived here
 * via a valid reset link/token (e.g. /reset-password?token=...) or is
 * already authenticated and just wants to set a new password — so the
 * only input is the new password itself.
 *
 * API integration point: wire handleSubmit to
 *   POST /api/auth/reset-password { token, password }
 */

const MIN_LENGTH = 8

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const isValid = password.trim().length >= MIN_LENGTH

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setError('')
    setIsSubmitting(true)
    try {
      // API integration point: POST /api/auth/reset-password { token, password }
      await new Promise(resolve => setTimeout(resolve, 600))
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="w-full max-w-[380px] text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] flex items-center justify-center">
            <CheckIcon />
          </div>
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">Password updated</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">
            Your password has been reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Go to login →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <p className="font-display text-2xl text-[#E8F0FF] mb-1 text-center">Reset your password</p>
        <p className="text-[13px] text-[#5A6A8A] mb-7 text-center">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
          <div className="relative">
            <AuthInput
              label="New password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              autoFocus
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-[34px] text-[11.5px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8]"
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <p className="text-[11.5px] text-[#5A6A8A] mt-2">
            Must be at least {MIN_LENGTH} characters.
          </p>

          {error && <p className="text-[12px] text-[#FF6B6B] mt-3">{error}</p>}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn(
              'w-full mt-5 px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors',
              !isValid || isSubmitting
                ? 'bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
                : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
            )}
          >
            {isSubmitting ? 'Updating…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#135BEC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}