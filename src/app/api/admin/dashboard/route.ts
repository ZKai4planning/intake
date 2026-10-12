export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { getDashboardStats } from '@/lib/server/admin/adminDashboardService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET() {
  try {
    requireAdminAuth()
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (err) {
    return handleRouteError(err)
  }
}
