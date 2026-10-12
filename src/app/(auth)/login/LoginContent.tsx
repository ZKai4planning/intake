'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { AuthInput } from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/Button'
import { sendOtp } from '@/lib/api'
import { INTAKE_RETURN_TO } from '@/lib/intake/config'
import { getIntakeEmail, maskEmail } from '@/lib/intake/storage'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromIntake = searchParams.get('from') === 'intake'
  const returnTo = searchParams.get('returnTo') ?? (fromIntake ? INTAKE_RETURN_TO : '/dashboard')
  // Set on the homepage search (who the person is, e.g. 'landlord') —
  // carried through to verify-email so a fresh account gets the right
  // workspace instead of always defaulting to 'homeowner'.
  const actor = searchParams.get('actor') ?? ''

  // Email handed over from the intake chat (?email=…) or, when we arrive with
  // ?from=intake, the one they typed on the "Your details" card. Prefilling it
  // means they only have to tap "Send code" — no retyping.
  const emailParam = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(emailParam)
  const [prefilled, setPrefilled] = useState(!!emailParam)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (emailParam || !fromIntake) return
    const saved = getIntakeEmail()
    if (saved) {
      setEmail(saved)
      setPrefilled(true)
    }
  }, [emailParam, fromIntake])

  const emailState =
    error ? 'error' : email && isValidEmail(email) ? 'valid' : 'idle'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    const trimmedEmail = email.trim()

    startTransition(async () => {
      // Single request — no intent to pick. The server checks whether
      // this email already has an account and sends the matching code
      // (login vs. signup) in one round trip; `data.intent` tells us
      // which one it picked so verify-email can show the right copy.
      const { data, error: apiError } = await sendOtp({ email: trimmedEmail })

      if (apiError || !data?.success) {
        setError(apiError ?? 'Something went wrong.')
        return
      }

      const params = new URLSearchParams({
        email: trimmedEmail,
        intent: data.intent,
        returnTo,
        ...(actor ? { actor } : {}),
        ...(fromIntake ? { from: 'intake' } : {}),
      })

      router.push(`/verify-email?${params.toString()}`)
    })
  }

  return (
    <AuthShell
      title="Welcome"
      subtitle="Enter your email and we'll send you a sign-in code."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {prefilled && email && (
          <div className="rounded-[12px] border border-[#135BEC]/30 bg-[rgba(19,91,236,0.07)] px-4 py-3">
            <p className="text-[12px] text-[#A8B8D8]">We&apos;ll send your sign-in code to</p>
            <p className="mt-0.5 break-all text-[15px] font-semibold text-[#E8F0FF]">{email}</p>
            <button
              type="button"
              onClick={() => {
                setPrefilled(false)
                setEmail('')
              }}
              className="mt-1 text-[12px] font-medium text-[#00D4FF] hover:underline"
            >
              Not you? Use a different email
            </button>
          </div>
        )}

        {!(prefilled && email) && (
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
        )}

        {prefilled && email && error && (
          <p className="text-[13px] text-[#F87171]" role="alert">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isPending}
          disabled={!email || isPending}
        >
          {isPending ? 'Sending code…' : prefilled && email ? `Send code to ${maskEmail(email)} →` : 'Send sign-in code →'}
        </Button>
      </form>
    </AuthShell>
  )
}
