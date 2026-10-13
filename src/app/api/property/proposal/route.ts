export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorStatus, previewProposal } from '@/lib/server/property/engine'
import { allow } from '@/lib/server/property/rateLimit'

const schema = z.object({
  applicationId: z.string().regex(/^[A-Za-z0-9_-]{4,80}$/),
  categoryId: z.string().max(40),
  subtypeId: z.string().max(40).nullable(),
  answers: z.record(z.string().max(60), z.string().max(200)).refine((o: Record<string, string>) => Object.keys(o).length <= 60, 'Too many answers'),
  flip: z.boolean().default(false),
  /** Set only after the person pressed "Swap front / back". */
  frontBearingDeg: z.number().min(0).max(360).optional(),
})

/**
 * POST /api/property/proposal
 * Sends the person's answers to the planning engine and returns what the ENGINE computed for the
 * live preview: map layers, Map checks (neighbour overlap + title boundary), front direction.
 * Nothing about those checks is calculated here, so improving the engine improves the site with no change to this code.
 * On any failure the client falls back to its built-in local preview.
 */
export async function POST(req: NextRequest) {
  if (!allow('property-proposal', req, 60)) {
    return NextResponse.json({ message: 'Too many requests — please wait a moment.' }, { status: 429 })
  }
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  const { applicationId, frontBearingDeg, ...inp } = parsed.data
  try {
    return NextResponse.json(await previewProposal(applicationId, inp, frontBearingDeg))
  } catch (err) {
    const { status, message } = errorStatus(err)
    return NextResponse.json({ message }, { status })
  }
}
