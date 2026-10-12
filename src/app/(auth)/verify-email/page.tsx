// 'use client'

// import { useState, useEffect, useTransition } from 'react'
// import { useRouter, useSearchParams }          from 'next/navigation'

// import { AuthShell }    from '@/components/auth/AuthShell'
// import { OtpBoxes }     from '@/components/auth/OtpBoxes'
// import { Button }       from '@/components/ui/Button'
// import { verifyOtp, sendOtp } from '@/lib/api'
// import { useCountdown } from '@/hooks/useCountdown'
// import { cn }           from '@/lib/cn'

// /**
//  * /verify-email
//  * ──────────────
//  * Works for BOTH login and signup flows.
//  * Reads context from query params:
//  *   ?email=jane@example.com&intent=login|signup&returnTo=/dashboard
//  *
//  * Flow:
//  *  1. User enters the 6-digit code
//  *  2. Auto-submits on 6th digit  OR  user clicks Verify
//  *  3. POST /api/auth/verify-otp → receives JWT + user
//  *  4. Store token (localStorage / cookie via httpOnly — your choice)
//  *  5. Redirect to returnTo
//  *
//  * Resend: countdown from 60s → POST /api/auth/send-otp again
//  */
// export default function VerifyEmailPage() {
//   const router       = useRouter()
//   const searchParams = useSearchParams()

//   const email    = searchParams.get('email')    ?? ''
//   const intent   = (searchParams.get('intent')  ?? 'login') as 'login' | 'signup'
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'

//   const { formatted, canResend, start: restartTimer } = useCountdown(60)

//   const [code,       setCode]       = useState('')
//   const [hasError,   setHasError]   = useState(false)
//   const [errorMsg,   setErrorMsg]   = useState('')
//   const [isVerified, setIsVerified] = useState(false)
//   const [isPending,  startTransition] = useTransition()
//   const [isResending, setIsResending] = useState(false)

//   // ── If no email param, redirect back ──────────────────────────
//   useEffect(() => {
//     if (!email) router.replace('/login')
//   }, [email, router])

//   // ── Auto-submit when 6 digits filled ─────────────────────────
//   function handleComplete(fullCode: string) {
//     setCode(fullCode)
//     submitCode(fullCode)
//   }

//   // ── Verify the code ───────────────────────────────────────────
//   function submitCode(codeToSubmit: string) {
//     if (codeToSubmit.length !== 6) return

//     startTransition(async () => {
//       setHasError(false)
//       setErrorMsg('')

//       const { data, error: apiError } = await verifyOtp({
//         email: email.trim(),
//         code:  codeToSubmit,
//       })

//       if (apiError || !data?.success) {
//         setHasError(true)
//         setErrorMsg(apiError ?? 'Incorrect code. Please try again.')
//         setCode('')
//         return
//       }

//       // ── Store the token ──────────────────────────────────────
//       // Option A: localStorage (simplest for SPA)
//       // localStorage.setItem('accessToken', data.accessToken)
//       //
//       // Option B: httpOnly cookie via API route (recommended for production)
//       // await fetch('/api/auth/session', { method: 'POST', body: JSON.stringify({ token: data.accessToken }) })
//       //
//       // For now: log and proceed so the UI flow is testable
//       console.log('[auth] verified:', data.user.email)

//       setIsVerified(true)

//       // Short delay so user sees the success state
//       setTimeout(() => router.push(returnTo), 800)
//     })
//   }

//   // ── Resend code ───────────────────────────────────────────────
//   async function handleResend() {
//     if (!canResend || isResending) return
//     setIsResending(true)
//     setHasError(false)
//     setErrorMsg('')
//     setCode('')

//     const { error: apiError } = await sendOtp({ email: email.trim(), intent })
//     setIsResending(false)

//     if (apiError) {
//       setErrorMsg('Failed to resend. Please try again.')
//       return
//     }

//     restartTimer()
//   }

