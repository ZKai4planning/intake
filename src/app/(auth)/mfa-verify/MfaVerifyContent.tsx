// 'use client'

// import { useState, useTransition } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { AuthShell } from '@/components/auth/AuthShell'
// import { OtpBoxes } from '@/components/auth/OtpBoxes'
// import { Button } from '@/components/ui/Button'
// import { verifyMfaMock as verifyMfa } from '@/lib/mock'
// import { cn } from '@/lib/cn'

// export default function MfaVerifyContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const email = searchParams.get('email') ?? ''
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'

//   const [error, setError] = useState('')
//   const [hasError, setHasError] = useState(false)
//   const [isPending, startTransition] = useTransition()

//   function handleComplete(code: string) {
//     if (isPending) return

//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { data, error: apiError } = await verifyMfa({
//         email,
//         code,
//         enable: true,
//       })

//       if (apiError || !data) {
//         setError(apiError ?? 'Invalid code. Try again.')
//         setHasError(true)
//         return
//       }

//       router.push(returnTo)
//     })
//   }

//   const maskedEmail = email
//     ? email.replace(
//         /^(.)(.*)(@.+)$/,
//         (_, a, _b, c) => `${a}***${c}`
//       )
//     : ''

//   return (
//     <AuthShell
//       title="Two-factor authentication"
//       subtitle={
//         <>
//           Enter the 6-digit code from your authenticator app for{' '}
//           <span className="text-[#A8B8D8] font-medium">
//             {maskedEmail}
//           </span>
//         </>
//       }
//     >
//       <div className="space-y-6">
//         <div className="flex justify-center">
//           <span
//             className="text-[48px]"
//             aria-hidden="true"
//           >
//             🔐
//           </span>
//         </div>

//         <OtpBoxes
//           onComplete={handleComplete}
//           hasError={hasError}
//           disabled={isPending}
//         />

//         {error && (
//           <p
//             className="text-center text-[13px] text-[#F87171]"
//             role="alert"
//           >
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
//           {isPending ? 'Verifying…' : 'Verify'}
//         </Button>

//         <p className="text-center text-[12px] text-[#5A6A8A]">
//           Lost access to your app?{' '}
//           <button
//             type="button"
//             onClick={() => {
//               // TODO: backup code flow
//             }}
//             className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors"
//           >
//             Use a backup code
//           </button>
//         </p>
//       </div>

//       <p
//         className={cn(
//           'mt-7 pt-5 border-t border-white/[0.06]',
//           'text-[11px] text-[#5A6A8A] text-center'
//         )}
//       >
//         🛠 Mock mode — any valid 6-digit number works
//       </p>
//     </AuthShell>
//   )
// }

// 'use client'

// import { useState, useTransition } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { AuthShell } from '@/components/auth/AuthShell'
// import { OtpBoxes } from '@/components/auth/OtpBoxes'
// import { Button } from '@/components/ui/Button'
// import { verifyMfaMock as verifyMfa } from '@/lib/mock'
// import { cn } from '@/lib/cn'

// export default function MfaVerifyContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const email = searchParams.get('email') ?? ''
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'

//   const [error, setError] = useState('')
//   const [hasError, setHasError] = useState(false)
//   const [isPending, startTransition] = useTransition()

//   function handleComplete(code: string) {
//     if (isPending) return

//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { data, error: apiError } = await verifyMfa({
//         email,
//         code,
//         enable: true,
//       })

//       if (apiError || !data) {
//         setError(apiError ?? 'Invalid code. Try again.')
//         setHasError(true)
//         return
//       }

//       let hasPhone = false
//       if (typeof window !== 'undefined') {
//         const raw = localStorage.getItem('auth_session')
//         if (raw) {
//           try {
//             const session = JSON.parse(raw)
//             session.mfaEnabled = data.mfaEnabled
//             localStorage.setItem('auth_session', JSON.stringify(session))
//             hasPhone = !!session.phone
//           } catch {
//             hasPhone = false
//           }
//         }
//       }

//       if (!hasPhone) {
//         const params = new URLSearchParams({ returnTo })
//         router.push(`/add-phone?${params.toString()}`)
//         return
//       }

//       router.push(returnTo)
//     })
//   }

//   const maskedEmail = email
//     ? email.replace(
//         /^(.)(.*)(@.+)$/,
//         (_, a, _b, c) => `${a}***${c}`
//       )
//     : ''

//   return (
//     <AuthShell
//       title="Two-factor authentication"
//       subtitle={
//         <>
//           Enter the 6-digit code from your authenticator app for{' '}
//           <span className="text-[#A8B8D8] font-medium">
//             {maskedEmail}
//           </span>
//         </>
//       }
//     >
//       <div className="space-y-6">
//         <div className="flex justify-center">
//           <span
//             className="text-[48px]"
//             aria-hidden="true"
//           >
//             🔐
//           </span>
//         </div>

//         <OtpBoxes
//           onComplete={handleComplete}
//           hasError={hasError}
//           disabled={isPending}
//         />

//         {error && (
//           <p
//             className="text-center text-[13px] text-[#F87171]"
//             role="alert"
//           >
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
//           {isPending ? 'Verifying…' : 'Verify'}
//         </Button>

//         <p className="text-center text-[12px] text-[#5A6A8A]">
//           Lost access to your app?{' '}
//           <button
//             type="button"
//             onClick={() => {
//               // TODO: backup code flow
//             }}
//             className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors"
//           >
//             Use a backup code
//           </button>
//         </p>
//       </div>

