export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as cartService from '@/lib/server/cartService'

const addToCartSchema = z.object({
  reportId: z.string().trim().min(1, 'reportId is required'),
})

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req)
    const items = await cartService.getCart(auth.sub)
    return NextResponse.json({ items, total: cartService.cartTotal(items) })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req)
    const { reportId } = addToCartSchema.parse(await req.json())
    const item = await cartService.addToCart(auth.sub, reportId)
    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    return handleRouteError(err)
  }
}
