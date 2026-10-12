export const runtime = 'nodejs'
// Reads request.url per-request (the `days` query param) — force
// dynamic explicitly rather than letting Next's build-time static
// probe discover that by throwing a control-flow error our own
// try/catch would otherwise swallow and misreport as a real failure.
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError } from '@/lib/server/apiError'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { getAvailability } from '@/lib/server/consultantService'

const availabilityQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(60).optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = availabilityQuerySchema.safeParse({ days: searchParams.get('days') ?? undefined })
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues.map(i => i.message).join('; '), 'validation_error')
    }

    const availability = await getAvailability(parsed.data.days)
    return NextResponse.json({ availability })
  } catch (err) {
    return handleRouteError(err)
  }
}
