import * as Sentry from '@sentry/nextjs'
import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { createRevolutOrder, retrieveRevolutOrder, verifyRevolutWebhookSignature } from './revolutClient'

export { verifyRevolutWebhookSignature }

export interface CreateOrderInput {
  amount: number // minor currency units (e.g. 1000 = £10.00) — trusts the caller, same as the backend this was ported from; the checkout UI is expected to be the thing computing this correctly (see reportTierCatalogue.ts for the one place that IS server-authoritative: cart pricing)
  currency: string
  merchant_order_ext_ref?: string
  description?: string
  customer_id?: string
  reportId?: string
  projectId?: string
}

export interface CreateOrderResult {
  id: string
  checkout_url: string
  token: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  created_at: string
  amount: number
  currency: string
}

function generateMerchantRef(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** POST /create-order and POST /create-embedded-order both call this — same order, the route just decides whether to surface checkout_url or token to the frontend. */
export async function createOrder(input: CreateOrderInput, userId?: string): Promise<CreateOrderResult> {
  const merchantRef = input.merchant_order_ext_ref ?? generateMerchantRef()

  const revolutOrder = await createRevolutOrder({
    amount: input.amount,
    currency: input.currency,
    merchant_order_ext_ref: merchantRef,
    description: input.description,
    customer_id: input.customer_id,
  })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('orders').insert({
    user_id: userId ?? null,
    revolut_order_id: revolutOrder.id,
    revolut_order_token: revolutOrder.token,
    merchant_order_ref: merchantRef,
    checkout_url: revolutOrder.checkoutUrl,
    amount: input.amount,
    currency: input.currency,
    status: revolutOrder.status,
    description: input.description,
    report_id: input.reportId,
    project_id: input.projectId,
  })
  if (error) {
    // The Revolut order already exists at this point — losing the local
    // row means the webhook won't find anything to reconcile against,
    // so this is worth knowing about even though it's not user-facing.
    Sentry.captureException(error, { tags: { module: 'payments' }, extra: { revolutOrderId: revolutOrder.id } })
    throw new ApiError(500, 'Failed to record your order', 'order_create_failed')
  }

  return {
    id: revolutOrder.id,
    checkout_url: revolutOrder.checkoutUrl ?? '',
    token: revolutOrder.token,
    status: revolutOrder.status,
    created_at: revolutOrder.createdAt,
    amount: revolutOrder.amount,
    currency: revolutOrder.currency,
  }
}

export interface WebhookPayload {
  event: string
  order_id: string
  merchant_order_ext_ref?: string
  status: string
  amount?: number
  currency?: string
  timestamp: string
}

/**
 * Called from the webhook route after signature verification. Updates
 * our Order row and, on a completed order, unlocks whatever it was
 * paying for. Idempotent: re-processing the same event (Revolut does
 * retry/redeliver) just re-applies the same state, not a duplicate unlock.
 */
export async function handleWebhook(payload: WebhookPayload): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, report_id')
    .eq('revolut_order_id', payload.order_id)
    .maybeSingle()
  if (findError) throw new ApiError(500, 'Failed to look up order for webhook', 'order_lookup_failed')

  if (!order) {
    console.warn('[payments] Webhook for unknown order_id, ignoring', { orderId: payload.order_id })
    return
  }

  const status = mapWebhookEventToStatus(payload.event, payload.status)
  await supabase.from('orders').update({ status }).eq('id', order.id)

  if (status === 'COMPLETED' && order.report_id) {
    const { error: unlockError } = await supabase
      .from('reports')
      .update({ unlocked_at: new Date().toISOString() })
      .eq('id', order.report_id)
    if (unlockError) {
      console.warn('[payments] Order completed but linked report no longer exists', { reportId: order.report_id })
    }
  }
}

function mapWebhookEventToStatus(event: string, fallbackStatus: string): string {
  const e = event.toUpperCase()
  if (e.includes('COMPLETED')) return 'COMPLETED'
  if (e.includes('FAILED') || e.includes('CANCELLED') || e.includes('DECLINED')) return 'FAILED'
  if (e.includes('AUTHORISED') || e.includes('PROCESSING')) return 'PROCESSING'
  return fallbackStatus.toUpperCase() || 'PENDING'
}

/** GET /order/:orderId — polling backup for missed/delayed webhooks. Re-fetches live from Revolut rather than trusting our possibly-stale row, then reconciles it. */
export async function getOrderStatus(revolutOrderId: string): Promise<{ id: string; status: string; amount: number; currency: string }> {
  const supabase = getSupabaseAdmin()

  const { data: local, error: findError } = await supabase
    .from('orders')
    .select('id, status, report_id')
    .eq('revolut_order_id', revolutOrderId)
    .maybeSingle()
  if (findError) throw new ApiError(500, 'Failed to look up order', 'order_lookup_failed')
  if (!local) throw ApiError.notFound('Order not found')

  const live = await retrieveRevolutOrder(revolutOrderId)

  if (live.status !== local.status) {
    await supabase.from('orders').update({ status: live.status }).eq('id', local.id)

    if (live.status === 'COMPLETED' && local.report_id) {
      await supabase.from('reports').update({ unlocked_at: new Date().toISOString() }).eq('id', local.report_id)
    }
  }

  return { id: live.id, status: live.status, amount: live.amount, currency: live.currency }
}
