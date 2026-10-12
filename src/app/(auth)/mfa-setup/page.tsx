// 'use client'

// import { useState, useTransition, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { AuthShell }  from '@/components/auth/AuthShell'
// import { OtpBoxes }   from '@/components/auth/OtpBoxes'
// import { Button }     from '@/components/ui/Button'
// import { setupMfaMock as setupMfa, verifyMfaMock as verifyMfa } from '@/lib/mock'
// import { cn } from '@/lib/cn'
// import SuspenseWrapper from '@/components/SuspenseWrapper'

// /**
//  * /mfa-setup
//  * ───────────
//  * Shown after EVERY login until the user enables MFA.
//  * Flow:
//  *   1. Load → call setupMfa to get TOTP secret
//  *   2. User scans QR (or copies secret) in their authenticator app
//  *   3. User enters 6-digit TOTP code to confirm
//  *   4. On success → redirect to returnTo
//  *
//  * "Skip for now" link lets them bypass (shown until they enroll).
//  * To make MFA mandatory: remove the skip link.
//  */
// export default function MfaSetupPage() {
//   const router       = useRouter()
//   const searchParams = useSearchParams()

//   const email    = searchParams.get('email')    ?? ''
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'

//   const [secret,     setSecret]     = useState('')
//   const [step,       setStep]       = useState<'scan' | 'verify' | 'done'>('scan')
//   const [error,      setError]      = useState('')
//   const [hasError,   setHasError]   = useState(false)
//   const [backupCodes, setBackupCodes] = useState<string[]>([])
//   const [isPending,  startTransition] = useTransition()
//   const [loadingSetup, setLoadingSetup] = useState(true)

//   useEffect(() => {
//     setupMfa(email).then(({ data }) => {
//       if (data) setSecret(data.secret)
//       setLoadingSetup(false)
//     })
//   }, [email])

//   function handleOtpComplete(code: string) {
//     if (isPending) return
//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { data, error: apiError } = await verifyMfa({ email, code, enable: true })
//       if (apiError || !data) {
//         setError(apiError ?? 'Invalid code. Try again.')
//         setHasError(true)
//         return
//       }
//       setBackupCodes(data.backupCodes ?? [])
//       setStep('done')
//     })
//   }

//   function handleDone() {
//     router.push(returnTo)
//   }

//   // ── DONE screen ──────────────────────────────────────────────────
//   if (step === 'done') {
//     return (
//       <SuspenseWrapper>
//       <AuthShell
//         title="MFA enabled 🎉"
//         subtitle="Your account is now protected with two-factor authentication."
//       >
//         <div className="space-y-5">
//           <div className="rounded-[12px] bg-[#141C30] border border-white/[0.08] p-4">
//             <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5A6A8A] mb-3">
//               Backup codes — save these somewhere safe
//             </p>
//             <div className="grid grid-cols-2 gap-2">
//               {backupCodes.map(c => (
//                 <code key={c} className="text-[13px] font-mono text-[#E8F0FF] bg-[#0A0E1A] rounded-[8px] px-3 py-1.5 text-center">
//                   {c}
//                 </code>
//               ))}
//             </div>
//             <p className="mt-3 text-[11px] text-[#5A6A8A]">
//               Each code can be used once if you lose access to your authenticator app.
//             </p>
//           </div>

//           <Button type="button" variant="primary" size="lg" fullWidth onClick={handleDone}>
//             Continue to dashboard →
//           </Button>
//         </div>
//       </AuthShell>
//       </SuspenseWrapper>
//     )
//   }

//   // ── VERIFY step ──────────────────────────────────────────────────
//   if (step === 'verify') {
//     return (
//       <AuthShell
//         eyebrow="Step 2 of 2"
//         title="Confirm your authenticator"
//         subtitle="Enter the 6-digit code from your authenticator app to finish setup."
//       >
//         <div className="space-y-6">
//           <OtpBoxes onComplete={handleOtpComplete} hasError={hasError} disabled={isPending} />

//           {error && (
//             <p className="text-center text-[13px] text-[#F87171]" role="alert">{error}</p>
//           )}

//           <Button type="button" variant="primary" size="lg" fullWidth isLoading={isPending} disabled={isPending}>
//             {isPending ? 'Verifying…' : 'Enable MFA'}
//           </Button>

//           <button
//             type="button"
//             onClick={() => setStep('scan')}
//             className="w-full text-center text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors"
//           >
//             ← Back
//           </button>
//         </div>

//         <p className={cn('mt-7 pt-5 border-t border-white/[0.06]', 'text-[11px] text-[#5A6A8A] text-center')}>
//           🛠 Mock mode — any valid 6-digit number works
//         </p>
//       </AuthShell>
//     )
//   }

//   // ── SCAN step (default) ──────────────────────────────────────────
//   return (
//     <AuthShell
//       eyebrow="Recommended — Step 1 of 2"
//       title="Secure your account"
//       subtitle="Add two-factor authentication to protect against unauthorised access."
//     >
//       <div className="space-y-5">
//         {/* Why MFA banner */}
//         <div className="flex gap-3 p-3.5 rounded-[10px] bg-[rgba(19,91,236,0.06)] border border-[rgba(19,91,236,0.15)]">
//           <span className="text-[18px] shrink-0">🛡️</span>
//           <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
//             Accounts with MFA are <strong className="text-[#E8F0FF]">99% less likely</strong> to be compromised. Takes 30 seconds to set up.
//           </p>
//         </div>

//         {/* Secret */}
//         {loadingSetup ? (
//           <div className="h-20 rounded-[12px] bg-[#141C30] border border-white/[0.08] animate-pulse" />
//         ) : (
//           <div className="rounded-[12px] bg-[#141C30] border border-white/[0.08] p-4 space-y-3">
//             <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5A6A8A]">
//               1. Open your authenticator app
//             </p>
//             <p className="text-[12px] text-[#A8B8D8]">
//               Google Authenticator, Authy, or 1Password — then add a new account manually.
//             </p>

//             <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5A6A8A] pt-1">
//               2. Enter this secret key
//             </p>
//             <div className="flex items-center gap-2">
//               <code className="flex-1 font-mono text-[14px] text-[#135BEC] bg-[#0A0E1A] rounded-[8px] px-3 py-2 tracking-widest break-all">
//                 {secret}
//               </code>
//               <button
//                 type="button"
//                 onClick={() => navigator.clipboard.writeText(secret)}
//                 className="shrink-0 text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors p-1"
//                 aria-label="Copy secret"
//               >
//                 <CopyIcon />
//               </button>
//             </div>
//             <p className="text-[11px] text-[#5A6A8A]">
//               Select TOTP / Time-based when prompted.
//             </p>
//           </div>
//         )}

//         <Button
//           type="button"
//           variant="primary"
//           size="lg"
//           fullWidth
//           onClick={() => setStep('verify')}
//           disabled={loadingSetup}
//         >
//           I've added it — continue →
//         </Button>

//         {/* Skip — keeps showing until they enable */}
//         <button
//           type="button"
//           onClick={handleDone}
//           className="w-full text-center text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors py-1"
//         >
//           Skip for now (you'll be asked again next login)
//         </button>
//       </div>
//     </AuthShell>
//   )
// }

// function CopyIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
//       <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
//     </svg>
//   )
// }

'use client'

import { Suspense } from 'react'
import MfaSetupContent from './MfaSetupContent'

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MfaSetupContent />
    </Suspense>
  )
}
