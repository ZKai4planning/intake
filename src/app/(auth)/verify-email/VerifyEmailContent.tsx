'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { OtpBoxes } from '@/components/auth/OtpBoxes'
import { Button } from '@/components/ui/Button'
import { useCountdown } from '@/hooks/useCountdown'
import { verifyOtp, sendOtp, updateMe } from '@/lib/api'
import { clearLocalUserData, getCachedSessionEmail } from '@/lib/clearLocalUserData'
import { readIntake } from '@/lib/intake/storage'
import type { AuthIntent } from '@/types/auth'
import type { ActorId } from '@/types'
import { ACTOR_WORKSPACE_MAP } from '@/types/workspace'

const VALID_ACTOR_IDS = new Set(Object.keys(ACTOR_WORKSPACE_MAP))
const RESEND_COOLDOWN_SECONDS = 45

function resolveActorId(raw: string | null): ActorId {
  return raw && VALID_ACTOR_IDS.has(raw) ? (raw as ActorId) : 'homeowner'
}

/**
 * getExistingActorId
 * Reuses the actor from an existing session during login, so logging
 * back in doesn't silently move the account to a different workspace
 * just because a different "I am a…" pill happened to be picked on
 * the homepage this time around.
 */
function getExistingActorId(email: string): ActorId | null {
  if (typeof window === 'undefined' || !email) return null

  try {
    const raw = localStorage.getItem('auth_session')
    if (!raw) return null

    const existing = JSON.parse(raw)

    if (
      existing?.email === email &&
      typeof existing?.actorId === 'string' &&
      VALID_ACTOR_IDS.has(existing.actorId)
    ) {
      return existing.actorId as ActorId
    }
  } catch {
    // Ignore malformed session.
  }

  return null
}

export default function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get('email') ?? ''
  const intent = (searchParams.get('intent') ?? 'login') as AuthIntent
  const returnTo = searchParams.get('returnTo') ?? '/dashboard'

  const actorIdFromQuery = resolveActorId(searchParams.get('actor'))

  const [error, setError] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const [resent, setResent] = useState(false)
  const { seconds: resendCooldown, canResend, start: startResendCooldown } = useCountdown(RESEND_COOLDOWN_SECONDS)

  function handleComplete(code: string) {
    if (isPending) return

    setError('')
    setHasError(false)

    startTransition(async () => {
      const { data, error: apiError } = await verifyOtp({
        email,
        code,
      })

      if (apiError || !data) {
        setError(apiError ?? 'Verification failed.')
        setHasError(true)
        return
      }

      // For a returning login, keep the actor this account already has
      // rather than whatever pill happened to be selected this time.
      const actorId =
        intent === 'login'
          ? getExistingActorId(email) ?? actorIdFromQuery
          : actorIdFromQuery

      if (intent === 'signup') {
        // Persist to the actual profile row in Supabase, not just this
        // browser's localStorage — so it's still there on another
        // device, and doesn't disappear if localStorage gets cleared.
        // Best-effort: request() never throws, and a failure here
        // shouldn't block getting the person into the app — the
        // dashboard can prompt to pick a workspace again if this
        // silently didn't stick.
        // When they came from the intake chat we already know their name and
        // (optionally) mobile — save them now so they never have to be asked
        // again on the profile page.
        const intake = searchParams.get('from') === 'intake' ? readIntake() : null
        const intakeEmailMatches = intake?.details.email.trim().toLowerCase() === email.trim().toLowerCase()
        const name = intakeEmailMatches ? intake?.details.fullName.trim() : ''
        const phone = intakeEmailMatches ? intake?.details.mobile.trim() : ''
        updateMe({ actorId, ...(name ? { name } : {}), ...(phone ? { phone } : {}) })
      }

      // If a DIFFERENT account was cached in this browser (previous
      // person, or this person switching accounts without explicitly
      // logging out first), wipe every local cache before writing the
      // new session — otherwise this account would render with the
      // previous one's cached reports/cart/drafts/avatar still sitting
      // in localStorage. Logging back into the SAME account preserves
      // whatever's cached, since none of that data is a leak in that case.
      const previousEmail = getCachedSessionEmail()
      if (previousEmail && previousEmail !== data.user.email) {
        clearLocalUserData()
      }

      if (typeof window !== 'undefined') {
        // Persist the session the dashboard reads (useWorkspace reads
        // localStorage['auth_session']). The backend's cookie handles
        // the actual authenticated requests; this local copy is what
        // drives the client-side workspace/session UI.
        localStorage.setItem(
          'auth_session',
          JSON.stringify({
            email: data.user.email,
            name: data.user.name,
            accessToken: data.accessToken,
            mfaEnabled: data.mfaEnabled,
            role: data.user.role,
            actorId,
            phone: data.user.phone,
            avatarUrl: data.user.avatarUrl,
          })
        )
      }

      // Directly navigate to the requested page. (MFA is currently
      // disabled on the frontend even though the backend supports it —
      // see mfaEnabled on the response if that changes.)
      router.push(returnTo)
    })
  }

  async function handleResend() {
    if (isResending || !canResend) return

    setResent(false)
    setResendError('')
    setIsResending(true)

    // No `intent` to send — the server re-checks whether the account
    // exists each time, same as the initial call from the login page.
    const { error: apiError } = await sendOtp({ email })

    setIsResending(false)

    if (apiError) {
      // This was the actual bug: the old version never checked this and
      // always showed "✓ Sent!" even when the request failed, so a
      // resend that silently didn't go out looked identical to one that
      // did — the person just never got a second code and had no idea
      // why.
      setResendError(apiError)
      return
    }

    setResent(true)
    startResendCooldown(RESEND_COOLDOWN_SECONDS)
    setTimeout(() => setResent(false), 4000)
  }

  const maskedEmail = email.replace(
    /^(.)(.*)(@.+)$/,
    (_, a, _b, c) => `${a}***${c}`
  )

  return (
    <AuthShell
      eyebrow={searchParams.get('from') === 'intake' ? 'Last step — your project is saved' : intent === 'signup' ? 'Step 2 of 2' : undefined}
      title="Check your inbox"
      subtitle={
        <>
          We sent a 6-digit code to{' '}
          <span className="text-[#A8B8D8] font-medium">
            {maskedEmail}
          </span>
        </>
      }
    >
      <div className="space-y-6">
        <OtpBoxes
          onComplete={handleComplete}
          hasError={hasError}
          disabled={isPending}
        />

        {error && (
          <p
            className="text-center text-[13px] text-[#F87171]"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isPending}
          disabled={isPending}
        >
          {isPending ? 'Verifying…' : 'Verify code'}
        </Button>

        <div className="text-center text-[12px] text-[#5A6A8A] space-y-1.5">
          <p>
            Didn't receive it?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !canResend}
              className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors disabled:text-[#3A4560] disabled:cursor-not-allowed"
            >
              {isResending
                ? 'Sending…'
                : !canResend
                  ? `Resend code (${resendCooldown}s)`
                  : 'Resend code'}
            </button>

            {resent && (
              <span className="ml-2 text-[#135BEC]">
                ✓ Sent!
              </span>
            )}
          </p>

          {resendError && (
            <p className="text-[#F87171]" role="alert">
              {resendError}
            </p>
          )}
        </div>
      </div>
    </AuthShell>
  )
}
