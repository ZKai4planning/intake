export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { ApiError } from '@/lib/server/apiError'
import * as reportsService from '@/lib/server/reportsService'

// Public — reports view/download-gate before login relies on being
// able to fetch a report by its (unguessable) id with no auth, same
// as the localStorage version this replaces.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const report = await reportsService.getReport(params.id)
    if (!report) throw ApiError.notFound('Report not found')
    return NextResponse.json({ report })
  } catch (err) {
    return handleRouteError(err)
  }
}

// Marks the report unlocked after the (mock) checkout flow succeeds —
// see checkout/page.tsx's markReportUnlocked. No stricter auth than
// "knows the report id" here, matching the rest of that mock flow.
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const report = await reportsService.unlockReport(params.id)
    return NextResponse.json({ report })
  } catch (err) {
    return handleRouteError(err)
  }
}
