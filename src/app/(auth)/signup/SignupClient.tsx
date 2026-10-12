'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { AuthShell } from '@/components/auth/AuthShell'
import { AuthInput } from '@/components/auth/AuthInput'
import { Button } from '@/components/ui/Button'
import { sendOtpMock as sendOtp } from '@/lib/mock'
import type { FieldState } from '@/types/auth'

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function isValidName(v: string) {
  return v.trim().length >= 2
}

function buildLoginHref(returnTo: string, actor: string) {
  const params = new URLSearchParams()
  if (returnTo !== '/dashboard') params.set('returnTo', returnTo)
  if (actor) params.set('actor', actor)
  const query = params.toString()
  return query ? `/login?${query}` : '/login'
}

interface SignupClientProps {
  returnTo: string
  goalId: string
  /** Who the person is (homeowner/landlord/etc), set by the homepage search. */
  actor: string
}

export default function SignupClient({
  returnTo,
  goalId,
  actor,
}: SignupClientProps) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const nameState: FieldState = errors.name
    ? 'error'
    : name && isValidName(name)
    ? 'valid'
    : 'idle'

  const emailState: FieldState = errors.email
    ? 'error'
    : email && isValidEmail(email)
    ? 'valid'
    : 'idle'

  function validate() {
    const e: Record<string, string> = {}

    if (!isValidName(name))
      e.name = 'Please enter your full name.'

    if (!isValidEmail(email))
      e.email = 'Please enter a valid email address.'

    setErrors(e)

    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    startTransition(async () => {
      const { data, error: apiError } = await sendOtp({
        email: email.trim(),
      })

      if (apiError || !data?.success) {
        setErrors({
          email:
            apiError ??
            'Something went wrong. Please try again.',
        })
        return
      }

      const params = new URLSearchParams({
        email: email.trim(),
        name: name.trim(),
        intent: 'signup',
        returnTo,
        ...(goalId ? { goalId } : {}),
        ...(actor ? { actor } : {}),
      })

      router.push(
        `/verify-email?${params.toString()}`
      )
    })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. Your planning goal is saved."
      footerText="Already have an account?"
      footerLink={{
        label: 'Log in',
        href: buildLoginHref(returnTo, actor),
      }}
      maxWidth="md"
    >
      {goalId && (
        <div className="mb-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-[rgba(19,91,236,0.07)] border border-[rgba(19,91,236,0.2)]">
          <span
            className="text-[#135BEC]"
            aria-hidden="true"
          >
            ✓
          </span>

          <p className="text-[12px] text-[#A8B8D8]">
            Your planning goal is saved — we'll continue
            your check after sign-up.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <AuthInput
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setErrors((p) => ({
              ...p,
              name: '',
            }))
          }}
          fieldState={nameState}
          message={errors.name}
          autoFocus
          disabled={isPending}
        />

        <AuthInput
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((p) => ({
              ...p,
              email: '',
            }))
          }}
          fieldState={emailState}
          message={errors.email}
          disabled={isPending}
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending
              ? 'Sending code…'
              : 'Create account →'}
          </Button>
        </div>

        <p className="text-center text-[11px] text-[#5A6A8A] leading-relaxed px-2">
          By signing up you agree to our{' '}
          <Link
            href="/terms"
            className="text-[#A8B8D8] hover:text-[#E8F0FF] underline underline-offset-2"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-[#A8B8D8] hover:text-[#E8F0FF] underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  )
}