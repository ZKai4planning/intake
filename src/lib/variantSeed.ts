/**
 * variantSeed.ts
 * ────────────────
 * Deterministic "pick a phrasing" helper used by report.ts and
 * reportContent.ts so that two reports generated from identical inputs
 * (same postcode, same constraints, same tier) don't come out as
 * byte-identical documents.
 *
 * This is NOT security — it's a light anti-piracy measure: a report
 * that reads slightly differently for every recipient is harder to
 * pass off wholesale as "the" report for an address, and any copy
 * that leaks can be traced back to the seed (owner + report id) that
 * produced its exact phrasing.
 *
 * Deterministic on purpose: the SAME seed always yields the SAME
 * pick, so re-downloading your own report never changes its wording —
 * only different owners/reports diverge.
 */

/** Tiny, fast, dependency-free string hash (FNV-1a, 32-bit). */
export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Deterministically picks one option from a non-empty list. */
export function pickVariant<T>(seed: string, salt: string, options: readonly T[]): T {
  if (options.length === 0) throw new Error('pickVariant: options must not be empty')
  const index = hashSeed(`${seed}::${salt}`) % options.length
  return options[index]
}

/** Deterministically reorders a list — same seed+salt always gives the same order. */
export function shuffleDeterministic<T>(seed: string, salt: string, items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = hashSeed(`${seed}::${salt}::${i}`) % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** A short, URL-safe random seed for a freshly generated report/document. */
export function randomSeed(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}
