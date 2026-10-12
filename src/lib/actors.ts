import type { Actor, ActorId, ActorSuggestion } from '@/types'
import { hasWholeWord } from './textMatch'


export const ACTORS: Actor[] = [
  {
    id: 'homeowner',
    emoji: '🏠',
    label: 'Homeowner',
    description: 'Working on my own home',
    keywords: ['homeowner', 'home owner', 'my house', 'my home', 'resident'],
    workspaceType: 'consumer',
  },
  {
    id: 'landlord',
    emoji: '🔑',
    label: 'Landlord',
    description: 'Renting out property',
    keywords: ['landlord', 'landlady', 'rental', 'rent out', 'tenant', 'letting'],
    workspaceType: 'consumer',
  },
  {
    id: 'developer',
    emoji: '🏗️',
    label: 'Developer',
    description: 'Building or developing sites',
    keywords: ['developer', 'development', 'house builder', 'housebuilder', 'site'],
    workspaceType: 'professional',
  },
  {
    id: 'builder',
    emoji: '👷',
    label: 'Builder',
    description: 'Carrying out construction work',
    keywords: ['builder', 'construction', 'contractor', 'building firm', 'new build'],
    workspaceType: 'professional',
  },
  {
    id: 'consultant',
    emoji: '💼',
    label: 'Consultant',
    description: 'Advising clients on planning',
    keywords: ['consultant', 'planning consultant', 'advisor', 'adviser', 'agent'],
    workspaceType: 'professional',
  },
  {
    id: 'architect',
    emoji: '📐',
    label: 'Architect',
    description: 'Designing for clients',
    keywords: ['architect', 'architectural', 'designer', 'draughtsman', 'draftsman'],
    workspaceType: 'professional',
  },
  {
    id: 'business',
    emoji: '🏢',
    label: 'Business',
    description: 'Company or enterprise account',
    keywords: ['business', 'company', 'enterprise', 'corporate', 'firm'],
    workspaceType: 'enterprise',
  },
]

export function getActor(id: ActorId): Actor | null {
  return ACTORS.find(a => a.id === id) ?? null
}

// ── Levenshtein distance (typo tolerance) ────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

const FUZZY_THRESHOLD = 0.82
const MIN_TOKEN_LENGTH = 4

/**
 * detectActor
 * ────────────
 * 1. Exact whole-word match (any keyword, including multi-word phrases)
 *    → confidence 0.9, source: 'explicit'
 * 2. Only if NO exact match was found anywhere in the query: fuzzy
 *    single-word token match → confidence scaled by similarity,
 *    source: 'fuzzy', correctedFrom: the original token
 *
 * If multiple DIFFERENT actors tie on the top exact-match confidence,
 * that's a genuinely ambiguous query (two actor keywords both present)
 * — logged as a warning so it surfaces during development rather than
 * silently picking whichever actor happened to be first in the array.
 */
export function detectActor(query: string): ActorSuggestion | null {
  const lower = query.toLowerCase().trim()
  if (lower.length < 3) return null

  // ── Pass 1: exact whole-word match ──────────────────────────────
  const exactMatches: ActorSuggestion[] = []
  for (const actor of ACTORS) {
    for (const keyword of actor.keywords) {
      if (hasWholeWord(lower, keyword)) {
        exactMatches.push({
          actorId: actor.id,
          label: actor.label,
          confidence: 0.9,
          wasCorrected: false,
        })
        break // one match per actor is enough, move to next actor
      }
    }
  }

  if (exactMatches.length > 0) {
    const distinctActors = new Set(exactMatches.map(m => m.actorId))
    if (distinctActors.size > 1) {
      console.warn(
        `[detectActor] Ambiguous query "${query}" matched multiple actors:`,
        Array.from(distinctActors)
      )
    }
    return exactMatches[0]
  }

  // ── Pass 2: fuzzy single-word token match (fallback only) ───────
  let bestFuzzy: ActorSuggestion | null = null
  const tokens = lower.split(/\s+/)

  for (const actor of ACTORS) {
    for (const keyword of actor.keywords) {
      if (keyword.includes(' ')) continue // fuzzy pass is single-word only

      for (const token of tokens) {
        if (token.length < MIN_TOKEN_LENGTH) continue

        const score = similarity(token, keyword)
        if (score >= FUZZY_THRESHOLD) {
          const candidate: ActorSuggestion = {
            actorId: actor.id,
            label: actor.label,
            confidence: score,
            wasCorrected: true,
            correctedFrom: token,
          }
          if (!bestFuzzy || candidate.confidence > bestFuzzy.confidence) bestFuzzy = candidate
        }
      }
    }
  }

  return bestFuzzy
}