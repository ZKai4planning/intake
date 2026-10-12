// 'use client'

// import { useState, useTransition, useMemo } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { AuthShell } from '@/components/auth/AuthShell'
// import { OtpBoxes } from '@/components/auth/OtpBoxes'
// import { Button } from '@/components/ui/Button'
// import { useCountdown } from '@/hooks/useCountdown'
// import { updateMe } from '@/lib/api'
// import { cn } from '@/lib/cn'

// /**
//  * /add-phone
//  * ───────────
//  * Shown after login (once, or until completed) to collect and verify
//  * a UK phone number — mirrors the mfa-setup step-flow pattern.
//  *
//  * Flow:
//  *   1. 'phone'  → enter UK mobile number (fixed +44 prefix), request OTP
//  *   2. 'verify' → enter 6-digit SMS code (resend after cooldown)
//  *   3. 'done'   → confirmation, continue to returnTo
//  *
//  * UK only: this product currently serves UK users, so instead of a
//  * country dropdown the +44 flag/prefix is fixed — one less decision,
//  * one less way to mistype a country code.
//  *
//  * Spam / fake-number guarding (client-side, first line of defence —
//  * see notes above requestPhoneOtp for what MUST also happen server-side):
//  *   - format check: real UK mobile shape only (07xxx / +447xxx, second
//  *     digit 1–9 — excludes the "070" Personal Numbering range, which
//  *     isn't a mobile handset and is a common vector for call-forwarding
//  *     scams)
//  *   - obvious placeholder/test patterns rejected (all-same-digit,
//  *     sequential digits, repeating short blocks like 07070707070)
//  *   - per-number send throttling (max 3 codes / 10 min) so the same
//  *     number can't be used to spam an SMS bomb
//  *
//  * Mobile notes:
//  *   - Input font-size is 16px by default (only shrinking to 14px at
//  *     `sm:`) because iOS Safari auto-zooms the viewport on focus for
//  *     any input with a computed font-size under 16px — a classic
//  *     "works on desktop, janky on phone" bug.
//  *   - Small text-buttons (Change number / Resend code) get extra
//  *     invisible hit-area padding (`-mx-2 px-2 py-2`) so they meet a
//  *     reasonable touch-target size without changing their visual size.
//  *   - The phone-input row and the change/resend row both get
//  *     `flex-wrap` + `min-w-0` so nothing overflows or gets clipped on
//  *     very narrow (~320px) screens.
//  */

// // ── Fixed UK dial code ──────────────────────────────────────────
// const UK = { dial: '+44', flag: '🇬🇧' } as const

// // ── Spam / fake-number heuristics ───────────────────────────────
// // Client-side checks are a UX nicety (fail fast, don't waste an SMS).
// // They are NOT the security boundary — the backend must still run a
// // carrier lookup (e.g. Twilio Lookup / MessageBird) to reject VOIP,
// // landline, and disconnected numbers, plus real rate limiting keyed
// // off IP + account + number, before ever sending an SMS.
// function isValidUkMobileShape(local10: string) {
//   // 10 digits, no leading 0, must start 71–79 (excludes 070 personal
//   // numbering and any non-mobile range)
//   return /^7[1-9]\d{8}$/.test(local10)
// }

// function looksLikeSpamNumber(local10: string) {
//   if (/^(\d)\1{9}$/.test(local10)) return true // all same digit
//   const asc = '01234567891'
//   const desc = '98765432109'
//   if (asc.includes(local10) || desc.includes(local10)) return true // sequential
//   if (/^(\d{2,4})\1+\d*$/.test(local10) && local10.length === 10) return true // repeating block, e.g. 7070707070
//   return false
// }

// // ── Mock API (self-contained — swap for real calls to lib/api.ts) ──
// const takenNumbers = new Set(['+447911123456']) // pretend this is already linked to another account
// const sendAttempts = new Map<string, number[]>() // number -> send timestamps (mock rate limit)
// const DEMO_OTP = '123456'
// const MAX_SENDS = 3
// const WINDOW_MS = 10 * 60 * 1000

