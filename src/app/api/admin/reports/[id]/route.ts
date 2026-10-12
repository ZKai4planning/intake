export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { getReport } from '@/lib/server/admin/adminReportsService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    const report = await getReport(params.id)
    return NextResponse.json({ report })
  } catch (err) {
    return handleRouteError(err)
  }
}
