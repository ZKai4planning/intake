/**
 * staticMap.ts
 * ──────────────
 * Client-side static map renderer for the PDF's "Snapshot of your
 * area" page. Composites OpenStreetMap tiles — fetched through our own
 * /api/map-tile proxy, see that route for why — plus a subject-property
 * pin onto an offscreen canvas, and returns a PNG data URL sized for
 * PdfImagePage (see lib/pdf.ts).
 *
 * Tile math is the standard Web Mercator slippy-map projection (the
 * same formulas Leaflet/OSM use), not anything OSM-specific — swapping
 * the tile source in /api/map-tile/route.ts for another XYZ provider
 * wouldn't require touching this file.
 */

const TILE_SIZE = 256

export interface StaticMapResult {
  dataUrl: string
  widthPx: number
  heightPx: number
}

function worldPixel(longitude: number, latitude: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom
  const x = ((longitude + 180) / 360) * scale
  const sinLat = Math.sin((latitude * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  return { x, y }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`failed to load ${src}`))
    img.src = src
  })
}

function drawSubjectPin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const r = 11
  ctx.save()
  ctx.translate(x, y) // (x, y) is the pin's tip — the actual coordinate
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(-r, -r * 1.3, -r * 1.5, -r * 2.6, 0, -r * 3.1)
  ctx.bezierCurveTo(r * 1.5, -r * 2.6, r, -r * 1.3, 0, 0)
  ctx.closePath()
  ctx.fillStyle = '#135BEC'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, -r * 1.9, r * 0.55, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()
}

/**
 * Renders a static map centred on `center`, `widthPx`×`heightPx`, with
 * a pin marking the centre. `zoom` follows standard slippy-map zoom
 * levels — 16 (the default) is roughly a few streets across, a
 * reasonable "snapshot of the area" view for a single property.
 *
 * Never throws on a missing/slow individual tile — that tile is just
 * left blank rather than failing the whole map, since a mostly-good
 * map is far more useful in a downloaded report than none at all.
 */
export async function renderStaticMap(opts: {
  center: { latitude: number; longitude: number }
  widthPx?: number
  heightPx?: number
  zoom?: number
}): Promise<StaticMapResult> {
  const widthPx = opts.widthPx ?? 900
  const heightPx = opts.heightPx ?? 520
  const zoom = opts.zoom ?? 16
  const tilesPerSide = 2 ** zoom

  const centerPx = worldPixel(opts.center.longitude, opts.center.latitude, zoom)
  const originX = centerPx.x - widthPx / 2
  const originY = centerPx.y - heightPx / 2

  const tileMinX = Math.floor(originX / TILE_SIZE)
  const tileMinY = Math.floor(originY / TILE_SIZE)
  const tileMaxX = Math.floor((originX + widthPx) / TILE_SIZE)
  const tileMaxY = Math.floor((originY + heightPx) / TILE_SIZE)

  const canvas = document.createElement('canvas')
  canvas.width = widthPx
  canvas.height = heightPx
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#eef1f6' // shows through if a tile fails to load
  ctx.fillRect(0, 0, widthPx, heightPx)

  const fetches: Promise<void>[] = []
  for (let tx = tileMinX; tx <= tileMaxX; tx++) {
    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      if (ty < 0 || ty >= tilesPerSide) continue // no tiles past the poles
      const wrappedX = ((tx % tilesPerSide) + tilesPerSide) % tilesPerSide // wrap across the antimeridian
      const drawX = tx * TILE_SIZE - originX
      const drawY = ty * TILE_SIZE - originY
      fetches.push(
        loadImage(`/api/map-tile?z=${zoom}&x=${wrappedX}&y=${ty}`)
          .then(img => { ctx.drawImage(img, drawX, drawY, TILE_SIZE, TILE_SIZE) })
          .catch(() => { /* leave that tile blank */ })
      )
    }
  }
  await Promise.all(fetches)

  drawSubjectPin(ctx, widthPx / 2, heightPx / 2)

  return { dataUrl: canvas.toDataURL('image/png'), widthPx, heightPx }
}