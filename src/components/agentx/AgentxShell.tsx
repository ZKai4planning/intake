'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getAgentMe, agentLogout, type AgentProfile } from '@/lib/agentxApi'
import { AgentAssistantWidget } from '@/components/agentAssistant/AgentAssistantWidget'

export function AgentxShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAgentMe().then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        router.replace('/agentx/login')
        return
      }
      if (data.agent.mustResetPassword) {
        router.replace('/agentx/reset-password')
        return
      }
      setAgent(data.agent)
      setChecked(true)
    })
    return () => { cancelled = true }
  }, [router])

  async function handleLogout() {
    await agentLogout()
    router.push('/agentx/login')
  }

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-[#135BEC] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <header className="border-b border-white/[0.08] bg-[#0F1525] px-6 py-3.5 flex items-center justify-between">
        <Link href="/agentx/users" className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-[#5A6A8A] uppercase">AI4Planning</span>
          <span className="text-[14.5px] font-semibold text-[#E8F0FF]">Agent portal</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#5A6A8A]">{agent?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#F87171] hover:bg-white/[0.05] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-7">{children}</main>

      <AgentAssistantWidget surface="agentx" context={extractUserIdFromPath(pathname)} />
    </div>
  )
}

/** On /agentx/users/[id] (but not the plain /agentx/users list, and not /agentx/users/new-style sub-routes with extra segments), pull the id out so "create a project" can resolve it without asking. */
function extractUserIdFromPath(pathname: string | null): Record<string, string> {
  const match = pathname?.match(/^\/agentx\/users\/([^/]+)$/)
  return match ? { userId: match[1] } : {}
}
