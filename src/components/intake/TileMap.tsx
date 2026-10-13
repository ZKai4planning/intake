'use client'

import React from 'react'

/**
 * TileMap
 * ────────
 * A small, dependency-free slippy map: composites map / aerial tiles (served
 * through our own /api/map-tile proxy) as <image>s inside an SVG, so shapes
 * can be drawn on top in the SAME coordinate system (viewBox 640×360, one
 * unit = one screen pixel at `zoom`).
 *
 * Tiles are fetched at up to z19 and scaled up for higher `zoom` values, so
 * a house can be shown large without needing z20 imagery.
 */

export const MAP_W = 640
export const MAP_H = 360
const TILE = 256
const MAX_TILE_ZOOM = 19

export type MapLayer = 'streets' | 'aerial'

export const LAYER_ATTRIBUTION: Record<MapLayer, string> = {
  streets: '© OpenStreetMap contributors',
  aerial: 'Imagery © Esri, Maxar, Earthstar Geographics',
}

function worldPixel(lng: number, lat: number, zoom: number) {
  const scale = TILE * 2 ** zoom
  const x = ((lng + 180) / 360) * scale
  const sin = Math.sin((lat * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  return { x, y }
}

/** lng/lat → TileMap viewBox coordinates, for a map centred on (lat0, lng0) at `zoom`. */
export function projectToView(lat0: number, lng0: number, zoom: number, lng: number, lat: number): { x: number; y: number } {
  const c = worldPixel(lng0, lat0, zoom)
  const p = worldPixel(lng, lat, zoom)
  return { x: MAP_W / 2 + (p.x - c.x), y: MAP_H / 2 + (p.y - c.y) }
}

interface Props {
  lat: number
  lng: number
  layer: MapLayer
  /** Display zoom (can exceed 19 — tiles are scaled). */
  zoom?: number
  /** Drop a pin on the centre (used for the plain map view). */
  pin?: boolean
  label?: string
  /** Overlay drawn above the tiles, in viewBox coordinates. */
  children?: React.ReactNode
  svgRef?: React.Ref<SVGSVGElement>
  svgProps?: React.SVGProps<SVGSVGElement>
  className?: string
}

export function TileMap({ lat, lng, layer, zoom = 18, pin, label, children, svgRef, svgProps, className }: Props) {
  const tz = Math.min(zoom, MAX_TILE_ZOOM)
  const s = 2 ** (zoom - tz) // upscale factor for tiles
  const tile = TILE * s
  const c = worldPixel(lng, lat, tz)
  const originX = c.x * s - MAP_W / 2
  const originY = c.y * s - MAP_H / 2
  const n = 2 ** tz

  const tiles: { key: string; href: string; x: number; y: number }[] = []
  for (let tx = Math.floor(originX / tile); tx <= Math.floor((originX + MAP_W) / tile); tx++) {
    for (let ty = Math.floor(originY / tile); ty <= Math.floor((originY + MAP_H) / tile); ty++) {
      if (ty < 0 || ty >= n) continue
      const wx = ((tx % n) + n) % n
      tiles.push({
        key: `${tx}/${ty}`,
        href: `/api/map-tile?z=${tz}&x=${wx}&y=${ty}&layer=${layer}`,
        x: tx * tile - originX,
        y: ty * tile - originY,
      })
    }
  }

  const attribution = LAYER_ATTRIBUTION[layer]

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      role="img"
      aria-label={label ?? (layer === 'aerial' ? 'Aerial view of the property' : 'Map of the property')}
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', background: layer === 'aerial' ? '#1B2A1F' : '#E9ECF2', touchAction: 'none' }}
      {...svgProps}
    >
      {tiles.map(t => (
        <image key={t.key} href={t.href} x={t.x} y={t.y} width={tile + 0.6} height={tile + 0.6} preserveAspectRatio="none" />
      ))}

      {pin && (
        <g transform={`translate(${MAP_W / 2} ${MAP_H / 2})`} pointerEvents="none">
          <path d="M0 0 C-9 -12 -14 -22 0 -32 C14 -22 9 -12 0 0Z" fill="#E11D2E" stroke="#fff" strokeWidth="2" />
          <circle cx="0" cy="-21" r="4.5" fill="#fff" />
        </g>
      )}

      {children}

      <g pointerEvents="none">
        <rect x="0" y={MAP_H - 18} width={MAP_W} height="18" fill="rgba(10,14,26,0.62)" />
        <text x="8" y={MAP_H - 5.5} fontSize="11" fill="#E8F0FF" fontFamily="DM Sans, Arial, sans-serif">{attribution}</text>
      </g>
    </svg>
  )
}
