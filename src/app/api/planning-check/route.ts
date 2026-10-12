import { NextRequest, NextResponse } from 'next/server'
import { lookupAndCheck, PlanningDataError } from '@/lib/planningData'

/**
 * GET /api/planning-check?postcode=IG6+2JX
 * ───────────────────────────────────────────
 * Server-side proxy in front of postcodes.io + planning.data.gov.uk —
 * see lib/planningData.ts for the actual calls. Client code should hit
 * this route rather than calling those services directly.
 */
export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get('postcode')

  if (!postcode) {
    return NextResponse.json({ error: 'postcode is required' }, { status: 400 })
  }

  try {
    const result = await lookupAndCheck(postcode)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof PlanningDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status === 404 ? 404 : 502 })
    }
    return NextResponse.json({ error: 'Something went wrong looking up that postcode.' }, { status: 500 })
  }
}