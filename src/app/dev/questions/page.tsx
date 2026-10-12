'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { QUESTION_BANK, getQuestionsForTier } from '@/lib/questions/questionBank'
import { ACTOR_WORKSPACE_MAP, AGENT_CATALOGUE } from '@/types/workspace'
import { ACTORS } from '@/lib/actors'
import { IntakeForm } from '@/components/dashboard/questions/IntakeForm'
import { IntentConfirmation } from '@/components/dashboard/intent/IntentConfirmation'
import type { ActorId } from '@/types'
import type { WorkspaceTier } from '@/types/workspace'

/**
 * /dev/questions
 * ───────────────
 * INTERNAL TEST PAGE — not linked from production nav.
 *
 * Lets you switch between every actor and instantly see:
 *  - which of the 17 QMB rows are visible to that actor's tier
 *  - the live, fillable IntakeForm exactly as it renders on /dashboard
 *  - the full coverage matrix (row × actor) in one table
 *
 * Delete this route (or gate it behind an env flag) before production launch.
 */
export default function QuestionTestPage() {
  const [selectedActor, setSelectedActor] = useState<ActorId>('homeowner')
  const [view, setView] = useState<'matrix' | 'live' | 'intent'>('matrix')
  const [intentResult, setIntentResult] = useState<ActorId | null>(null)

  const workspace = ACTOR_WORKSPACE_MAP[selectedActor]
  const visibleQuestions = getQuestionsForTier(workspace.tier)

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E8F0FF]">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#0F1525] border-b border-white/[0.08] px-5 sm:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#F59E0B] mb-1">
              ⚠ Internal test page — not for production
            </p>
            <h1 className="font-display text-xl font-normal">Question bank by actor</h1>
          </div>
          <Link href="/dashboard" className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8]">
            ← Back to dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-7">

        {/* ── Actor switcher ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ACTORS.map(actor => {
            const isSelected = selectedActor === actor.id
            const cfg = ACTOR_WORKSPACE_MAP[actor.id]
            return (
              <button
                key={actor.id}
                onClick={() => setSelectedActor(actor.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border text-left transition-all',
                  isSelected
                    ? 'bg-[rgba(19,91,236,0.1)] border-[#135BEC]'
                    : 'bg-[#0F1525] border-white/[0.08] hover:border-white/[0.18]'
                )}
              >
                <span>{actor.emoji}</span>
                <div>
                  <p className={cn('text-[12.5px] font-semibold', isSelected ? 'text-[#135BEC]' : 'text-[#E8F0FF]')}>
                    {actor.label}
                  </p>
                  <p className="text-[10.5px] text-[#5A6A8A]">{cfg.tier} tier</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Workspace summary card ───────────────────────────── */}
        <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5A6A8A] mb-1">
                {workspace.internalLabel} (backend only — never shown to user)
              </p>
              <p className="text-[14px] text-[#E8F0FF]">
                <strong>{visibleQuestions.length}</strong> of {QUESTION_BANK.length} questions visible &middot;{' '}
                <strong>{workspace.availableAgents.length}</strong> AI agents &middot;{' '}
                project limit: <strong>{workspace.projectLimit}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('matrix')}
                className={cn('px-3 py-1.5 rounded-[8px] text-[12px] font-medium', view === 'matrix' ? 'bg-[#135BEC] text-white' : 'bg-white/[0.06] text-[#A8B8D8]')}
              >
                Matrix view
              </button>
              <button
                onClick={() => setView('live')}
                className={cn('px-3 py-1.5 rounded-[8px] text-[12px] font-medium', view === 'live' ? 'bg-[#135BEC] text-white' : 'bg-white/[0.06] text-[#A8B8D8]')}
              >
                Live form
              </button>
              <button
                onClick={() => { setIntentResult(null); setView('intent') }}
                className={cn('px-3 py-1.5 rounded-[8px] text-[12px] font-medium', view === 'intent' ? 'bg-[#135BEC] text-white' : 'bg-white/[0.06] text-[#A8B8D8]')}
              >
                Intent flow
              </button>
            </div>
          </div>

          {/* Agent chips */}
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/[0.06]">
            {workspace.availableAgents.map(id => {
              const agent = AGENT_CATALOGUE[id]
              if (!agent) return null
              return (
                <span key={id} className="text-[11px] px-2.5 py-1 rounded-full bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border border-[rgba(0,212,255,0.2)]">
                  ✦ {agent.name}
                </span>
              )
            })}
          </div>
        </div>

        {view === 'matrix' ? (
          /* ── Full coverage matrix: row × every actor ─────────── */
          <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#5A6A8A] sticky left-0 bg-[#0F1525]">Row</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#5A6A8A] min-w-[220px]">Field</th>
                  {ACTORS.map(a => (
                    <th key={a.id} className="px-3 py-3 text-center text-[11px] font-medium text-[#5A6A8A]">
                      <span className="block text-[15px]">{a.emoji}</span>
                      {a.label.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUESTION_BANK.map(q => (
                  <tr key={q.rowId} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-[11px] text-[#5A6A8A] sticky left-0 bg-[#0F1525]">{q.rowId}</td>
                    <td className="px-4 py-3 text-[12.5px] text-[#E8F0FF]">
                      {q.field}
                      {q.required && <span className="text-[#F87171] ml-1">*</span>}
                      {q.upsellTrigger && (
                        <span className="block text-[10.5px] text-[#F59E0B] mt-0.5">💡 has consultation trigger</span>
                      )}
                    </td>
                    {ACTORS.map(a => {
                      const tier = ACTOR_WORKSPACE_MAP[a.id].tier
                      const visible = getQuestionsForTier(tier).some(vq => vq.rowId === q.rowId)
                      return (
                        <td key={a.id} className="px-3 py-3 text-center">
                          {visible
                            ? <span className="text-[#135BEC]">✓</span>
                            : <span className="text-white/10">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === 'live' ? (
          /* ── Live, fillable form exactly as on /dashboard ─────── */
          <div className="max-w-[640px]">
            <IntakeForm
              key={selectedActor}
              tier={workspace.tier}
              onSubmit={({ answers }) => console.log(`[${selectedActor}] submitted`, answers)}
              onBookConsultation={() => alert('Would route to /dashboard/consultation')}
            />
          </div>
        ) : (
          /* ── Intent flow: the goal-intent questions that resolve the
                 actor BEFORE the tiered form loads, with the resolved
                 actor's live form shown immediately after. ────────── */
          <div className="max-w-[640px] rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-6 sm:p-8">
            {intentResult ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[12.5px] text-[#A8B8D8]">
                    Resolved actor: <strong className="text-[#135BEC]">{intentResult}</strong>
                  </p>
                  <button
                    onClick={() => setIntentResult(null)}
                    className="text-[12px] text-[#5A6A8A] hover:text-[#A8B8D8]"
                  >
                    ↺ Restart intent flow
                  </button>
                </div>
                <IntakeForm
                  key={intentResult}
                  tier={ACTOR_WORKSPACE_MAP[intentResult].tier}
                  resolvedActorId={intentResult}
                  onActorRevised={setIntentResult}
                  onSubmit={({ answers }) => console.log(`[${intentResult}] submitted`, answers)}
                  onBookConsultation={() => alert('Would route to /dashboard/consultation')}
                />
              </>
            ) : (
              <IntentConfirmation onResolved={setIntentResult} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
