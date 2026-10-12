import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { ApiError } from '../apiError'
import { verifyAdminToken, type AdminTokenPayload } from './adminToken'
import { ADMIN_TOKEN_COOKIE } from './adminCookies'

/**
 * Guards every /api/admin/* route except login itself. Cookie-only
 * (no Authorization header support, unlike the customer requireAuth) —
 * the admin portal is only ever used from its own browser session,
 * there's no mobile app or third-party integration that would need a
 * bearer token here.
 */
export function requireAdminAuth(): AdminTokenPayload {
  const token = cookies().get(ADMIN_TOKEN_COOKIE)?.value
  if (!token) throw ApiError.unauthorized('Not logged in to the admin portal')

  try {
    const payload = verifyAdminToken(token)
    Sentry.setUser({ id: payload.sub, email: payload.email, role: 'admin' })
    Sentry.setTag('admin_portal', true)
    return payload
  } catch {
    throw ApiError.unauthorized('Admin session expired or invalid — please log in again')
  }
}
