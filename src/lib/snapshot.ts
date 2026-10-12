import type { ActorId } from '@/types'
import type { WorkspaceTier } from '@/types/workspace'
import type { ConstraintResult } from './constraints'

export interface SnapshotContent {
  route: string
  routeDetail: string
  confidence: string
  checks: string[]
  upsell: string[]
}

const ACTOR_NOUN: Record<ActorId, string> = {
  homeowner:  'your home',
  landlord:   'this property',
  developer:  'this site',
  builder:    'this job',
  consultant: "your client's property",
  architect:  "your client's project",
  business:   'this property',
}

/**
 * generateSnapshot
 * ─────────────────
 * Mock stand-in for the real AI-generated planning snapshot. Builds
 * plausible, actor-aware copy from the constraint check results rather
 * than hand-written per-goal templates, since goalId isn't threaded
 * into the dashboard flow yet (see HeroSection.tsx's handleGoalSelect
 * comment) — this reads as tailored without needing that wiring.
 *
 * API swap point: once a real snapshot-generation endpoint exists,
 * replace the body with a fetch call using the same inputs.
 */
export function generateSnapshot(opts: {
  actorId: ActorId
  tier: WorkspaceTier
  title: string
  constraints: ConstraintResult[]
}): SnapshotContent {
  const { actorId, constraints } = opts
  const noun = ACTOR_NOUN[actorId] ?? 'this property'
  const warnings = constraints.filter(c => c.status === 'warning')
  const hasConservationArea = warnings.some(w => w.label.toLowerCase().includes('conservation'))
  const hasArticle4 = warnings.some(w => w.label.toLowerCase().includes('article 4'))

  if (warnings.length === 0) {
    return {
      route: 'Likely permitted development — no application expected',
      routeDetail:
        `No constraints were found that would remove permitted development rights for ${noun}. ` +
        `Most works of this type can proceed without a planning application, subject to the usual size and height limits.`,
      confidence: 'Confidence level: Medium-High',
      checks: [
        'Confirm your specific dimensions stay within permitted development limits',
        'Check building regulations separately — these apply regardless of planning permission',
        'Consider a Lawful Development Certificate for written confirmation before you start',
      ],
      upsell: [
        'Exact permitted development limits for your specific works and property type',
        'Written confirmation route (LDC) if you want certainty before committing to a design',
        'Complete document checklist for whichever route applies',
        'A second check if your plans change size, position, or materials',
      ],
    }
  }

  return {
    route: hasConservationArea
      ? 'Householder planning application likely — or a Lawful Development Certificate'
      : 'Planning application likely required',
    routeDetail: hasConservationArea
      ? `${noun[0].toUpperCase()}${noun.slice(1)} sits in a conservation area, which typically restricts standard permitted development rights. ` +
        `An application is likely required even for works that would otherwise be permitted.`
      : hasArticle4
      ? `An Article 4 direction applies here, which removes some permitted development rights that would otherwise apply. ` +
        `An application is likely required for this type of work.`
      : `One or more constraints were found that are likely to affect what's permitted without an application.`,
    confidence: 'Confidence level: Medium',
    checks: [
      'Confirm whether permitted development applies to your exact plans',
      hasConservationArea
        ? "Review the council's conservation area design guidance for this street"
        : 'Review the specific restriction and how it applies to your plans',
      'Consider a Lawful Development Certificate if you want formal confirmation before starting',
    ],
    upsell: [
      'Exact likely application type for this property and works',
      hasConservationArea
        ? 'How the conservation area affects your specific size and materials'
        : 'How the constraint found here affects your specific plans',
      "Complete document checklist — exactly what you'll need to submit",
      "Risk rating, recommended route, and your council's likely timescale",
    ],
  }
}