// import { GOALS, SEARCH_KEYWORDS } from '@/lib/goals'
// import type { Goal, GoalId } from '@/types'

// /**
//  * chatAnswers.ts
//  * ────────────────
//  * Turns whatever the person typed into the hero search (or a chat
//  * follow-up) into a conversational "answer" for the /check/[goalId]
//  * results page.
//  *
//  * Three kinds of answer:
//  *   'services' — they asked what we offer → show the services grid,
//  *                 no login needed, it's just browsing.
//  *   'howto'    — they asked how to actually DO something (a specific
//  *                 goal, or "how do I…" phrasing) → give a short,
//  *                 general answer, then prompt login for the real,
//  *                 address-specific process.
//  *   'general'  — everything else (definitions, "what is…", rough
//  *                 cost/timing questions) → answer plainly, no gate.
//  *
//  * This is a local, keyword-based mock — the same pattern already used
//  * by lib/agent/agentResponses.ts for the in-dashboard agent panel.
//  *
//  * API SWAP POINT:
//  *   Replace generateAnswer's body with a POST to /api/chat/ask, e.g.:
//  *     const res = await fetch('/api/chat/ask', {
//  *       method: 'POST',
//  *       body: JSON.stringify({ query, goalId }),
//  *     })
//  *     return (await res.json()).answer
//  *   keeping the same ChatAnswer shape so the UI doesn't change.
//  */

// export type ChatAnswer =
//   | { kind: 'services' }
//   | { kind: 'howto'; goal?: Goal; text: string }
//   | { kind: 'general'; text: string }

// // "What do you offer / what are your services" — routes to a services
// // card grid instead of a text answer. Purely informational, no login
// // needed just to browse.
// const SERVICES_KEYWORDS = [
//   'service', 'services', 'offer', 'offering',
//   'what can you do', 'what do you do', 'help with', 'what do you provide',
//   'what do you cover',
// ]

// // Procedural / "get this done" phrasing — these want the real,
// // address-specific process, which is where login earns its keep.
// const HOWTO_KEYWORDS = [
//   'how do i', 'how to', 'how can i', 'how should i',
//   'steps to', 'what do i need to', 'process for', 'apply for',
//   'get started', 'get permission', 'submit an application',
// ]

// // General planning questions that are useful to answer plainly,
// // with no login required — same spirit as agentResponses.ts's
// // KEYWORD_REPLIES, but for a public, unauthenticated audience.
// const GENERAL_KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
//   {
//     keywords: ['cost', 'price', 'fee', 'how much'],
//     reply: "Costs vary by council and project size. Application fees for a typical householder extension currently sit around £258 in England, plus any design/agent fees on top — log in and we'll give you an estimate specific to your project.",
//   },
//   {
//     keywords: ['how long', 'time', 'weeks', 'decision'],
//     reply: 'Most householder applications get a decision within 8 weeks of being validated. Anything more complex — full planning, listed buildings — can take longer, sometimes 13 weeks or more.',
//   },
//   {
//     keywords: ['permitted development', ' pd ', 'do i need planning', 'need planning permission', 'need permission'],
//     reply: "Permitted development rights let you make certain changes without applying for full planning permission, but the limits depend on your exact property — size, position, and any restrictions like an Article 4 direction. Log in and we'll check that against your actual address.",
//   },
//   {
//     keywords: ['neighbour', 'neighbor', 'object'],
//     reply: 'Neighbours are consulted as part of most applications and can raise objections, but a well-documented, policy-compliant proposal is the best protection against a refusal on those grounds.',
//   },
//   {
//     keywords: ['refuse', 'refusal', 'reject', 'appeal'],
//     reply: 'If an application is refused, you usually have options — amend and resubmit, or appeal to the Planning Inspectorate. Which one fits depends on the reason for refusal.',
//   },
//   {
//     keywords: ['conservation area'],
//     reply: "Conservation area status changes what you can do without permission, particularly for cladding, windows, and anything visible from the street. It's worth checking before you commit to a design.",
//   },
//   {
//     keywords: ['listed building', 'listed'],
//     reply: 'Listed buildings have extra protection on top of normal planning rules — even minor internal changes can need listed building consent.',
//   },
//   {
//     keywords: ['tree', 'tpo'],
//     reply: "If there's a protected tree (a TPO) anywhere near the works — even on a neighbour's land — that changes what you can do without consent.",
//   },
//   {
//     keywords: ['hmo', 'licence', 'license', 'tenant', 'rental'],
//     reply: 'Converting a property to rent out to multiple tenants usually falls under HMO rules and licensing, which is separate from standard planning permission.',
//   },
//   {
//     keywords: ['flood'],
//     reply: 'Flood risk depends on your exact location, not just the general area — worth checking the current flood zone data for your specific address.',
//   },
//   {
//     keywords: ['who are you', 'what is ai4planning', 'what is this'],
//     reply: "AI4Planning is a planning permission advisor — tell us your project and address, and we check it against real constraint data (conservation areas, listed buildings, flood risk, Local Plan policy) to give you a free eligibility snapshot.",
//   },
// ]