// async function requestPhoneOtp(fullPhone: string) {
//   await new Promise(r => setTimeout(r, 600))

//   const now = Date.now()
//   const attempts = (sendAttempts.get(fullPhone) ?? []).filter(t => now - t < WINDOW_MS)
//   if (attempts.length >= MAX_SENDS) {
//     return { data: null, error: 'Too many codes sent to this number. Try again in a few minutes.' }
//   }

//   if (takenNumbers.has(fullPhone)) {
//     return { data: null, error: 'This phone number is already linked to another account.' }
//   }

//   sendAttempts.set(fullPhone, [...attempts, now])
//   console.log(`[mock] SMS code sent to ${fullPhone} — use code: ${DEMO_OTP}`)
//   return { data: { success: true, expiresIn: 300 }, error: null }
// }

// async function verifyPhoneOtp(fullPhone: string, code: string) {
//   await new Promise(r => setTimeout(r, 500))
//   if (code !== DEMO_OTP) {
//     return { data: null, error: 'Invalid code. Try again.' }
//   }
//   takenNumbers.add(fullPhone)
//   return { data: { success: true, phone: fullPhone }, error: null }
// }

// // ── Component ────────────────────────────────────────────────────
// export default function AddPhoneContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'

//   const [step, setStep] = useState<'phone' | 'verify' | 'done'>('phone')
//   const [phone, setPhone] = useState('')
//   const [error, setError] = useState('')
//   const [hasError, setHasError] = useState(false)
//   const [isPending, startTransition] = useTransition()
//   const { formatted, canResend, start } = useCountdown(60)

//   // Normalise whatever the user typed (07911 123456, +447911123456,
//   // 7911123456...) down to the 10-digit local form: 7911123456
//   const local10 = useMemo(() => {
//     let d = phone.replace(/\D/g, '')
//     if (d.startsWith('44')) d = d.slice(2)
//     if (d.startsWith('0')) d = d.slice(1)
//     return d
//   }, [phone])

//   const fullPhone = `${UK.dial}${local10}`
//   const isValidShape = isValidUkMobileShape(local10)
//   const isSpammy = isValidShape && looksLikeSpamNumber(local10)
//   const canSubmit = isValidShape && !isSpammy

//   const savedPhoneDisplay = useMemo(() => {
//     // Display as +44 7911 123456
//     if (local10.length !== 10) return `${UK.dial} ${phone}`
//     return `${UK.dial} ${local10.slice(0, 4)} ${local10.slice(4)}`
//   }, [local10, phone])

//   function validationMessage(): string | null {
//     if (!phone) return null
//     if (isSpammy) return "That doesn't look like a real mobile number."
//     if (!isValidShape) return 'Enter a valid UK mobile number, e.g. 07911 123456.'
//     return null
//   }

//   function handleSendCode() {
//     if (isPending || !canSubmit) return
//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { error: apiError } = await requestPhoneOtp(fullPhone)
//       if (apiError) {
//         setError(apiError)
//         setHasError(true)
//         return
//       }
//       start(60)
//       setStep('verify')
//     })
//   }

//   function handleResend() {
//     if (!canResend || isPending) return
//     startTransition(async () => {
//       const { error: apiError } = await requestPhoneOtp(fullPhone)
//       if (apiError) {
//         setError(apiError)
//         setHasError(true)
//         return
//       }
//       start(60)
//     })
//   }

//   function handleOtpComplete(code: string) {
//     if (isPending) return
//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { data, error: apiError } = await verifyPhoneOtp(fullPhone, code)
//       if (apiError || !data) {
//         setError(apiError ?? 'Invalid code. Try again.')
//         setHasError(true)
//         return
//       }
//       setStep('done')
//     })
//   }

//   function handleDone() {
//     if (isPending) return

