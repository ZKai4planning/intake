'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, MessageCircle } from 'lucide-react'

import { useWorkspace } from '@/hooks/Useworkspace'
import { DashboardShell } from '@/components/dashboard/Dashboardshell'
import { DashboardLoading } from '@/components/dashboard/DashboardLoading'
import { openAgentAssistant } from '@/components/agentAssistant/AgentAssistantWidget'
import { HELP_CATEGORIES, searchHelpArticles, type HelpArticle } from '@/lib/support'
import { cn } from '@/lib/cn'

/**
 * /dashboard/support — "Get Help"
 * ─────────────────────────────────
 * Self-serve first: search a small set of pre-answered questions
 * (src/lib/support.ts). If nothing relevant comes back, don't leave
 * the person stuck on an empty page — hand them straight to the
 * in-app assistant with their question pre-filled, via
 * openAgentAssistant(). No WhatsApp / external chat handoff here by
 * design; the assistant already lives in the dashboard.
 */
export default function GetHelpPage() {
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()

  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const results = useMemo(() => searchHelpArticles(query), [query])
  const isSearching = query.trim().length > 0
  const hasResults = results.length > 0

  const grouped = useMemo(() => {
    const byCategory = new Map<string, HelpArticle[]>()
    for (const article of results) {
      const list = byCategory.get(article.category) ?? []
      list.push(article)
      byCategory.set(article.category, list)
    }
    return HELP_CATEGORIES
      .map(category => ({ category, articles: byCategory.get(category) ?? [] }))
      .filter(group => group.articles.length > 0)
  }, [results])

  if (isLoading) {
    return <DashboardLoading label="Loading Get Help…" cards={2} />
  }

  if (!session || !workspace) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">Please log in to access Get Help.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Go to login →
          </button>
        </div>
      </div>
    )
  }

  function handleAskAssistant() {
    openAgentAssistant(query.trim() || undefined)
  }

  return (
    <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
      <div className="mb-7">
        <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
          Get help
        </h1>
        <p className="text-[13px] text-[#5A6A8A] mt-1">
          Search common questions below, or ask the assistant if you can&apos;t find what you need.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6A8A]" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpenId(null) }}
          placeholder="Search for an answer — e.g. &quot;download report&quot;, &quot;refund&quot;, &quot;MFA&quot;…"
          className="w-full rounded-[12px] border border-white/[0.08] bg-[#0F1525] pl-11 pr-4 py-3 text-[13.5px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
        />
      </div>

      {hasResults ? (
        <div className="space-y-7">
          {grouped.map(({ category, articles }) => (
            <div key={category}>
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#5A6A8A] mb-2.5">
                {category}
              </p>
              <div className="rounded-[16px] border border-white/[0.08] bg-[#0F1525] overflow-hidden divide-y divide-white/[0.06]">
                {articles.map(article => {
                  const isOpen = openId === article.id
                  return (
                    <div key={article.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : article.id)}
                        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="text-[13.5px] font-medium text-[#E8F0FF]">{article.question}</span>
                        <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#5A6A8A] transition-transform', isOpen && 'rotate-180')} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-[13px] text-[#A8B8D8] leading-relaxed">{article.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[16px] border border-white/[0.08] bg-[#0F1525] px-6 py-10 text-center">
          <p className="text-[14px] font-medium text-[#E8F0FF] mb-1.5">
            {isSearching ? `No answer found for "${query.trim()}"` : 'No help articles yet'}
          </p>
          <p className="text-[13px] text-[#5A6A8A] mb-5 max-w-[420px] mx-auto">
            Ask the assistant instead — it can look into your account and projects directly.
          </p>
          <button
            onClick={handleAskAssistant}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Ask the assistant
          </button>
        </div>
      )}

      {/* Always-available fallback, even when the search above found something */}
      {hasResults && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-5 py-4">
          <p className="text-[13px] text-[#A8B8D8]">Still stuck? The assistant can dig into your specific account.</p>
          <button
            onClick={handleAskAssistant}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-[12.5px] font-semibold text-[#135BEC] hover:bg-[#135BEC]/10 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask the assistant
          </button>
        </div>
      )}
    </DashboardShell>
  )
}
