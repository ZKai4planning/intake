import type { Metadata } from 'next'
import { GOALS } from '@/lib/goals'
import { REPORT_TIERS } from '@/lib/reportTiers'
import { ReportChatFlow } from '@/components/home/ReportChatFlow'
import type { ActorId, GoalId } from '@/types'
import type { ReportTierId } from '@/types/reportTiers'

interface CheckPageProps {
  params: { goalId: string }
  searchParams: { q?: string; actor?: string; resumeReport?: string; tier?: string }
}

const VALID_ACTOR_IDS: ActorId[] = [
  'homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business', 'builder',
]

export function generateStaticParams() {
  return GOALS.map(g => ({ goalId: g.id }))
}

export async function generateMetadata({ params }: CheckPageProps): Promise<Metadata> {
  const goal = GOALS.find(g => g.id === params.goalId)
  return {
    title: goal ? `${goal.title} — Planning Check` : 'Planning Check',
  }
}

/**
 * /check/[goalId]
 * ────────────────
 * Landing spot for the homepage search once it's been submitted.
 * Shows the question the person typed and a chat-style answer, then
 * keeps the conversation open. General questions stay free. Once the
 * person's after something specific, the flow offers to build a free
 * tiered report (RPT-001) right there in chat, no login required —
 * login is only ever prompted to download a generated report or to
 * hand off to a consultant. See components/home/ReportChatFlow.tsx,
 * lib/chatAnswers.ts and lib/reportTiers.ts.
 */
export default function CheckPage({ params, searchParams }: CheckPageProps) {
  const query = searchParams.q ?? ''
  const actorId = VALID_ACTOR_IDS.includes(searchParams.actor as ActorId)
    ? (searchParams.actor as ActorId)
    : null

  const resumeTargetTier = REPORT_TIERS.some(t => t.id === searchParams.tier)
    ? (searchParams.tier as ReportTierId)
    : undefined
  const resumeReportId = resumeTargetTier ? searchParams.resumeReport : undefined

  return (
    <ReportChatFlow
      query={query}
      goalId={(params.goalId as GoalId) ?? 'unsure'}
      actorId={actorId}
      resumeReportId={resumeReportId}
      resumeTargetTier={resumeTargetTier}
    />
  )
}
