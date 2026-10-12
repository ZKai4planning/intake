import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { ApiError } from './apiError'

/**
 * Central error → HTTP response mapping for every /api/auth/* route
 * handler — the Next.js API-route equivalent of the old Express
 * errorHandler.ts. Response shape is unchanged: { error: code, message }.
 *
 * Sentry capture matches the backend exactly: 4xx ApiErrors (bad OTP,
 * wrong password, not-found, etc.) are expected user-facing outcomes,
 * not bugs — skipped, or every failed login attempt becomes a Sentry
 * event. 5xx ApiErrors and anything unhandled are real failures and
 * get reported.
 */
export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      Sentry.captureException(err, { tags: { code: err.code } })
    }
    return NextResponse.json({ error: err.code, message: err.message }, { status: err.status })
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Invalid request'
    return NextResponse.json({ error: 'bad_request', message }, { status: 400 })
  }

  console.error('[auth] Unhandled error:', err)
  Sentry.captureException(err)

  const detail = err instanceof Error ? err.message : String(err)
  return NextResponse.json(
    {
      error: 'internal_error',
      message: 'Something went wrong.',
      // Only exposed outside production — lets you see the real cause
      // in the Network tab without digging through server logs.
      ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
    },
    { status: 500 }
  )
}
