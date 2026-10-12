export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as reportsService from '@/lib/server/reportsService'

const claimSchema = z.object({
  ids: z.array(z.string().trim().min(1)).max(200),
})

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req)
    const { ids } = claimSchema.parse(await req.json())
    const ownerName = (await reportsService.getUserName(auth.sub)) ?? ''
    const reports = await reportsService.claimReports(auth.sub, auth.email, ownerName, ids)
    return NextResponse.json({ reports })
  } catch (err) {
    return handleRouteError(err)
  }
}