//       <p
//         className={cn(
//           'mt-7 pt-5 border-t border-white/[0.06]',
//           'text-[11px] text-[#5A6A8A] text-center'
//         )}
//       >
//         🛠 Mock mode — any valid 6-digit number works
//       </p>
//     </AuthShell>
//   )
// }


// 'use client'

// import { useState, useTransition } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { AuthShell } from '@/components/auth/AuthShell'
// import { OtpBoxes } from '@/components/auth/OtpBoxes'
// import { Button } from '@/components/ui/Button'
// import { verifyMfaMock as verifyMfa } from '@/lib/mock'
// import { cn } from '@/lib/cn'

// export default function MfaVerifyContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const email = searchParams.get('email') ?? ''
//   const returnTo = searchParams.get('returnTo') ?? '/dashboard'

//   const [error, setError] = useState('')
//   const [hasError, setHasError] = useState(false)
//   const [isPending, startTransition] = useTransition()

//   function handleComplete(code: string) {
//     if (isPending) return

//     setError('')
//     setHasError(false)

//     startTransition(async () => {
//       const { data, error: apiError } = await verifyMfa({
//         email,
//         code,
//         enable: true,
//       })

//       if (apiError || !data) {
//         setError(apiError ?? 'Invalid code. Try again.')
//         setHasError(true)
//         return
//       }

//       router.push(returnTo)
//     })
//   }

//   const maskedEmail = email
//     ? email.replace(
//         /^(.)(.*)(@.+)$/,
//         (_, a, _b, c) => `${a}***${c}`
//       )
//     : ''

//   return (
//     <AuthShell
//       title="Two-factor authentication"
//       subtitle={
//         <>
//           Enter the 6-digit code from your authenticator app for{' '}
//           <span className="text-[#A8B8D8] font-medium">
//             {maskedEmail}
//           </span>
//         </>
//       }
//     >
//       <div className="space-y-6">
//         <div className="flex justify-center">
//           <span
//             className="text-[48px]"
//             aria-hidden="true"
//           >
//             🔐
//           </span>
//         </div>

//         <OtpBoxes
//           onComplete={handleComplete}
//           hasError={hasError}
//           disabled={isPending}
//         />

//         {error && (
//           <p
//             className="text-center text-[13px] text-[#F87171]"
//             role="alert"
//           >
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
//           {isPending ? 'Verifying…' : 'Verify'}
//         </Button>

//         <p className="text-center text-[12px] text-[#5A6A8A]">
//           Lost access to your app?{' '}
//           <button
//             type="button"
//             onClick={() => {
//               // TODO: backup code flow
//             }}
//             className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors"
//           >
//             Use a backup code
//           </button>
//         </p>
//       </div>

//       <p
//         className={cn(
//           'mt-7 pt-5 border-t border-white/[0.06]',
//           'text-[11px] text-[#5A6A8A] text-center'
//         )}
//       >
//         🛠 Mock mode — any valid 6-digit number works
//       </p>
//     </AuthShell>
//   )
// }

'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { OtpBoxes } from '@/components/auth/OtpBoxes'
import { Button } from '@/components/ui/Button'
import { notifySessionUpdated } from '@/hooks/Useworkspace'
import { verifyMfaMock as verifyMfa } from '@/lib/mock'
import { cn } from '@/lib/cn'

export default function MfaVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get('email') ?? ''
  const returnTo = searchParams.get('returnTo') ?? '/dashboard'

  const [error, setError] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleComplete(code: string) {
    if (isPending) return

    setError('')
    setHasError(false)

    startTransition(async () => {
      const { data, error: apiError } = await verifyMfa({
        email,
        code,
        enable: true,
      })

      if (apiError || !data) {
        setError(apiError ?? 'Invalid code. Try again.')
        setHasError(true)
        return
      }

      let hasPhone = false
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('auth_session')
        if (raw) {
          try {
            const session = JSON.parse(raw)
            session.mfaEnabled = data.mfaEnabled
            localStorage.setItem('auth_session', JSON.stringify(session))
            notifySessionUpdated()
            hasPhone = !!session.phone
          } catch {
            hasPhone = false
          }
        }
      }

      if (!hasPhone) {
        const params = new URLSearchParams({ returnTo })
        router.push(`/add-phone?${params.toString()}`)
        return
      }

      router.push(returnTo)
    })
  }

  const maskedEmail = email
    ? email.replace(
        /^(.)(.*)(@.+)$/,
        (_, a, _b, c) => `${a}***${c}`
      )
    : ''

  return (
    <AuthShell
      title="Two-factor authentication"
      subtitle={
        <>
          Enter the 6-digit code from your authenticator app for{' '}
          <span className="text-[#A8B8D8] font-medium">
            {maskedEmail}
          </span>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <span
            className="text-[48px]"
            aria-hidden="true"
          >
            🔐
          </span>
        </div>

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
          {isPending ? 'Verifying…' : 'Verify'}
        </Button>

        <p className="text-center text-[12px] text-[#5A6A8A]">
          Lost access to your app?{' '}
          <button
            type="button"
            onClick={() => {
              // TODO: backup code flow
            }}
            className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors"
          >
            Use a backup code
          </button>
        </p>
      </div>

      <p
        className={cn(
          'mt-7 pt-5 border-t border-white/[0.06]',
          'text-[11px] text-[#5A6A8A] text-center'
        )}
      >
        🛠 Mock mode — any valid 6-digit number works
      </p>
    </AuthShell>
  )
}