'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { agentLogin } from '@/lib/agentxApi'

export default function AgentxLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setError('')

    startTransition(async () => {
      const { data, error: apiError } = await agentLogin(email.trim(), password)
      if (apiError || !data?.success) {
        setError(apiError ?? 'Login failed.')
        return
      }
      router.push(data.agent.mustResetPassword ? '/agentx/reset-password' : '/agentx/users')
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <p className="text-[13px] font-semibold tracking-wide text-[#5A6A8A] uppercase">AI4Planning</p>
          <h1 className="font-display text-[26px] text-[#E8F0FF] mt-1">Agent portal</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-6 space-y-4">
          <div>
            <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Email</label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isPending}
              className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
              placeholder="agent@ai4planning.com"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isPending}
                className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 pr-10 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                disabled={isPending}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-[13px] text-[#F87171]" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={!email || !password || isPending}
            className="w-full py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[14px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-[#3A4560]">
          Separate from both the customer login and the admin portal — scoped to users and projects only.
        </p>
      </div>
    </div>
  )
}
