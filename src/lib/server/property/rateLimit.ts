/**
 * Tiny in-memory sliding-window limiter for the public /api/property/*
 * routes (they sit in front of shared third-party services, and run
 * before login). Per server instance, best-effort — good enough to stop
 * a runaway type-ahead loop or casual abuse, not a substitute for a
 * real edge rate limit.
 */

const hits = new Map<string, number[]>()
const MAX_KEYS = 5000

export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return fwd || req.headers.get('x-real-ip') || 'anon'
}

/** Returns true if the request is allowed. */
export function allow(bucket: string, req: Request, limit: number, windowMs = 60_000): boolean {
  const key = `${bucket}:${clientKey(req)}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)

  if (hits.size > MAX_KEYS) {
    // Drop the oldest half rather than grow without bound.
    Array.from(hits.keys()).slice(0, MAX_KEYS / 2).forEach(k => hits.delete(k))
  }
  return true
}
