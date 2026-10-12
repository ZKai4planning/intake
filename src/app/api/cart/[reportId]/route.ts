export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as cartService from '@/lib/server/cartService'

export async function DELETE(req: Request, { params }: { params: { reportId: string } }) {
  try {
    const auth = requireAuth(req)
    await cartService.removeFromCart(auth.sub, decodeURIComponent(params.reportId))
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleRouteError(err)
  }
}
