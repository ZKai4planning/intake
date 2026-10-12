'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { OtpBoxes } from '@/components/auth/OtpBoxes'
import { AuthInput } from '@/components/auth/AuthInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { Button } from '@/components/ui/Button'
import { resetPasswordMock as resetPassword, forgotPasswordMock as forgotPassword } from '@/lib/mock'
import { useCountdown } from '@/hooks/useCountdown'
import type { FieldState } from '@/types/auth'

function isValidPassword(v: string) {
  return v.length >= 8
}

interface ForgotPasswordVerifyClientProps {
  email: string
}

export default function ForgotPasswordVerifyClient({
  email,
}: ForgotPasswordVerifyClientProps) {
  const router = useRouter()

  const {
    formatted,
    canResend,
    start: restartTimer,
  } = useCountdown(60)

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const [codeError, setCodeError] = useState('')
  const [passError, setPassError] = useState('')
  const [confError, setConfError] = useState('')

  const [isSuccess, setIsSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const [codeConfirmed, setCodeConfirmed] = useState(false)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!email) {
      router.replace('/forgot-password')
    }
  }, [email, router])

  function handleCodeComplete(c: string) {
    setCode(c)
    setCodeError('')
  }

  function confirmCode() {
    if (code.length !== 6) {
      setCodeError('Please enter all 6 digits.')
      return
    }

    setCodeConfirmed(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let hasError = false

    if (!isValidPassword(password)) {
      setPassError('Password must be at least 8 characters.')
      hasError = true
    } else {
      setPassError('')
    }

    if (password !== confirm) {
      setConfError('Passwords do not match.')
      hasError = true
    } else {
      setConfError('')
    }

    if (hasError) return

    startTransition(async () => {
      const { data, error: apiError } = await resetPassword({
        email: email.trim(),
        code,
        password,
      })

      if (apiError || !data?.success) {
        if (
          apiError?.toLowerCase().includes('code') ||
          apiError?.toLowerCase().includes('expired')
        ) {
          setCodeConfirmed(false)
          setCode('')
          setCodeError(
            apiError ?? 'Invalid or expired code.'
          )
        } else {
          setPassError(
            apiError ??
              'Something went wrong. Please try again.'
          )
        }

        return
      }

      setIsSuccess(true)

      setTimeout(() => {
        router.push('/login?reset=success')
      }, 1200)
    })
  }

  async function handleResend() {
    if (!canResend || isResending) return

    setIsResending(true)
    setCode('')
    setCodeError('')
    setCodeConfirmed(false)

    const { error: apiError } =
      await forgotPassword({
        email: email.trim(),
      })

    setIsResending(false)

    if (apiError) {
      setCodeError(
        'Failed to resend. Please try again.'
      )
      return
    }

    restartTimer()
  }

  const maskedEmail = email
    ? email.replace(
        /^(.)(.*)(@.+)$/,
        (_match, a, _b, c) => `${a}***${c}`
      )
    : ''

  const passwordState: FieldState = passError
    ? 'error'
    : password && isValidPassword(password)
    ? 'valid'
    : 'idle'

  const confirmState: FieldState = confError
    ? 'error'
    : confirm && confirm === password
    ? 'valid'
    : 'idle'

  return (
    <AuthShell
      eyebrow="Reset password"
      title={
        isSuccess
          ? 'Password updated ✓'
          : 'Set a new password'
      }
      subtitle={
        isSuccess ? (
          'Your password has been reset. Redirecting to login…'
        ) : !codeConfirmed ? (
          <>
            Enter the 6-digit code sent to{' '}
            <span className="text-[#E8F0FF] font-medium">
              {maskedEmail}
            </span>
            .
          </>
        ) : (
          'Code verified. Choose a new password below.'
        )
      }
      footerText="Back to"
      footerLink={{
        label: 'Log in',
        href: '/login',
      }}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background:
                'rgba(19,91,236,0.12)',
              boxShadow:
                '0 0 30px rgba(19,91,236,0.25)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#135BEC"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <p className="text-sm text-[#5A6A8A]">
            Redirecting to login…
          </p>
        </div>
      ) : !codeConfirmed ? (
        <div className="space-y-5">
          <OtpBoxes
            onComplete={handleCodeComplete}
            hasError={!!codeError}
            disabled={isPending}
          />

          {codeError && (
            <p
              className="text-center text-[13px] text-[#F87171]"
              role="alert"
            >
              {codeError}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={confirmCode}
            disabled={code.length !== 6}
          >
            Confirm code →
          </Button>

          <div className="flex items-center justify-center gap-1.5">
            <p className="text-[13px] text-[#5A6A8A]">
              {canResend
                ? "Didn't get it?"
                : `Resend in ${formatted}`}
            </p>

            {canResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[13px] font-medium text-[#135BEC] hover:text-[#2A6BF0] transition-colors disabled:opacity-50"
              >
                {isResending
                  ? 'Sending…'
                  : 'Resend code'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[rgba(19,91,236,0.07)] border border-[rgba(19,91,236,0.2)]">
            <span className="text-[#135BEC] text-sm">
              ✓
            </span>

            <p className="text-[12px] text-[#A8B8D8]">
              Code verified — now set your new password.
            </p>

            <button
              type="button"
              onClick={() => {
                setCodeConfirmed(false)
                setCode('')
              }}
              className="ml-auto text-[11px] text-[#5A6A8A] hover:text-[#A8B8D8]"
            >
              Change
            </button>
          </div>

          <AuthInput
            label="New password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPassError('')
            }}
            fieldState={passwordState}
            message={passError}
            autoFocus
            disabled={isPending}
          />

          <PasswordStrength password={password} />

          <AuthInput
            label="Confirm new password"
            type={showConf ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setConfError('')
            }}
            fieldState={confirmState}
            message={confError}
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isPending}
            disabled={
              !password ||
              !confirm ||
              isPending
            }
          >
            {isPending
              ? 'Updating password…'
              : 'Set new password →'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}