import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/map-tile?z=&x=&y=
 * ───────────────────────────
 * Server-side proxy in front of the OpenStreetMap raster tile servers,
 * used by lib/staticMap.ts to build the "Snapshot of your area" page
 * embedded in downloaded reports.
 *
 * Why a proxy rather than fetching tiles straight from the browser:
 *  1. CORS — tile.openstreetmap.org doesn't reliably send
 *     Access-Control-Allow-Origin, so an <img> loaded from it directly
 *     would taint the canvas and make canvas.toDataURL() throw. Tiles
 *     served from our own origin have no such restriction.
 *  2. OSM's tile usage policy requires a real identifying User-Agent
 *     (not a bare browser UA) and asks heavier users to run their own
 *     cache — a server route is the place to do both.
 *
 * Volume note: tile.openstreetmap.org's usage policy is for light,
 * non-bulk use — fine for "one map per downloaded report", but if
 * report volume grows meaningfully, swap TILE_HOST below for a paid
 * tile provider (MapTiler, Stadia, Mapbox, etc.) rather than scaling
 * up against the free OSM servers.
 */

const TILE_SUBDOMAINS = ['a', 'b', 'c']
const MAX_ZOOM = 19

/**
 * ?layer=streets (default) → OpenStreetMap road map
 * ?layer=aerial            → Esri World Imagery (satellite / aerial photo).
 *   Used by the intake's map view and live extension preview. Show the
 *   "Imagery © Esri, Maxar, Earthstar Geographics" attribution wherever it
 *   is displayed, and check Esri's terms for your usage/volume.
 */
type Layer = 'streets' | 'aerial'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const z = Number(searchParams.get('z'))
  const x = Number(searchParams.get('x'))
  const y = Number(searchParams.get('y'))
  const layer: Layer = searchParams.get('layer') === 'aerial' ? 'aerial' : 'streets'

  if (![z, x, y].every(Number.isInteger) || z < 0 || z > MAX_ZOOM) {
    return NextResponse.json({ error: 'invalid tile coordinates' }, { status: 400 })
  }
  const tilesPerSide = 2 ** z
  if (x < 0 || x >= tilesPerSide || y < 0 || y >= tilesPerSide) {
    return NextResponse.json({ error: 'tile out of range' }, { status: 400 })
  }

  const sub = TILE_SUBDOMAINS[(x + y) % TILE_SUBDOMAINS.length]
  const upstream =
    layer === 'aerial'
      ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
      : `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`

  let res: Response
  try {
    res = await fetch(upstream, {
      headers: {
        'User-Agent': 'AI4Planning/1.0 (report map tile; contact via ai4planning.example)',
      },
      // Tiles are static per (z,x,y) — safe to cache for a good while.
      next: { revalidate: 60 * 60 * 24 },
    })
  } catch {
    return NextResponse.json({ error: 'tile fetch failed' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'tile fetch failed' }, { status: 502 })
  }

  const bytes = await res.arrayBuffer()
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': res.headers.get('content-type') ?? (layer === 'aerial' ? 'image/jpeg' : 'image/png'),
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}