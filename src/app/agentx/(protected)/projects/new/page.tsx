'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { saveAgentDraft } from '@/lib/agentxApi'

const ACTORS = [
  { id: 'homeowner', label: 'Homeowner' },
  { id: 'landlord', label: 'Landlord' },
  { id: 'developer', label: 'Developer' },
  { id: 'consultant', label: 'Consultant' },
  { id: 'architect', label: 'Architect' },
  { id: 'business', label: 'Business' },
  { id: 'builder', label: 'Builder' },
]

const TIERS = [
  { id: 'simple', label: 'Simple' },
  { id: 'standard', label: 'Standard' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'professional', label: 'Professional' },
  { id: 'enterprise', label: 'Enterprise' },
]

export default function AgentxNewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') ?? ''

  const [actorId, setActorId] = useState('homeowner')
  const [tier, setTier] = useState('standard')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!userId) {
    return (
      <p className="text-[13px] text-[#F87171]">
        Missing userId — start from a user's page instead of navigating here directly.
      </p>
    )
  }

  function handleCreate() {
    setError('')
    startTransition(async () => {
      const { data, error: apiError } = await saveAgentDraft({
        userId,
        id: crypto.randomUUID(),
        actorId,
        tier,
        answers: {},
      })
      if (apiError || !data) {
        setError(apiError ?? 'Failed to create project.')
        return
      }
      router.push(`/agentx/projects/${data.project.id}`)
    })
  }

  return (
    <div className="max-w-[480px]">
      <Link href={`/agentx/users/${userId}`} className="text-[13px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors">← Back</Link>

      <h1 className="font-display text-[22px] text-[#E8F0FF] mt-3 mb-1">New project</h1>
      <p className="text-[13.5px] text-[#5A6A8A] mb-6">Pick a starting point — you can fill in the actual eligibility form on the next screen.</p>

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 space-y-4">
        <div>
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Who is this for</label>
          <select
            value={actorId}
            onChange={e => setActorId(e.target.value)}
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors"
          >
            {ACTORS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Tier</label>
          <select
            value={tier}
            onChange={e => setTier(e.target.value)}
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors"
          >
            {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <p className="text-[12px] text-[#5A6A8A] mt-1.5">Determines which eligibility questions apply.</p>
        </div>

        {error && <p className="text-[13px] text-[#F87171]" role="alert">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={isPending}
          className="w-full py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[14px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Creating…' : 'Create & continue →'}
        </button>
      </div>
    </div>
  )
}
