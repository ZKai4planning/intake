import type { AgentContext } from '@/types/agent'

/**
 * agentResponses.ts
 * ───────────────────
 * Mock response engine for the inline agent panel. Two entry points:
 *
 *   getOpeningTip(context)   — the proactive one-liner shown when a
 *                              question card's agent panel is first opened
 *                              (before the user types anything).
 *
 *   getReply(context, text)  — canned, context-aware reply to a free-text
 *                              question, keyed off simple keyword matching
 *                              against the row's field/guidance.
 *
 * API SWAP POINT:
 *   Replace the body of getReply with a POST to /api/agent/ask, e.g.:
 *     const res = await fetch('/api/agent/ask', {
 *       method: 'POST',
 *       body: JSON.stringify({ context, question: text }),
 *     })
 *     return (await res.json()).reply
 *   The backend route calls the Anthropic API with the same AgentContext
 *   as system context so replies stay anchored to the exact row the user
 *   is looking at, plus their answers so far for continuity.
 */

const ROW_OPENING_TIPS: Record<string, string> = {
  '002': "If you're not sure whether you need an agent, most straightforward householder applications don't require one — but if there's any conservation area, listed building, or appeal involved, having one usually pays for itself.",
  '003': "Don't have the exact address to hand? A postcode and a rough description (e.g. \"end-of-terrace, 1930s semi\") is enough for us to start.",
  '004': 'Freehold is the most common answer for a single-owner house. If there are multiple owners or a mortgage, you may need to serve an ownership certificate later — I can walk you through that when we get there.',
  '005': "I can check this for you against the local conservation area map if you give me the postcode — just ask below.",
  '006': 'Keep this simple: how big (roughly, in metres), how many storeys, and where on the property. You can always add more detail later.',
  '007': "If you're converting the property to rent it out to multiple tenants (an HMO), that's usually \"Change of use\" — and it changes which questions matter most, so it's worth getting right.",
  '008': "\"Match existing\" is the safer default for permitted development — using different materials is one of the most common reasons planners push back on householder applications.",
  '009': 'A location plan and existing/proposed elevations are the two documents almost every application needs. Photos of the site help too.',
  '010': 'Only answer "yes" here if you\'re changing where vehicles enter the site or adding parking spaces — repaving an existing driveway usually doesn\'t count.',
  '011': "If there's a tree anywhere near the works — even on a neighbour's land — it's worth flagging here. Removing or damaging a protected tree without consent carries real penalties.",
  '012': "Flood Zone 1 covers most of the country. If you're near a river, canal, or the coast, it's worth double-checking rather than guessing.",
  '013': 'Adding a heat pump, solar panels, or an EV charger? Flag it here — some of these have their own permitted development rules.',
  '014': "Pre-application advice isn't required, but for anything unusual or in a sensitive area, it can save a lot of back-and-forth later.",
  '015': "Certificate A is right if you own the whole site outright. If anyone else has an interest in the land, you'll need to notify them — I can explain the notice process.",
  '016': "Most straightforward projects don't need any of these. Only tick a box if you know it applies — otherwise leave it and we'll flag it during review.",
  '017': "This confirms the details above are accurate and that you're authorised to submit them. Take a moment to skim back through before signing.",
}

const KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['cost', 'price', 'fee', 'how much'],
    reply: "Costs vary by council and project size, so I can't quote an exact figure here — but once you finish this section, your report will include a cost estimate specific to your project.",
  },
  {
    keywords: ['how long', 'time', 'weeks', 'decision'],
    reply: 'Most householder applications get a decision within 8 weeks of being validated. Anything more complex (full planning, listed buildings) can take longer.',
  },
  {
    keywords: ['permitted development', 'pd', 'do i need permission', 'need planning'],
    reply: "Whether you need full planning permission or can rely on permitted development rights depends on the exact size, position, and any restrictions on this property — that's exactly what the rest of this form works out.",
  },
  {
    keywords: ['neighbour', 'neighbor', 'object'],
    reply: 'Neighbours are consulted as part of the application and can raise objections, but a well-documented, policy-compliant proposal is the best protection against a refusal on those grounds.',
  },
  {
    keywords: ['refuse', 'refusal', 'reject', 'appeal'],
    reply: "If an application is refused, you usually have options — amend and resubmit, or appeal. I can help you think through which fits once we know the reason for refusal.",
  },
]

export function getOpeningTip(context: AgentContext): string {
  return ROW_OPENING_TIPS[context.rowId]
    ?? `Ask me anything about "${context.field}" — I can explain what this means or suggest an answer based on what you've told us so far.`
}

export function getReply(context: AgentContext, question: string): string {
  const lower = question.toLowerCase()

  for (const entry of KEYWORD_REPLIES) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.reply
    }
  }

  // Fall back to the row's own guidance, rephrased conversationally.
  return `For "${context.field}": ${context.guidance} If you're still unsure, the safest option is to answer "Don't know" — that flags it so a consultant can confirm it for you rather than risking a wrong answer.`
}
