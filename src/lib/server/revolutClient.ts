import crypto from 'node:crypto'
import { env } from './env'
import { ApiError } from './apiError'

/**
 * Thin wrapper around the Revolut Merchant API
 * (developer.revolut.com/docs/merchant).
 *
 * Revolut's real order response uses a field called `state` (lowercase
 * values: pending, processing, authorised, completed, cancelled,
 * failed) — not `status`. This client reads the real `state` field and
 * maps it onto the PENDING/PROCESSING/COMPLETED/FAILED status the rest
 * of this app expects (mapRevolutState below).
 */

interface RawRevolutOrder {
  id: string
  token: string
  state: string
  created_at: string
  amount: number
  currency: string
  checkout_url?: string
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

function mapRevolutState(state: string): OrderStatus {
  switch (state.toLowerCase()) {
    case 'completed': return 'COMPLETED'
    case 'authorised':
    case 'processing': return 'PROCESSING'
    case 'pending': return 'PENDING'
    case 'cancelled':
    case 'failed':
    default: return 'FAILED'
  }
}

export interface RevolutOrder {
  id: string
  token: string
  status: OrderStatus
  createdAt: string
  amount: number
  currency: string
  checkoutUrl?: string
}

function toRevolutOrder(raw: RawRevolutOrder): RevolutOrder {
  return {
    id: raw.id,
    token: raw.token,
    status: mapRevolutState(raw.state),
    createdAt: raw.created_at,
    amount: raw.amount,
    currency: raw.currency,
    checkoutUrl: raw.checkout_url,
  }
}

function headers(): Record<string, string> {
  if (!env.revolut.secretKey) {
    throw ApiError.badRequest('Payments are not configured (REVOLUT_MERCHANT_SECRET_KEY missing)', 'payments_not_configured')
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.revolut.secretKey}`,
    'Revolut-Api-Version': env.revolut.apiVersion,
  }
}

export interface CreateRevolutOrderInput {
  amount: number
  currency: string
  merchant_order_ext_ref?: string
  description?: string
  customer_id?: string
}

export async function createRevolutOrder(input: CreateRevolutOrderInput): Promise<RevolutOrder> {
  const res = await fetch(`${env.revolut.baseUrl}/api/1.0/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })

  const body = (await res.json()) as { message?: string } & Record<string, unknown>
  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? 'Revolut order creation failed', 'revolut_error')
  }
  return toRevolutOrder(body as unknown as RawRevolutOrder)
}

export async function retrieveRevolutOrder(orderId: string): Promise<RevolutOrder> {
  const res = await fetch(`${env.revolut.baseUrl}/api/1.0/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: headers(),
  })

  const body = (await res.json()) as { message?: string } & Record<string, unknown>
  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? 'Revolut order lookup failed', 'revolut_error')
  }
  return toRevolutOrder(body as unknown as RawRevolutOrder)
}

/**
 * Verifies a webhook's HMAC-SHA256 signature per Revolut's documented
 * algorithm (developer.revolut.com/docs/guides/manage-accounts/webhooks/verify-the-payload-signature):
 *   payload_to_sign = "v1." + <Revolut-Request-Timestamp> + "." + <raw body>
 *   expected         = "v1=" + hex(HMAC_SHA256(signingSecret, payload_to_sign))
 * The header can carry multiple comma-separated signatures during a
 * secret rotation window — valid if ANY of them match.
 */
export function verifyRevolutWebhookSignature(opts: {
  rawBody: string
  timestamp: string
  signatureHeader: string
}): boolean {
  if (!env.revolut.webhookSigningSecret) return false

  const payloadToSign = `v1.${opts.timestamp}.${opts.rawBody}`
  const expected = 'v1=' + crypto
    .createHmac('sha256', env.revolut.webhookSigningSecret)
    .update(payloadToSign)
    .digest('hex')

  const received = opts.signatureHeader.split(',').map(s => s.trim())
  return received.some(sig => {
    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    } catch {
      return false // different lengths, etc.
    }
  })
}