//   // Mask email for display: jane@example.com → j***@example.com
//   const maskedEmail = email
//     ? email.replace(/^(.)(.*)(@.+)$/, (_: string, a: string, _b: string, c: string) => `${a}***${c}`)
//     : ''

//   return (
//     <AuthShell
//       eyebrow={intent === 'signup' ? 'Step 2 of 2 — Verify email' : 'Sign in'}
//       title={isVerified ? 'You're in! ✓' : 'Check your inbox'}
//       subtitle={
//         isVerified
//           ? 'Verified successfully. Redirecting you now…'
//           : (
//             <>
//               We sent a 6-digit code to{' '}
//               <span className="text-[#E8F0FF] font-medium">{maskedEmail}</span>.
//               {' '}Enter it below to continue.
//             </>
//           )
//       }
//       footerText="Wrong email?"
//       footerLink={{
//         label: 'Go back',
//         href:  intent === 'signup' ? '/signup' : '/login',
//       }}
//     >
//       {isVerified ? (
//         /* ── Success state ─────────────────────────────────────── */
//         <div className="flex flex-col items-center py-4 gap-3">
//           <div
//             className="w-16 h-16 rounded-full flex items-center justify-center"
//             style={{
//               background: 'rgba(19,91,236,0.12)',
//               boxShadow:  '0 0 30px rgba(19,91,236,0.25)',
//             }}
//           >
//             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#135BEC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M20 6 9 17l-5-5"/>
//             </svg>
//           </div>
//           <p className="text-sm text-[#5A6A8A]">Redirecting…</p>
//         </div>
//       ) : (
//         /* ── OTP entry state ───────────────────────────────────── */
//         <>
//           {/* OTP boxes */}
//           <div className="py-2">
//             <OtpBoxes
//               onComplete={handleComplete}
//               hasError={hasError}
//               disabled={isPending}
//               className="mb-4"
//             />

//             {/* Error message */}
//             {errorMsg && (
//               <p
//                 className="text-center text-[13px] text-[#F87171] mt-1"
//                 role="alert"
//               >
//                 {errorMsg}
//               </p>
//             )}
//           </div>

//           {/* Verify button — shown when user hasn't auto-submitted */}
//           {code.length === 6 && !isPending && (
//             <Button
//               variant="primary"
//               size="lg"
//               fullWidth
//               onClick={() => submitCode(code)}
//               className="mb-4"
//             >
//               Verify code →
//             </Button>
//           )}

//           {isPending && (
//             <Button
//               variant="primary"
//               size="lg"
//               fullWidth
//               isLoading
//               disabled
//               className="mb-4"
//             >
//               Verifying…
//             </Button>
//           )}

//           {/* Resend row */}
//           <div className="flex items-center justify-center gap-1.5 mt-2">
//             <p className="text-[13px] text-[#5A6A8A]">
//               {canResend ? "Didn't get it?" : `Resend in ${formatted}`}
//             </p>
//             {canResend && (
//               <button
//                 type="button"
//                 onClick={handleResend}
//                 disabled={isResending}
//                 className={cn(
//                   'text-[13px] font-medium text-[#135BEC]',
//                   'hover:text-[#2A6BF0] transition-colors',
//                   'disabled:opacity-50 disabled:cursor-not-allowed'
//                 )}
//               >
//                 {isResending ? 'Sending…' : 'Resend code'}
//               </button>
//             )}
//           </div>

//           {/* Security note */}
//           <p className="mt-6 pt-5 border-t border-white/[0.06] text-[11px] text-[#5A6A8A] text-center leading-relaxed">
//             🔒 The code expires in 10 minutes. Never share it with anyone.
//           </p>
//         </>
//       )}
//     </AuthShell>
//   )
// }

// 'use client'

// import { useState, useTransition } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { AuthShell } from '@/components/auth/AuthShell'
// import { OtpBoxes }  from '@/components/auth/OtpBoxes'
// import { Button }    from '@/components/ui/Button'
// import { verifyOtpMock as verifyOtp, sendOtpMock as sendOtp, DEMO_OTP } from '@/lib/mock'
// import type { AuthIntent } from '@/types/auth'
// import { cn } from '@/lib/cn'
// import SuspenseWrapper from '@/components/SuspenseWrapper'