//     startTransition(async () => {
//       // The OTP send/verify above is still mocked (no SMS provider
//       // wired in yet), but this final save is real — the number
//       // actually gets persisted to the account now via PATCH /api/auth/me,
//       // not just cached in this browser's localStorage.
//       const { error } = await updateMe({ phone: fullPhone })
//       if (error) {
//         // Non-blocking, and this screen has no error state to show it
//         // in anyway — the number is already "verified" from the
//         // user's perspective. Worst case the profile page re-prompts
//         // for it next time since the server-side value didn't stick.
//         console.warn('[add-phone] Failed to persist phone number:', error)
//       }

//       if (typeof window !== 'undefined') {
//         const raw = localStorage.getItem('auth_session')
//         if (raw) {
//           try {
//             const session = JSON.parse(raw)
//             session.phone = fullPhone
//             localStorage.setItem('auth_session', JSON.stringify(session))
//           } catch {
//             // ignore malformed session — nothing to patch
//           }
//         }
//       }

//       router.push(returnTo)
//     })
//   }

//   function handleSkip() {
//     router.push(returnTo)
//   }

//   // ── DONE ───────────────────────────────────────────────────────
//   if (step === 'done') {
//     return (
//       <AuthShell
//         title="Phone number verified 🎉"
//         subtitle="Your account now has a unique, verified phone number attached to it."
//       >
//         <div className="space-y-5">
//           <div className="rounded-[12px] bg-[#141C30] border border-white/[0.08] p-4 flex items-center gap-3">
//             <span className="text-[18px] shrink-0">📱</span>
//             <p className="text-[13px] text-[#A8B8D8] break-words">{savedPhoneDisplay}</p>
//           </div>

//           <Button type="button" variant="primary" size="lg" fullWidth onClick={handleDone} isLoading={isPending} disabled={isPending}>
//             {isPending ? 'Saving…' : 'Continue to dashboard →'}
//           </Button>
//         </div>
//       </AuthShell>
//     )
//   }

//   // ── VERIFY ─────────────────────────────────────────────────────
//   if (step === 'verify') {
//     return (
//       <AuthShell
//         eyebrow="Step 2 of 2"
//         title="Enter the code we texted you"
//         subtitle={`We sent a 6-digit code to ${savedPhoneDisplay}.`}
//       >
//         <div className="space-y-6">
//           <div className="w-full overflow-x-auto">
//             <OtpBoxes onComplete={handleOtpComplete} hasError={hasError} disabled={isPending} />
//           </div>

//           {error && (
//             <p className="text-center text-[13px] text-[#F87171]" role="alert">
//               {error}
//             </p>
//           )}

//           <Button
//             type="button"
//             variant="primary"
//             size="lg"
//             fullWidth
//             isLoading={isPending}
//             disabled={isPending}
//           >
//             {isPending ? 'Verifying…' : 'Verify phone number'}
//           </Button>

//           <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[12px]">
//             <button
//               type="button"
//               onClick={() => setStep('phone')}
//               className="-mx-2 px-2 py-2 text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors"
//             >
//               ← Change number
//             </button>

//             <button
//               type="button"
//               onClick={handleResend}
//               disabled={!canResend || isPending}
//               className={cn(
//                 '-mx-2 px-2 py-2 transition-colors',
//                 canResend
//                   ? 'text-[#135BEC] hover:text-[#2A6BF0]'
//                   : 'text-[#5A6A8A] cursor-not-allowed'
//               )}
//             >
//               {canResend ? 'Resend code' : `Resend in ${formatted}`}
//             </button>
//           </div>
//         </div>

//         <p
//           className={cn(
//             'mt-7 pt-5 border-t border-white/[0.06]',
//             'text-[11px] text-[#5A6A8A] text-center'
//           )}
//         >
//           🛠 Mock mode — use code {DEMO_OTP}
//         </p>
//       </AuthShell>
//     )
//   }

//   // ── PHONE (default) ───────────────────────────────────────────
//   const message = validationMessage()

