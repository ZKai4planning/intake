export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { getOrder } from '@/lib/server/admin/adminOrdersService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    const order = await getOrder(params.id)
    return NextResponse.json({ order })
  } catch (err) {
    return handleRouteError(err)
  }
}
