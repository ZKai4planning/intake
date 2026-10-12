export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { optionalAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as paymentsService from '@/lib/server/paymentsService'

const createOrderSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3).transform(s => s.toUpperCase()),
  merchant_order_ext_ref: z.string().optional(),
  description: z.string().optional(),
  customer_id: z.string().optional(),
  reportId: z.string().optional(),
  projectId: z.string().optional(),
})

function generateMerchantRef(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export async function POST(req: Request) {
  try {
    // Guest checkout is allowed — a logged-in user's order just also
    // gets tied to their account (userId ends up on the orders row).
    const auth = optionalAuth(req)
    const value = createOrderSchema.parse(await req.json())
    const merchantRef = value.merchant_order_ext_ref ?? generateMerchantRef()

    const order = await paymentsService.createOrder({ ...value, merchant_order_ext_ref: merchantRef }, auth?.sub)

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        publicId: order.token,
        checkoutUrl: order.checkout_url,
        status: order.status,
        merchantRef,
      },
    })
  } catch (err) {
    return handleRouteError(err)
  }
}
