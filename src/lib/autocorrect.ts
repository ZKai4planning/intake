/**
 * autocorrect.ts
 * ──────────────
 * Word-level fuzzy correction, autocorrect-on-space.
 *
 * Two layers:
 *  1. COMMON_TYPOS — exact lookup for very short, extremely common
 *     words (am, teh, hte, etc). These are too short for safe
 *     Levenshtein fuzzy-matching (2-3 letter words collide with too
 *     many other valid 2-3 letter words), so they're handled as a
 *     direct typo->correction map instead.
 *  2. Fuzzy vocabulary match — Levenshtein distance against a mixed
 *     vocabulary of domain words + common general English words,
 *     for words 3+ letters.
 */

// Exact typo -> correction. Add to this list as new common mistakes
// show up; deliberately NOT fuzzy-matched since 2-3 letter words are
// too ambiguous for edit-distance to be reliable (e.g. "ma" is 1 edit
// from "am", "my", "ma'am", "ms" alike).
const COMMON_TYPOS: Record<string, string> = {
  ma: 'am',
  i: 'I',
  teh: 'the',
  hte: 'the',
  nad: 'and',
  adn: 'and',
  taht: 'that',
  thsi: 'this',
  wnat: 'want',
  wnt: 'want',
  cna: 'can',
  fo: 'of',
  ot: 'to',
  ist: 'is',
  si: 'is',
  yuo: 'you',
  ar: 'are',
  fro: 'for',
}

// General English words common enough in this app's input ("I am a
// homeowner", "I want to build...") that typos on them are worth
// fuzzy-correcting alongside the domain vocabulary.
export const GENERAL_WORDS = [
  'am', 'is', 'are', 'was', 'were', 'want', 'need', 'have', 'has',
  'the', 'and', 'for', 'with', 'this', 'that', 'you', 'your', 'about',
  'looking', 'planning', 'help', 'please', 'house', 'property',
]

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const al = a.length
  const bl = b.length
  if (al === 0) return bl
  if (bl === 0) return al

  const matrix: number[][] = Array.from({ length: al + 1 }, () =>
    new Array(bl + 1).fill(0)
  )

  for (let i = 0; i <= al; i++) matrix[i][0] = i
  for (let j = 0; j <= bl; j++) matrix[0][j] = j

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  return matrix[al][bl]
}

function maxAllowedDistance(wordLength: number): number {
  if (wordLength <= 3) return 1
  if (wordLength <= 6) return 2
  return 3
}

export function correctWord(word: string, vocabulary: string[]): string {
  const lower = word.toLowerCase()

  // Layer 1: exact common-typo lookup (works even for 2-letter words)
  if (COMMON_TYPOS[lower]) return COMMON_TYPOS[lower]

  // Layer 2: fuzzy vocabulary match (3+ letter words only)
  if (lower.length < 3) return word
  if (vocabulary.includes(lower)) return word

  let best: { candidate: string; distance: number } | null = null

  for (const candidate of vocabulary) {
    const distance = levenshtein(lower, candidate)
    const threshold = maxAllowedDistance(Math.max(lower.length, candidate.length))
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { candidate, distance }
    }
  }

  return best ? best.candidate : word
}

export function autocorrectOnSpace(query: string, vocabulary: string[]): string {
  if (!query.endsWith(' ')) return query

  const trimmed = query.slice(0, -1)
  if (!trimmed) return query

  const lastSpaceIdx = trimmed.lastIndexOf(' ')
  const lastWord  = lastSpaceIdx === -1 ? trimmed : trimmed.slice(lastSpaceIdx + 1)
  const prefix    = lastSpaceIdx === -1 ? '' : trimmed.slice(0, lastSpaceIdx + 1)

  if (!lastWord) return query

  const corrected = correctWord(lastWord, vocabulary)
  if (corrected === lastWord) return query
  if (corrected.toLowerCase() === lastWord.toLowerCase() && corrected === lastWord) return query

  return `${prefix}${corrected} `
}