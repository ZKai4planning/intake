/**
 * textMatch.ts
 * ─────────────
 * Shared whole-word substring matching, used by both actors.ts
 * (text-detection) and goalActorMap.ts (goal->actor inference).
 * Previously duplicated in both files — now a single source of truth.
 */

/** Escapes a string for safe use inside a RegExp. */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * True if `word` (or multi-word phrase) appears in `haystack` as a
 * whole word/phrase — not as a substring inside an unrelated word.
 * e.g. hasWholeWord("extension", "tenant") -> false
 *      hasWholeWord("I am a tenant", "tenant") -> true
 */
export function hasWholeWord(haystack: string, word: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`)
  return pattern.test(haystack)
}