// function matchGeneralKeyword(lower: string): string | null {
//   for (const entry of GENERAL_KEYWORD_REPLIES) {
//     if (entry.keywords.some(k => lower.includes(k))) return entry.reply
//   }
//   return null
// }

// function isHowToQuestion(lower: string): boolean {
//   return HOWTO_KEYWORDS.some(k => lower.includes(k))
// }

// /** Same simple substring classifier used by useSearch's local goal matcher. */
// export function classifyGoalId(query: string): GoalId | 'unsure' {
//   const lower = query.toLowerCase().trim()
//   if (lower.length < 3) return 'unsure'
//   for (const kw of Object.keys(SEARCH_KEYWORDS)) {
//     if (lower.includes(kw)) return SEARCH_KEYWORDS[kw]
//   }
//   return 'unsure'
// }

// function goalAnswer(goal: Goal): string {
//   return `That sounds like "${goal.title}" — ${goal.subtitle.toLowerCase()}. Log in and we'll check your exact address against real constraint data — conservation areas, listed buildings, Article 4 directions, flood risk, and your council's Local Plan policy — and give you a free eligibility snapshot in under two minutes.`
// }

// export function generateAnswer(query: string, goalId: GoalId | 'unsure' | null): ChatAnswer {
//   const lower = query.toLowerCase().trim()

//   if (SERVICES_KEYWORDS.some(k => lower.includes(k))) {
//     return { kind: 'services' }
//   }

//   const goal = goalId && goalId !== 'unsure' ? GOALS.find(g => g.id === goalId) : undefined

//   // A resolved goal or explicit "how do I…" phrasing both mean they
//   // want the actual process — that's the login-gated case.
//   if (goal || isHowToQuestion(lower)) {
//     return { kind: 'howto', goal, text: goal ? goalAnswer(goal) : "Getting this done properly means checking it against your exact address — conservation areas, listed buildings, and local policy all vary street to street. Log in and we'll run the full check, free." }
//   }

//   const generalReply = matchGeneralKeyword(lower)
//   if (generalReply) {
//     return { kind: 'general', text: generalReply }
//   }

//   return {
//     kind: 'general',
//     text: "I can help with most residential and commercial planning questions — extensions, loft conversions, change of use, listed buildings, HMOs, and more. Ask me something specific, or ask what services we offer to see the full list.",
//   }
// }

import { GOALS, SEARCH_KEYWORDS } from '@/lib/goals'
import type { Goal, GoalId } from '@/types'

/**
 * chatAnswers.ts
 * ────────────────
 * Turns whatever the person typed into the hero search (or a chat
 * follow-up) into a conversational "answer" for the /check/[goalId]
 * results page.
 *
 * Three kinds of answer:
 *   'services' — they asked what we offer → show the services grid,
 *                 no login needed, it's just browsing.
 *   'howto'    — they asked how to actually DO something (a specific
 *                 goal, or "how do I…" phrasing) → give a short,
 *                 general answer, then prompt login for the real,
 *                 address-specific process.
 *   'general'  — everything else (definitions, "what is…", rough
 *                 cost/timing questions) → answer plainly, no gate.
 *
 * This is a local, keyword-based mock — the same pattern already used
 * by lib/agent/agentResponses.ts for the in-dashboard agent panel.
 *
 * API SWAP POINT:
 *   Replace generateAnswer's body with a POST to /api/chat/ask, e.g.:
 *     const res = await fetch('/api/chat/ask', {
 *       method: 'POST',
 *       body: JSON.stringify({ query, goalId }),
 *     })
 *     return (await res.json()).answer
 *   keeping the same ChatAnswer shape so the UI doesn't change.
 */

export type ChatAnswer =
  | { kind: 'services' }
  | { kind: 'howto'; goal?: Goal; text: string }
  | { kind: 'general'; text: string }

// "What do you offer / what are your services" — routes to a services
// card grid instead of a text answer. Purely informational, no login
// needed just to browse.
const SERVICES_KEYWORDS = [
  'service', 'services', 'offer', 'offering',
  'what can you do', 'what do you do', 'help with', 'what do you provide',
  'what do you cover',
]

