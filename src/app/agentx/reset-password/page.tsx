'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { getAgentMe, changeAgentPassword } from '@/lib/agentxApi'

export default function AgentxResetPasswordPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Not wrapped in AgentxShell/(protected) on purpose — an agent who still
  // must reset their password needs to reach this page without being
  // bounced right back here in a loop. It does its own auth + state check.
  useEffect(() => {
    let cancelled = false
    getAgentMe().then(({ data, error: apiError }) => {
      if (cancelled) return
      if (apiError || !data) {
        router.replace('/agentx/login')
        return
      }
      if (!data.agent.mustResetPassword) {
        router.replace('/agentx/users')
        return
      }
      setChecked(true)
    })
    return () => { cancelled = true }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    changeAgentPassword(currentPassword, newPassword).then(({ data, error: apiError }) => {
      setIsSubmitting(false)
      if (apiError || !data?.success) {
        setError(apiError ?? 'Failed to set new password.')
        return
      }
      router.push('/agentx/users')
    })
  }

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-[#135BEC] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <p className="text-[13px] font-semibold tracking-wide text-[#5A6A8A] uppercase">AI4Planning</p>
          <h1 className="font-display text-[26px] text-[#E8F0FF] mt-1">Set your password</h1>
          <p className="text-[13px] text-[#5A6A8A] mt-2">
            You're signing in with a temporary password. Choose your own to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-6 space-y-4">
          <div>
            <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Temporary password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 pr-10 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
                placeholder="From your invite email"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(v => !v)}
                disabled={isSubmitting}
                aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors disabled:opacity-50"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">New password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Confirm new password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
              placeholder="Repeat new password"
            />
          </div>

          {error && <p className="text-[13px] text-[#F87171]" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={!currentPassword || !newPassword || !confirmPassword || isSubmitting}
            className="w-full py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[14px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Set password and continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