//   return (
//     <AuthShell
//       eyebrow="Step 1 of 2"
//       title="Add your phone number"
//       subtitle="This keeps your account unique and secure, and makes it easy to verify it's really you."
//     >
//       <div className="space-y-5">
//         <div className="flex gap-3 p-3.5 rounded-[10px] bg-[rgba(19,91,236,0.06)] border border-[rgba(19,91,236,0.15)]">
//           <span className="text-[18px] shrink-0">📱</span>
//           <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
//             Each phone number can only be linked to{' '}
//             <strong className="text-[#E8F0FF]">one account</strong>. We'll text
//             you a code to confirm it's yours.
//           </p>
//         </div>

//         <div className="flex flex-col gap-1.5">
//           <label
//             htmlFor="phone-number"
//             className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#5A6A8A]"
//           >
//             Mobile number
//           </label>

//           <div className="flex flex-wrap gap-2">
//             {/* Fixed UK prefix — no dropdown */}
//             <div
//               className={cn(
//                 'h-[46px] shrink-0 flex items-center gap-1.5 rounded-[10px] px-3',
//                 'bg-[#141C30] text-[#E8F0FF] text-[14px] font-sans',
//                 'border border-white/[0.12]'
//               )}
//               aria-hidden="true"
//             >
//               <span>{UK.flag}</span>
//               <span>{UK.dial}</span>
//             </div>

//             {/* Number input.
//                 Font-size starts at 16px (text-base) and only drops to
//                 14px at `sm:` — under 16px, iOS Safari auto-zooms the
//                 page on focus, which is jarring on a form like this. */}
//             <input
//               id="phone-number"
//               type="tel"
//               inputMode="numeric"
//               autoComplete="tel-national"
//               placeholder="7911 123456"
//               value={phone}
//               onChange={e => setPhone(e.target.value.replace(/[^\d\s()-]/g, ''))}
//               className={cn(
//                 'flex-1 min-w-[160px] rounded-[10px] px-4 py-3',
//                 'bg-[#141C30] text-[#E8F0FF] text-base sm:text-[14px] font-sans',
//                 'placeholder:text-[#5A6A8A]',
//                 'border outline-none transition-all duration-150',
//                 message
//                   ? 'border-[rgba(248,113,113,0.6)] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
//                   : 'border-white/[0.12] focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]'
//               )}
//             />
//           </div>

//           {message && (
//             <p className="text-[12px] leading-snug text-[#F87171]" role="alert">
//               {message}
//             </p>
//           )}

//           {error && (
//             <p className="text-[12px] leading-snug text-[#F87171]" role="alert">
//               {error}
//             </p>
//           )}
//         </div>

//         <Button
//           type="button"
//           variant="primary"
//           size="lg"
//           fullWidth
//           isLoading={isPending}
//           disabled={isPending || !canSubmit}
//           onClick={handleSendCode}
//         >
//           {isPending ? 'Sending code…' : 'Send verification code →'}
//         </Button>

//         <button
//           type="button"
//           onClick={handleSkip}
//           className="w-full text-center text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors py-2"
//         >
//           Skip for now (you'll be asked again next login)
//         </button>
//       </div>
//     </AuthShell>
//   )
// }

'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { OtpBoxes } from '@/components/auth/OtpBoxes'
import { Button } from '@/components/ui/Button'
import { useCountdown } from '@/hooks/useCountdown'
import { notifySessionUpdated } from '@/hooks/Useworkspace'
import { updateMe } from '@/lib/api'
import { cn } from '@/lib/cn'

