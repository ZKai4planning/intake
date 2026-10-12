// 'use client'

// import { useState, useTransition } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import type { Metadata } from 'next'

// import { AuthShell }  from '@/components/auth/AuthShell'
// import { AuthInput }  from '@/components/auth/AuthInput'
// import { Button }     from '@/components/ui/Button'
// import { sendOtp }    from '@/lib/api'
// import { cn }         from '@/lib/cn'

// /**
//  * /login
//  * ───────
//  * Step 1: User enters email → POST /api/auth/send-otp { intent: 'login' }
//  * Step 2: Redirect to /verify-email?email=...&intent=login
//  *
//  * No password — email OTP only (passwordless login).
//  * If you later add password login, add a password field and wire to /auth/login-password.
//  */

// function isValidEmail(email: string) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
// }

// export default function LoginPage() {
//   const router       = useRouter()
//   const searchParams = useSearchParams()
//   const returnTo     = searchParams.get('returnTo') ?? '/dashboard'

//   const [email,     setEmail]     = useState('')
//   const [error,     setError]     = useState('')
//   const [isPending, startTransition] = useTransition()

//   const emailState = error ? 'error' : email && isValidEmail(email) ? 'valid' : 'idle'

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()

//     if (!isValidEmail(email)) {
//       setError('Please enter a valid email address.')
//       return
//     }
//     setError('')

//     startTransition(async () => {
//       const { data, error: apiError } = await sendOtp({ email: email.trim(), intent: 'login' })

//       if (apiError || !data?.success) {
//         setError(apiError ?? 'Something went wrong. Please try again.')
//         return
//       }

//       // Navigate to OTP verification, carrying context
//       const params = new URLSearchParams({
//         email:    email.trim(),
//         intent:   'login',
//         returnTo,
//       })
//       router.push(`/verify-email?${params.toString()}`)
//     })
//   }

//   return (
//     <AuthShell
//       title="Welcome back"
//       subtitle="Enter your email and we'll send you a sign-in code."
//       footerText="Don't have an account?"
//       footerLink={{ label: 'Sign up free', href: '/signup' }}
//     >
//       <form onSubmit={handleSubmit} noValidate className="space-y-5">

//         {/* Email */}
//         <AuthInput
//           label="Email address"
//           type="email"
//           autoComplete="email"
//           placeholder="you@example.com"
//           value={email}
//           onChange={e => { setEmail(e.target.value); setError('') }}
//           fieldState={emailState}
//           message={error}
//           autoFocus
//           disabled={isPending}
//         />

//         {/* Submit */}
//         <Button
//           type="submit"
//           variant="primary"
//           size="lg"
//           fullWidth
//           isLoading={isPending}
//           disabled={!email || isPending}
//         >
//           {isPending ? 'Sending code…' : 'Send sign-in code →'}
//         </Button>

//         {/* Forgot / reset */}
//         <p className="text-center text-[12px] text-[#5A6A8A]">
//           <Link
//             href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
//             className="hover:text-[#A8B8D8] transition-colors"
//           >
//             Forgot your password?
//           </Link>
//         </p>
//       </form>

//       {/* Trust note */}
//       <p className={cn(
//         'mt-7 pt-5 border-t border-white/[0.06]',
//         'text-[11px] text-[#5A6A8A] text-center leading-relaxed'
//       )}>
//         🔒 We'll send a 6-digit code to your inbox. No password needed.
//       </p>
//     </AuthShell>
//   )
// }

'use client'

import { Suspense } from 'react'
import LoginContent from './LoginContent'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}