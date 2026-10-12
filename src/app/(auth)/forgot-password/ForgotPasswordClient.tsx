'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { AuthInput } from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/Button'
import { forgotPasswordMock as forgotPassword } from '@/lib/mock'
import type { FieldState } from '@/types/auth'

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

interface ForgotPasswordClientProps {
  initialEmail: string
}

export default function ForgotPasswordClient({
  initialEmail,
}: ForgotPasswordClientProps) {
  const router = useRouter()

  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const emailState: FieldState = error
    ? 'error'
    : email && isValidEmail(email)
    ? 'valid'
    : 'idle'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')

    startTransition(async () => {
      const { data, error: apiError } = await forgotPassword({
        email: email.trim(),
      })

      if (apiError) {
        setError(apiError)
        return
      }

      if (data?.success || !apiError) {
        setSent(true)

        const params = new URLSearchParams({
          email: email.trim(),
        })

        router.push(
          `/forgot-password/verify?${params.toString()}`
        )
      }
    })
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a reset code."
      footerText="Remember your password?"
      footerLink={{
        label: 'Back to log in',
        href: '/login',
      }}
    >
      {sent ? (
        <div className="flex flex-col items-center py-6 gap-3 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(19,91,236,0.12)',
              boxShadow: '0 0 24px rgba(19,91,236,0.2)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#135BEC"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2-2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <p className="text-[14px] text-[#A8B8D8]">
            Sending your reset code…
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          <AuthInput
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            fieldState={emailState}
            message={error}
            autoFocus
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isPending}
            disabled={!email || isPending}
          >
            {isPending
              ? 'Sending code…'
              : 'Send reset code →'}
          </Button>

          <p className="text-center text-[11px] text-[#5A6A8A] leading-relaxed">
            🔒 We'll send a 6-digit code to your inbox. It expires
            in 10 minutes.
          </p>
        </form>
      )}
    </AuthShell>
  )
}