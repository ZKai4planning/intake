import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { ApiError } from './apiError'
import { verifyAccessToken, type AuthTokenPayload } from './token'
import { ACCESS_TOKEN_COOKIE } from './cookies'

export type { AuthTokenPayload }

/**
 * Ported from the backend's requireAuth Express middleware, adapted to
 * a plain function since Next.js route handlers don't have Express's
 * middleware chain. Call it at the top of any route that needs a
 * logged-in user — it throws ApiError.unauthorized() on failure, which
 * handleRouteError.ts turns into a clean 401.
 *
 * Checks the `Authorization: Bearer <token>` header first (pass `req`
 * to enable that), then falls back to the httpOnly accessToken cookie
 * set by verify-otp — same precedence as the original middleware.
 */
export function requireAuth(req?: Request): AuthTokenPayload {
  const token = extractToken(req)
  if (!token) throw ApiError.unauthorized('No access token provided')

  try {
    const payload = verifyAccessToken(token)
    tagSentryUser(payload) // so any error captured for the rest of this request shows who hit it
    return payload
  } catch {
    throw ApiError.unauthorized('Invalid or expired token')
  }
}

function extractToken(req?: Request): string | null {
  const header = req?.headers.get('authorization')
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length)
  return cookies().get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

/**
 * Attaches the user if a valid token is present, but never rejects.
 * Ported from the backend's optionalAuth — used by routes usable both
 * logged-in and anonymous, e.g. payments/create-order (a guest can
 * check out; a logged-in user's order just also gets tied to their
 * account).
 */
export function optionalAuth(req?: Request): AuthTokenPayload | null {
  const token = extractToken(req)
  if (!token) return null

  try {
    const payload = verifyAccessToken(token)
    tagSentryUser(payload)
    return payload
  } catch {
    return null // treated as anonymous, same as the backend
  }
}

function tagSentryUser(payload: AuthTokenPayload) {
  Sentry.setUser({ id: payload.sub, email: payload.email, role: payload.role })
}
