export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { listBookings } from '@/lib/server/admin/adminBookingsService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET(req: Request) {
  try {
    requireAdminAuth()
    const { searchParams } = new URL(req.url)
    const result = await listBookings({
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    })
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
