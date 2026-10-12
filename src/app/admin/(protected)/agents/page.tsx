'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  listAdminAgents, createAdminAgent, resendAdminAgentInvite, deleteAdminAgent,
  type AdminAgentRow,
} from '@/lib/adminApi'

export default function AdminAgentsPage() {
  const searchParams = useSearchParams()
  const [agents, setAgents] = useState<AdminAgentRow[] | null>(null)
  const [error, setError] = useState('')

  // Pre-filled when the floating assistant routes here after extracting a
  // name/email from a request like "create an agent for Jane, jane@x.com" —
  // still requires an explicit click on "Create agent" below, never submits itself.
  const [name, setName] = useState(() => searchParams.get('prefillName') ?? '')
  const [email, setEmail] = useState(() => searchParams.get('prefillEmail') ?? '')
  const [isCreating, setIsCreating] = useState(false)
  const [createdMessage, setCreatedMessage] = useState('')

  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [resentId, setResentId] = useState<string | null>(null)

  function load() {
    listAdminAgents().then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load agents.')
        return
      }
      setError('')
      setAgents(data.agents)
    })
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setIsCreating(true)
    setError('')
    setCreatedMessage('')

    const { data, error: apiError } = await createAdminAgent({ name: name.trim(), email: email.trim() })
    setIsCreating(false)

    if (apiError || !data) {
      setError(apiError ?? 'Failed to create agent.')
      return
    }
    setName('')
    setEmail('')
    setCreatedMessage(`Invite sent to ${data.agent.email} with a temporary password. They'll be asked to set their own on first login.`)
    load()
  }

  async function handleResend(id: string) {
    setBusyId(id)
    setError('')
    const { data, error: apiError } = await resendAdminAgentInvite(id)
    setBusyId(null)

    if (apiError || !data) {
      setError(apiError ?? 'Failed to resend invite.')
      return
    }
    setResentId(id)
    setTimeout(() => setResentId(null), 3000)
    load()
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    setError('')
    const { error: apiError } = await deleteAdminAgent(id)
    setBusyId(null)
    setConfirmDeleteId(null)

    if (apiError) {
      setError(apiError)
      return
    }
    load()
  }

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Agents</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-6">
        Provision agentx accounts. Each new agent gets a temporary password by email and is required to set
        their own password the first time they log in.
      </p>

      <form onSubmit={handleCreate} className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-6 flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isCreating}
            placeholder="Jane Doe"
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isCreating}
            placeholder="agent@ai4planning.com"
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || !email.trim() || isCreating}
          className="px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13.5px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating…' : 'Create agent'}
        </button>
      </form>

      {createdMessage && <p className="text-[13px] text-[#34D399] mb-4">{createdMessage}</p>}
      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(agents ?? []).map(a => (
              <tr key={a.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[13.5px] text-[#E8F0FF] font-medium">{a.name || '(no name)'}</td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{a.email}</td>
                <td className="px-4 py-3">
                  {a.mustResetPassword ? (
                    <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.12)] text-[#FBBF24]">invite pending</span>
                  ) : (
                    <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34D399]">active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleResend(a.id)}
                      disabled={busyId === a.id}
                      className="text-[12.5px] font-medium text-[#135BEC] hover:text-[#2A6BF0] disabled:opacity-50 transition-colors"
                    >
                      {resentId === a.id ? 'Invite sent' : 'Resend invite'}
                    </button>

                    {confirmDeleteId === a.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={busyId === a.id}
                          className="text-[12.5px] font-medium text-[#F87171] hover:text-[#EF5555] disabled:opacity-50 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={busyId === a.id}
                          className="text-[12.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(a.id)}
                        className="text-[12.5px] font-medium text-[#5A6A8A] hover:text-[#F87171] transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {agents !== null && agents.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#5A6A8A]">No agents yet — create one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