/**
 * /add-phone
 * ───────────
 * Shown after login (once, or until completed) to collect and verify
 * a UK phone number — mirrors the mfa-setup step-flow pattern.
 *
 * Flow:
 *   1. 'phone'  → enter UK mobile number (fixed +44 prefix), request OTP
 *   2. 'verify' → enter 6-digit SMS code (resend after cooldown)
 *   3. 'done'   → confirmation, continue to returnTo
 *
 * UK only: this product currently serves UK users, so instead of a
 * country dropdown the +44 flag/prefix is fixed — one less decision,
 * one less way to mistype a country code.
 *
 * Spam / fake-number guarding (client-side, first line of defence —
 * see notes above requestPhoneOtp for what MUST also happen server-side):
 *   - format check: real UK mobile shape only (07xxx / +447xxx, second
 *     digit 1–9 — excludes the "070" Personal Numbering range, which
 *     isn't a mobile handset and is a common vector for call-forwarding
 *     scams)
 *   - obvious placeholder/test patterns rejected (all-same-digit,
 *     sequential digits, repeating short blocks like 07070707070)
 *   - per-number send throttling (max 3 codes / 10 min) so the same
 *     number can't be used to spam an SMS bomb
 *
 * Mobile notes:
 *   - Input font-size is 16px by default (only shrinking to 14px at
 *     `sm:`) because iOS Safari auto-zooms the viewport on focus for
 *     any input with a computed font-size under 16px — a classic
 *     "works on desktop, janky on phone" bug.
 *   - Small text-buttons (Change number / Resend code) get extra
 *     invisible hit-area padding (`-mx-2 px-2 py-2`) so they meet a
 *     reasonable touch-target size without changing their visual size.
 *   - The phone-input row and the change/resend row both get
 *     `flex-wrap` + `min-w-0` so nothing overflows or gets clipped on
 *     very narrow (~320px) screens.
 */

// ── Fixed UK dial code ──────────────────────────────────────────
const UK = { dial: '+44', flag: '🇬🇧' } as const

// ── Spam / fake-number heuristics ───────────────────────────────
// Client-side checks are a UX nicety (fail fast, don't waste an SMS).
// They are NOT the security boundary — the backend must still run a
// carrier lookup (e.g. Twilio Lookup / MessageBird) to reject VOIP,
// landline, and disconnected numbers, plus real rate limiting keyed
// off IP + account + number, before ever sending an SMS.
function isValidUkMobileShape(local10: string) {
  // 10 digits, no leading 0, must start 71–79 (excludes 070 personal
  // numbering and any non-mobile range)
  return /^7[1-9]\d{8}$/.test(local10)
}

function looksLikeSpamNumber(local10: string) {
  if (/^(\d)\1{9}$/.test(local10)) return true // all same digit
  const asc = '01234567891'
  const desc = '98765432109'
  if (asc.includes(local10) || desc.includes(local10)) return true // sequential
  if (/^(\d{2,4})\1+\d*$/.test(local10) && local10.length === 10) return true // repeating block, e.g. 7070707070
  return false
}

// ── Mock API (self-contained — swap for real calls to lib/api.ts) ──
const takenNumbers = new Set(['+447911123456']) // pretend this is already linked to another account
const sendAttempts = new Map<string, number[]>() // number -> send timestamps (mock rate limit)
const DEMO_OTP = '123456'
const MAX_SENDS = 3
const WINDOW_MS = 10 * 60 * 1000

async function requestPhoneOtp(fullPhone: string) {
  await new Promise(r => setTimeout(r, 600))

  const now = Date.now()
  const attempts = (sendAttempts.get(fullPhone) ?? []).filter(t => now - t < WINDOW_MS)
  if (attempts.length >= MAX_SENDS) {
    return { data: null, error: 'Too many codes sent to this number. Try again in a few minutes.' }
  }

  if (takenNumbers.has(fullPhone)) {
    return { data: null, error: 'This phone number is already linked to another account.' }
  }

  sendAttempts.set(fullPhone, [...attempts, now])
  console.log(`[mock] SMS code sent to ${fullPhone} — use code: ${DEMO_OTP}`)
  return { data: { success: true, expiresIn: 300 }, error: null }
}

async function verifyPhoneOtp(fullPhone: string, code: string) {
  await new Promise(r => setTimeout(r, 500))
  if (code !== DEMO_OTP) {
    return { data: null, error: 'Invalid code. Try again.' }
  }
  takenNumbers.add(fullPhone)
  return { data: { success: true, phone: fullPhone }, error: null }
}

