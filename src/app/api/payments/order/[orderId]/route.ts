export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { ApiError } from '@/lib/server/apiError'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as paymentsService from '@/lib/server/paymentsService'

// No auth on this route — matches the backend it was ported from.
// orderId is Revolut's opaque order ID (not sequential/guessable), so
// this is low-sensitivity: it only exposes status/amount/currency for
// an ID the caller already has to have gotten from create-order in the
// first place.
export async function GET(_req: Request, { params }: { params: { orderId: string } }) {
  try {
    if (!params.orderId) throw ApiError.badRequest('Order ID is required')
    const data = await paymentsService.getOrderStatus(params.orderId)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return handleRouteError(err)
  }
}
