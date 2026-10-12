export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, optionalAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as reportsService from '@/lib/server/reportsService'

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req)
    const reports = await reportsService.listMyReports(auth.sub)
    return NextResponse.json({ reports })
  } catch (err) {
    return handleRouteError(err)
  }
}

// Reports generate for free, no login required — same as the
// client-only flow this replaces (see reportStorage.ts). If the
// person is logged in already, the report is tied to their account
// immediately instead of waiting for a later claim.
const createReportSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
  tier: z.string().trim().min(1, 'tier is required'),
  answers: z.unknown(),
  content: z.unknown(),
})

export async function POST(req: Request) {
  try {
    const auth = optionalAuth(req)
    const body = createReportSchema.parse(await req.json())
    const ownerName = auth ? await reportsService.getUserName(auth.sub) : undefined
    const report = await reportsService.createReport({
      ...body,
      userId: auth?.sub ?? null,
      ownerEmail: auth?.email,
      ownerName,
    })
    return NextResponse.json({ report }, { status: 201 })
  } catch (err) {
    return handleRouteError(err)
  }
}
