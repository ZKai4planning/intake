export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { listCartItems } from '@/lib/server/admin/adminCartService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET(req: Request) {
  try {
    requireAdminAuth()
    const { searchParams } = new URL(req.url)
    const result = await listCartItems({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    })
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