// Procedural / "get this done" phrasing — these want the real,
// address-specific process, which is where login earns its keep.
const HOWTO_KEYWORDS = [
  'how do i', 'how to', 'how can i', 'how should i',
  'steps to', 'what do i need to', 'process for', 'apply for',
  'get started', 'get permission', 'submit an application',
]

// General planning questions that are useful to answer plainly,
// with no login required — same spirit as agentResponses.ts's
// KEYWORD_REPLIES, but for a public, unauthenticated audience.
const GENERAL_KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['cost', 'price', 'fee', 'how much'],
    reply: "Costs vary by council and project size. Application fees for a typical householder extension currently sit around £258 in England, plus any design/agent fees on top — log in and we'll give you an estimate specific to your project.",
  },
  {
    keywords: ['how long', 'time', 'weeks', 'decision'],
    reply: 'Most householder applications get a decision within 8 weeks of being validated. Anything more complex — full planning, listed buildings — can take longer, sometimes 13 weeks or more.',
  },
  {
    keywords: ['permitted development', ' pd ', 'do i need planning', 'need planning permission', 'need permission'],
    reply: "Permitted development rights let you make certain changes without applying for full planning permission, but the limits depend on your exact property — size, position, and any restrictions like an Article 4 direction. Log in and we'll check that against your actual address.",
  },
  {
    keywords: ['neighbour', 'neighbor', 'object'],
    reply: 'Neighbours are consulted as part of most applications and can raise objections, but a well-documented, policy-compliant proposal is the best protection against a refusal on those grounds.',
  },
  {
    keywords: ['refuse', 'refusal', 'reject', 'appeal'],
    reply: 'If an application is refused, you usually have options — amend and resubmit, or appeal to the Planning Inspectorate. Which one fits depends on the reason for refusal.',
  },
  {
    keywords: ['conservation area'],
    reply: "Conservation area status changes what you can do without permission, particularly for cladding, windows, and anything visible from the street. It's worth checking before you commit to a design.",
  },
  {
    keywords: ['listed building', 'listed'],
    reply: 'Listed buildings have extra protection on top of normal planning rules — even minor internal changes can need listed building consent.',
  },
  {
    keywords: ['tree', 'tpo'],
    reply: "If there's a protected tree (a TPO) anywhere near the works — even on a neighbour's land — that changes what you can do without consent.",
  },
  {
    keywords: ['hmo', 'licence', 'license', 'tenant', 'rental'],
    reply: 'Converting a property to rent out to multiple tenants usually falls under HMO rules and licensing, which is separate from standard planning permission.',
  },
  {
    keywords: ['flood'],
    reply: 'Flood risk depends on your exact location, not just the general area — worth checking the current flood zone data for your specific address.',
  },
  {
    keywords: ['who are you', 'what is ai4planning', 'what is this'],
    reply: "AI4Planning is a planning permission advisor — tell us your project and address, and we check it against real constraint data (conservation areas, listed buildings, flood risk, Local Plan policy) to give you a free eligibility snapshot.",
  },
]

function matchGeneralKeyword(lower: string): string | null {
  for (const entry of GENERAL_KEYWORD_REPLIES) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.reply
  }
  return null
}

function isHowToQuestion(lower: string): boolean {
  return HOWTO_KEYWORDS.some(k => lower.includes(k))
}

/** Same simple substring classifier used by useSearch's local goal matcher. */
export function classifyGoalId(query: string): GoalId | 'unsure' {
  const lower = query.toLowerCase().trim()
  if (lower.length < 3) return 'unsure'
  for (const kw of Object.keys(SEARCH_KEYWORDS)) {
    if (lower.includes(kw)) return SEARCH_KEYWORDS[kw]
  }
  return 'unsure'
}

function goalAnswer(goal: Goal): string {
  return `That sounds like "${goal.title}" — ${goal.subtitle.toLowerCase()}. We can check your exact address against real constraint data — conservation areas, listed buildings, Article 4 directions, flood risk, and your council's Local Plan policy — and give you a free eligibility snapshot.`
}

