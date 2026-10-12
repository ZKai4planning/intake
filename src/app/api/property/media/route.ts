export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { fetchMedia, isDemoMode } from '@/lib/server/property/engine'
import { mockMediaSvg } from '@/lib/server/property/mock'
import type { MediaKind } from '@/lib/intake/propertyTypes'

const APP_ID = /^[A-Za-z0-9_-]{4,80}$/
const KINDS: MediaKind[] = ['street-view', 'aerial']

/**
 * GET /api/property/media?app=<applicationId>&kind=street-view|aerial
 * Image proxy so engine/API keys never reach the browser. In demo mode
 * (or for demo-* application ids) it serves generated sample imagery.
 */
export async function GET(req: NextRequest) {
  const app = req.nextUrl.searchParams.get('app') ?? ''
  const kind = req.nextUrl.searchParams.get('kind') as MediaKind | null
  const label = (req.nextUrl.searchParams.get('label') ?? 'this property').slice(0, 80)

  if (!APP_ID.test(app) || !kind || !KINDS.includes(kind)) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }

  if (isDemoMode() || app.startsWith('demo-')) {
    return new NextResponse(mockMediaSvg(kind, label), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'private, max-age=300',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  try {
    const { buffer, contentType } = await fetchMedia(app, kind)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    // The <img> falls back to its own "no photo available" panel on any non-2xx.
    return NextResponse.json({ message: 'Image not available' }, { status: 404 })
  }
}
