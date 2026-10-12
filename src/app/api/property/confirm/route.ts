export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { confirmAddress, errorStatus } from '@/lib/server/property/engine'
import { allow } from '@/lib/server/property/rateLimit'

// Same id formats the engine itself accepts: a UPRN, or an OpenStreetMap element.
const ADDRESS_ID = /^(\d{1,12}|osm:(node|way|relation):\d{1,12})$/
const UK_POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/

const schema = z.union([
  z.object({ id: z.string().regex(ADDRESS_ID) }),
  z.object({
    manual: z.object({
      line1: z.string().trim().min(1).max(80),
      line2: z.string().trim().max(80).optional(),
      town: z.string().trim().max(60).optional(),
      postcode: z.string().trim().regex(UK_POSTCODE, 'Enter a valid UK postcode'),
    }),
  }),
])

/**
 * POST /api/property/confirm   { id } | { manual: {...} }
 * The person has picked (or typed) their address: create the application
 * on the planning engine, which looks up the building, constraints,
 * council and imagery. The server re-fetches the address by id — it never
 * trusts address text sent from the browser.
 */
export async function POST(req: NextRequest) {
  if (!allow('property-confirm', req, 12)) {
    return NextResponse.json({ message: 'Too many requests — please wait a moment.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid address'
    return NextResponse.json({ message }, { status: 400 })
  }

  try {
    return NextResponse.json(await confirmAddress(parsed.data), { status: 201 })
  } catch (err) {
    const { status, message } = errorStatus(err)
    return NextResponse.json({ message }, { status })
  }
}
