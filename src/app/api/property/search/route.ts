export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, searchAddresses } from '@/lib/server/property/engine'
import { allow } from '@/lib/server/property/rateLimit'

/**
 * GET /api/property/search?q=
 * One search box: full postcode, partial postcode or free-text address.
 * Never errors for the type-ahead — an unavailable upstream comes back as
 * { type: 'unavailable', message } so the UI can offer manual entry.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 120)

  if (q.length < 3) {
    return NextResponse.json({ type: 'none', addresses: [], postcodes: [], demo: isDemoMode() })
  }

  if (!allow('property-search', req, 40)) {
    return NextResponse.json(
      { type: 'unavailable', addresses: [], postcodes: [], message: 'Too many searches — give it a few seconds and try again.', demo: isDemoMode() },
      { status: 429 },
    )
  }

  const result = await searchAddresses(q)
  return NextResponse.json(result, { headers: { 'Cache-Control': 'private, max-age=60' } })
}