// ── Component ────────────────────────────────────────────────────
export default function AddPhoneContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/dashboard'

  const [step, setStep] = useState<'phone' | 'verify' | 'done'>('phone')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { formatted, canResend, start } = useCountdown(60)

  // Normalise whatever the user typed (07911 123456, +447911123456,
  // 7911123456...) down to the 10-digit local form: 7911123456
  const local10 = useMemo(() => {
    let d = phone.replace(/\D/g, '')
    if (d.startsWith('44')) d = d.slice(2)
    if (d.startsWith('0')) d = d.slice(1)
    return d
  }, [phone])

  const fullPhone = `${UK.dial}${local10}`
  const isValidShape = isValidUkMobileShape(local10)
  const isSpammy = isValidShape && looksLikeSpamNumber(local10)
  const canSubmit = isValidShape && !isSpammy

  const savedPhoneDisplay = useMemo(() => {
    // Display as +44 7911 123456
    if (local10.length !== 10) return `${UK.dial} ${phone}`
    return `${UK.dial} ${local10.slice(0, 4)} ${local10.slice(4)}`
  }, [local10, phone])

  function validationMessage(): string | null {
    if (!phone) return null
    if (isSpammy) return "That doesn't look like a real mobile number."
    if (!isValidShape) return 'Enter a valid UK mobile number, e.g. 07911 123456.'
    return null
  }

  function handleSendCode() {
    if (isPending || !canSubmit) return
    setError('')
    setHasError(false)

    startTransition(async () => {
      const { error: apiError } = await requestPhoneOtp(fullPhone)
      if (apiError) {
        setError(apiError)
        setHasError(true)
        return
      }
      start(60)
      setStep('verify')
    })
  }

  function handleResend() {
    if (!canResend || isPending) return
    startTransition(async () => {
      const { error: apiError } = await requestPhoneOtp(fullPhone)
      if (apiError) {
        setError(apiError)
        setHasError(true)
        return
      }
      start(60)
    })
  }

  function handleOtpComplete(code: string) {
    if (isPending) return
    setError('')
    setHasError(false)

    startTransition(async () => {
      const { data, error: apiError } = await verifyPhoneOtp(fullPhone, code)
      if (apiError || !data) {
        setError(apiError ?? 'Invalid code. Try again.')
        setHasError(true)
        return
      }
      setStep('done')
    })
  }

  function handleDone() {
    if (isPending) return

    startTransition(async () => {
      // The OTP send/verify above is still mocked (no SMS provider
      // wired in yet), but this final save is real — the number
      // actually gets persisted to the account now via PATCH /api/auth/me,
      // not just cached in this browser's localStorage.
      const { error } = await updateMe({ phone: fullPhone })
      if (error) {
        // Non-blocking, and this screen has no error state to show it
        // in anyway — the number is already "verified" from the
        // user's perspective. Worst case the profile page re-prompts
        // for it next time since the server-side value didn't stick.
        console.warn('[add-phone] Failed to persist phone number:', error)
      }

      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('auth_session')
        if (raw) {
          try {
            const session = JSON.parse(raw)
            session.phone = fullPhone
            localStorage.setItem('auth_session', JSON.stringify(session))
            notifySessionUpdated()
          } catch {
            // ignore malformed session — nothing to patch
          }
        }
      }

      router.push(returnTo)
    })
  }

  function handleSkip() {
    router.push(returnTo)
  }

  // ── DONE ───────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <AuthShell
        title="Phone number verified 🎉"
        subtitle="Your account now has a unique, verified phone number attached to it."
      >
        <div className="space-y-5">
          <div className="rounded-[12px] bg-[#141C30] border border-white/[0.08] p-4 flex items-center gap-3">
            <span className="text-[18px] shrink-0">📱</span>
            <p className="text-[13px] text-[#A8B8D8] break-words">{savedPhoneDisplay}</p>
          </div>

          <Button type="button" variant="primary" size="lg" fullWidth onClick={handleDone} isLoading={isPending} disabled={isPending}>
            {isPending ? 'Saving…' : 'Continue to dashboard →'}
          </Button>
        </div>
      </AuthShell>
    )
  }

  // ── VERIFY ─────────────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <AuthShell
        eyebrow="Step 2 of 2"
        title="Enter the code we texted you"
        subtitle={`We sent a 6-digit code to ${savedPhoneDisplay}.`}
      >
        <div className="space-y-6">
          <div className="w-full overflow-x-auto">
            <OtpBoxes onComplete={handleOtpComplete} hasError={hasError} disabled={isPending} />
          </div>

          {error && (
            <p className="text-center text-[13px] text-[#F87171]" role="alert">
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
            {isPending ? 'Verifying…' : 'Verify phone number'}
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[12px]">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="-mx-2 px-2 py-2 text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors"
            >
              ← Change number
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isPending}
              className={cn(
                '-mx-2 px-2 py-2 transition-colors',
                canResend
                  ? 'text-[#135BEC] hover:text-[#2A6BF0]'
                  : 'text-[#5A6A8A] cursor-not-allowed'
              )}
            >
              {canResend ? 'Resend code' : `Resend in ${formatted}`}
            </button>
          </div>
        </div>

        <p
          className={cn(
            'mt-7 pt-5 border-t border-white/[0.06]',
            'text-[11px] text-[#5A6A8A] text-center'
          )}
        >
          🛠 Mock mode — use code {DEMO_OTP}
        </p>
      </AuthShell>
    )
  }

  // ── PHONE (default) ───────────────────────────────────────────
  const message = validationMessage()

  return (
    <AuthShell
      eyebrow="Step 1 of 2"
      title="Add your phone number"
      subtitle="This keeps your account unique and secure, and makes it easy to verify it's really you."
    >
      <div className="space-y-5">
        <div className="flex gap-3 p-3.5 rounded-[10px] bg-[rgba(19,91,236,0.06)] border border-[rgba(19,91,236,0.15)]">
          <span className="text-[18px] shrink-0">📱</span>
          <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
            Each phone number can only be linked to{' '}
            <strong className="text-[#E8F0FF]">one account</strong>. We'll text
            you a code to confirm it's yours.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="phone-number"
            className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#5A6A8A]"
          >
            Mobile number
          </label>

          <div className="flex flex-wrap gap-2">
            {/* Fixed UK prefix — no dropdown */}
            <div
              className={cn(
                'h-[46px] shrink-0 flex items-center gap-1.5 rounded-[10px] px-3',
                'bg-[#141C30] text-[#E8F0FF] text-[14px] font-sans',
                'border border-white/[0.12]'
              )}
              aria-hidden="true"
            >
              <span>{UK.flag}</span>
              <span>{UK.dial}</span>
            </div>

            {/* Number input.
                Font-size starts at 16px (text-base) and only drops to
                14px at `sm:` — under 16px, iOS Safari auto-zooms the
                page on focus, which is jarring on a form like this. */}
            <input
              id="phone-number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="7911 123456"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d\s()-]/g, ''))}
              className={cn(
                'flex-1 min-w-[160px] rounded-[10px] px-4 py-3',
                'bg-[#141C30] text-[#E8F0FF] text-base sm:text-[14px] font-sans',
                'placeholder:text-[#5A6A8A]',
                'border outline-none transition-all duration-150',
                message
                  ? 'border-[rgba(248,113,113,0.6)] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
                  : 'border-white/[0.12] focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]'
              )}
            />
          </div>

          {message && (
            <p className="text-[12px] leading-snug text-[#F87171]" role="alert">
              {message}
            </p>
          )}

          {error && (
            <p className="text-[12px] leading-snug text-[#F87171]" role="alert">
              {error}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isPending}
          disabled={isPending || !canSubmit}
          onClick={handleSendCode}
        >
          {isPending ? 'Sending code…' : 'Send verification code →'}
        </Button>

        <button
          type="button"
          onClick={handleSkip}
          className="w-full text-center text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors py-2"
        >
          Skip for now (you'll be asked again next login)
        </button>
      </div>
    </AuthShell>
  )
}