export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/server/env'
import * as paymentsService from '@/lib/server/paymentsService'
import type { WebhookPayload } from '@/lib/server/paymentsService'

/**
 * Must stay publicly reachable — no auth, and deliberately not wrapped
 * in handleRouteError's normal try/catch-and-401 pattern, since a
 * malformed/unauthenticated request here is Revolut (or an attacker)
 * hitting a webhook endpoint, not a logged-in user hitting a protected
 * route. Responds 200 immediately once the signature checks out, then
 * processes async — same pattern as the backend this was ported from.
 *
 * req.text() (not req.json()) is what makes signature verification
 * possible at all — the signature is computed over the exact raw bytes
 * Revolut sent, and re-serializing a parsed-then-stringified JSON
 * object is not guaranteed to produce byte-identical output (key
 * order, whitespace, number formatting can all differ).
 */
export async function POST(req: Request) {
  const rawBody = await req.text()

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  if (!payload.event || !payload.order_id) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
  }

  const signature = req.headers.get('revolut-signature') ?? undefined
  const timestamp = req.headers.get('revolut-request-timestamp') ?? undefined

  if (env.revolut.webhookSigningSecret) {
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 })
    }
    const valid = paymentsService.verifyRevolutWebhookSignature({ rawBody, timestamp, signatureHeader: signature })
    if (!valid) {
      // A bad signature is either an attack attempt or a misconfigured
      // secret — either way it's worth knowing about, not just a quiet 401.
      Sentry.captureMessage('Revolut webhook signature verification failed', {
        level: 'warning',
        tags: { module: 'payments', webhook: 'revolut', reason: 'bad_signature' },
        extra: { orderId: payload.order_id, event: payload.event },
      })
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }
  } else {
    console.warn(
      '[payments] REVOLUT_WEBHOOK_SIGNING_SECRET not set — accepting webhook WITHOUT signature verification. Do not run production like this.'
    )
    Sentry.captureMessage('Revolut webhook accepted without signature verification', {
      level: 'warning',
      tags: { module: 'payments', webhook: 'revolut', reason: 'no_secret_configured' },
    })
  }

  // Process async, acknowledge immediately — same as the backend this
  // was ported from. Vercel keeps the function alive until pending
  // promises settle even after the response is sent, so this isn't
  // dropped on serverless the way it might be on some other hosts.
  paymentsService.handleWebhook(payload).catch(err => {
    console.error('[payments] Webhook processing failed', { err, orderId: payload.order_id })
    Sentry.captureException(err, {
      tags: { module: 'payments', webhook: 'revolut' },
      extra: { orderId: payload.order_id, event: payload.event },
    })
  })

  return NextResponse.json({ received: true })
}