// /**
//  * /verify-email
//  * ──────────────
//  * - Verifies OTP for both login + signup intents
//  * - On success:
//  *     mfaEnabled  → /mfa-verify   (existing users who set up MFA)
//  *     !mfaEnabled → /mfa-setup    (nudge them to set up MFA every login)
//  *
//  * To skip MFA entirely: change the !mfaEnabled branch to router.push(returnTo)
//  */
// export default function VerifyEmailPage() {
//   const router       = useRouter()
//   const searchParams = useSearchParams()

//   const email    = searchParams.get('email')    ?? ''
//   const intent   = (searchParams.get('intent') ?? 'login') as AuthIntent
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'
//   const name     = searchParams.get('name')     ?? ''

//   const [error,      setError]      = useState('')
//   const [hasError,   setHasError]   = useState(false)
//   const [isPending,  startTransition] = useTransition()
//   const [resent,     setResent]     = useState(false)

//   function handleComplete(code: string) {
//     if (isPending) return
//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { data, error: apiError } = await verifyOtp({ email, code })

//       if (apiError || !data) {
//         setError(apiError ?? 'Verification failed.')
//         setHasError(true)
//         return
//       }

//       // Store token however your app does it (cookie, zustand, etc.)
//       // localStorage is just for demo purposes
//       if (typeof window !== 'undefined') {
//         localStorage.setItem('demo_token', data.accessToken)
//         localStorage.setItem('demo_user',  JSON.stringify(data.user))
//       }

//       if (data.mfaEnabled) {
//         // User already set up MFA → verify it
//         const params = new URLSearchParams({ email, returnTo })
//         router.push(`/mfa-verify?${params.toString()}`)
//       } else {
//         // Nudge to set up MFA
//         const params = new URLSearchParams({ email, returnTo })
//         router.push(`/mfa-setup?${params.toString()}`)
//       }
//     })
//   }

//   async function handleResend() {
//     setResent(false)
//     await sendOtp({ email, intent })
//     setResent(true)
//     setTimeout(() => setResent(false), 4000)
//   }

//   const maskedEmail = email.replace(/^(.)(.*)(@.+)$/, (_, a, _b, c) => `${a}***${c}`)

//   return (
//     <SuspenseWrapper>
//     <AuthShell
//       eyebrow={intent === 'signup' ? 'Step 2 of 2' : undefined}
//       title="Check your inbox"
//       subtitle={
//         <>
//           We sent a 6-digit code to{' '}
//           <span className="text-[#A8B8D8] font-medium">{maskedEmail}</span>
//         </>
//       }
//     >
//       <div className="space-y-6">
//         <OtpBoxes
//           onComplete={handleComplete}
//           hasError={hasError}
//           disabled={isPending}
//         />

//         {error && (
//           <p className="text-center text-[13px] text-[#F87171]" role="alert">
//             {error}
//           </p>
//         )}

//         <Button
//           type="button"
//           variant="primary"
//           size="lg"
//           fullWidth
//           isLoading={isPending}
//           disabled={isPending}
//         >
//           {isPending ? 'Verifying…' : 'Verify code'}
//         </Button>

//         <p className="text-center text-[12px] text-[#5A6A8A]">
//           Didn't receive it?{' '}
//           <button
//             type="button"
//             onClick={handleResend}
//             className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors"
//           >
//             Resend code
//           </button>
//           {resent && <span className="ml-2 text-[#135BEC]">✓ Sent!</span>}
//         </p>
//       </div>

//       {/* Dev hint */}
//       <p className={cn('mt-7 pt-5 border-t border-white/[0.06]', 'text-[11px] text-[#5A6A8A] text-center')}>
//         🛠 Mock mode — use code <span className="text-[#135BEC] font-mono">{DEMO_OTP}</span>
//       </p>
//     </AuthShell>
//     </SuspenseWrapper>
//   )
// }

'use client'

import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}