export function generateAnswer(query: string, goalId: GoalId | 'unsure' | null): ChatAnswer {
  const lower = query.toLowerCase().trim()

  if (SERVICES_KEYWORDS.some(k => lower.includes(k))) {
    return { kind: 'services' }
  }

  const goal = goalId && goalId !== 'unsure' ? GOALS.find(g => g.id === goalId) : undefined

  // A resolved goal or explicit "how do I…" phrasing both mean they
  // want the actual process — that's the login-gated case.
  if (goal || isHowToQuestion(lower)) {
    return { kind: 'howto', goal, text: goal ? goalAnswer(goal) : "Getting this done properly means checking it against your exact address — conservation areas, listed buildings, and local policy all vary street to street. Log in and we'll run the full check, free." }
  }

  const generalReply = matchGeneralKeyword(lower)
  if (generalReply) {
    return { kind: 'general', text: generalReply }
  }

  return {
    kind: 'general',
    text: "I can help with most residential and commercial planning questions — extensions, loft conversions, change of use, listed buildings, HMOs, and more. Ask me something specific, or ask what services we offer to see the full list.",
  }
}

/**
 * ── PASTE THIS AT THE END OF THE EXISTING src/lib/chatAnswers.ts ──
 * Nothing above this needs to change — generateAnswer/classifyGoalId
 * stay as they are (unused now by the live flow, harmless to keep
 * around as an offline fallback). This new type + function is what
 * useReportChatFlow.ts now calls instead.
 */

export interface ResolvedPostcode {
  postcode: string
  council: string
  ward: string | null
  country: string
}

/** Mirrors PlanningConstraint from lib/planningData.ts — kept as a local shape here rather than importing that (server-only) module into client code. */
export interface ResolvedConstraint {
  dataset: string
  label: string
  present: boolean
  status: 'warning' | 'clear'
  detail?: string
}

export interface RemoteAnswerResult {
  answer: ChatAnswer
  /** Present only on the turn where the LLM successfully looked up a postcode. */
  resolvedPostcode?: ResolvedPostcode
  /**
   * Any QUESTION_SLOTS answers (see lib/questionSlots.ts) the LLM recognised
   * in what the person said this turn — keyed by slot id, e.g.
   * `{ propertyType: 'house' }`. Data-driven off the same slot schema the
   * stepper itself uses, so a new slot added there becomes resolvable from
   * free chat text automatically, with nothing to wire up here.
   */
  resolvedSlots?: Record<string, string>
  /**
   * Present only on the turn where the LLM asked a multiple-choice
   * question via the ask_choice tool instead of replying with plain
   * text — useReportChatFlow.ts renders this as tappable option chips
   * (via NumberedCard) rather than a text bubble. `answer.text` is
   * still populated with the same prompt as a plain-text fallback for
   * anything that doesn't render the structured version.
   */
  resolvedChoice?: { prompt: string; options: string[] }
  /**
   * Present only on a turn where the LLM called check_planning_constraints
   * — the real, live planning.data.gov.uk result for whatever postcode's
   * coordinates it checked. useReportChatFlow.ts uses this to tag the
   * answer bubble as grounded in live data rather than the model's own
   * knowledge.
   */
  resolvedConstraints?: ResolvedConstraint[]
  /**
   * Present only on the turn where the LLM called suggest_partner_handoff
   * — a genuine "this needs a qualified professional" handoff, not a
   * regular answer. useReportChatFlow.ts renders this as its own
   * partner-connect card instead of a text bubble.
   */
  resolvedPartnerHandoff?: { reason: string; specialism: string }
}

/**
 * generateAnswerRemote
 * ───────────────────────
 * Real, LLM-driven version of generateAnswer. Returns both the chat
 * answer AND (when this turn resolved one) the postcode/council the
 * LLM just looked up — useReportChatFlow.ts uses that second part to
 * auto-launch the report question stepper, pre-filled, so postcode
 * is never asked twice.
 *
 * - "services" keyword check stays local (instant, no API call).
 * - Everything else goes to /api/chat/ask.
 */
export async function generateAnswerRemote(
  query: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<RemoteAnswerResult> {
  const lower = query.toLowerCase().trim()

  if (SERVICES_KEYWORDS.some(k => lower.includes(k))) {
    return { answer: { kind: 'services' } }
  }

  try {
    const res = await fetch('/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      return {
        answer: {
          kind: 'general',
          text:
            errBody?.error ??
            'Sorry, something went wrong on our end — mind trying that again in a moment?',
        },
      }
    }

    const data = await res.json()
    return {
      answer: { kind: 'general', text: data.reply ?? "Sorry, I didn't catch that — could you rephrase?" },
      resolvedPostcode: data.resolvedPostcode,
      resolvedSlots: data.resolvedSlots,
      resolvedChoice: data.resolvedChoice,
      resolvedConstraints: data.resolvedConstraints,
      resolvedPartnerHandoff: data.resolvedPartnerHandoff,
    }
  } catch {
    return {
      answer: {
        kind: 'general',
        text: "Couldn't reach the assistant just now — check your connection and try again.",
      },
    }
  }
}