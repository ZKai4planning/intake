'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPinOff, RotateCw, Repeat2, FlipHorizontal2, Move } from 'lucide-react'
import { cn } from '@/lib/cn'
import { buildPreview, centroid, hasPreview, metresPerPixel, type Pt } from '@/lib/intake/footprint'
import { deriveSite, type Site } from '@/lib/intake/site'
import { summariseProject } from '@/lib/intake/projectTypes'
import type { IntakeMore, IntakePlanning, IntakeProperty } from '@/lib/intake/types'
import { MAP_H, MAP_W, TileMap, type MapLayer } from './TileMap'

const ZOOM = 20

interface Props {
  property: IntakeProperty | null
  planning: IntakePlanning
  more: IntakeMore
  /** Smaller version for the review card. */
  compact?: boolean
  className?: string
}

/**
 * Live plan-view preview of the proposal on the real aerial photo / map.
 * Redraws as the person answers the questions underneath it.
 *
 * The house outline is an estimate, so the person can rotate it, swap
 * front/back, flip the side and drag it into place.
 */
export function ExtensionPreview({ property, planning, more, compact, className }: Props) {
  const [layer, setLayer] = useState<MapLayer>('aerial')
  const [bearing, setBearing] = useState(180) // direction the FRONT of the house faces
  const [flip, setFlip] = useState(false)
  const [offset, setOffset] = useState<Pt>({ x: 0, y: 0 }) // metres
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  // Real building outline + road direction from OpenStreetMap. 'loading' → 'ready' (site or null → estimate).
  const [lookup, setLookup] = useState<'loading' | 'ready'>('loading')
  const [site, setSite] = useState<Site | null>(null)
  const lat = property?.lat
  const lng = property?.lng

  useEffect(() => {
    if (lat == null || lng == null) return
    const ctl = new AbortController()
    setLookup('loading')
    setSite(null)
    setOffset({ x: 0, y: 0 })
    fetch(`/api/property/building?lat=${lat}&lng=${lng}`, { signal: ctl.signal })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { outline: { lat: number; lng: number }[] | null; roads: { lat: number; lng: number }[][] } | null) => {
        const found = d?.outline ? deriveSite({ lat, lng }, d.outline, d.roads ?? []) : null
        setSite(found)
        if (found) setBearing(Math.round(found.bearing))
        setLookup('ready')
      })
      .catch(() => { if (!ctl.signal.aborted) setLookup('ready') })
    return () => ctl.abort()
  }, [lat, lng])

  const model = useMemo(
    () => (lookup === 'ready' ? buildPreview(planning.categoryId, more.subtypeId, more.answers, bearing, flip, site) : null),
    [lookup, planning.categoryId, more.subtypeId, more.answers, bearing, flip, site],
  )

  if (!hasPreview(planning.categoryId, more.subtypeId)) return null

  if (!property || property.lat == null || property.lng == null) {
    return (
      <div className={cn('flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-[13px] text-[#A8B8D8]', className)}>
        <MapPinOff className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
        <p>We couldn&apos;t get a map position for this address, so the live preview isn&apos;t available. You can still continue — we&apos;ll check the plans with you later.</p>
      </div>
    )
  }

  const mpp = metresPerPixel(lat as number, ZOOM)
  const toPx = (p: Pt) => ({ x: MAP_W / 2 + (p.x + offset.x) / mpp, y: MAP_H / 2 + (p.y + offset.y) / mpp })
  const path = (pts: Pt[]) => pts.map((p, i) => { const q = toPx(p); return `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}` }).join(' ') + 'Z'

  const summary = summariseProject(planning.categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)
  const showSideFlip = more.subtypeId === 'side' || more.subtypeId === 'wrap' || (more.subtypeId === 'garage' && more.answers['gar.attached'] === 'attached')

  // Dragging moves the whole drawing (house + proposal) over the photo.
  function pointerPos(e: React.PointerEvent): Pt | null {
    const el = svgRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * MAP_W, y: ((e.clientY - r.top) / r.height) * MAP_H }
  }
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = pointerPos(e)
    if (!p) return
    drag.current = p
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return
    const p = pointerPos(e)
    if (!p) return
    const dx = (p.x - drag.current.x) * mpp
    const dy = (p.y - drag.current.y) * mpp
    drag.current = p
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
  }
  const onUp = () => { drag.current = null }

  // 5 m scale bar
  const barPx = 5 / mpp
  // Label sits just outside the drawing (above it, or below if there's no room) so it never hides the shapes.
  const labelW = model ? Math.min(model.label.length * 6.6 + 16, MAP_W - 16) : 0
  let labelX = 0
  let labelY = 0
  if (model) {
    const all = [...model.existing, ...model.proposed.flat()].map(toPx)
    const minY = Math.min(...all.map(p => p.y))
    const maxY = Math.max(...all.map(p => p.y))
    const cx = centroid(all)
    labelX = Math.max(labelW / 2 + 6, Math.min(MAP_W - labelW / 2 - 6, cx.x))
    labelY = minY - 20 >= 16 ? minY - 20 : Math.min(MAP_H - 44, maxY + 20)
  }

  const tool = 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-[#A8B8D8] transition-colors hover:border-white/25 hover:text-[#E8F0FF]'

  return (
    <div className={cn('rounded-xl border border-white/[0.10] bg-[#0F1525]', className)} data-testid="extension-preview">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#00D4FF]">Live preview</p>
        <div className="flex rounded-full border border-white/10 bg-[#0A0E1A]/75 p-0.5">
          {([['aerial', 'Aerial'], ['streets', 'Map']] as const).map(([k, text]) => (
            <button
              key={k}
              type="button"
              onClick={() => setLayer(k)}
              aria-pressed={layer === k}
              className={cn('rounded-full px-3 py-1 text-[12px] font-medium transition-colors', layer === k ? 'bg-[#135BEC] text-white' : 'text-[#A8B8D8] hover:text-white')}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5 overflow-hidden px-3.5">
        <div className={cn('relative overflow-hidden rounded-lg border border-white/10', compact && 'max-h-[220px]')}>
          <TileMap
            lat={lat as number}
            lng={lng as number}
            layer={layer}
            zoom={ZOOM}
            svgRef={svgRef}
            svgProps={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, style: { cursor: 'grab', display: 'block', width: '100%', height: 'auto', touchAction: 'none', background: layer === 'aerial' ? '#1B2A1F' : '#E9ECF2' } }}
          >
            {lookup === 'loading' && (
              <g pointerEvents="none">
                <rect x={MAP_W / 2 - 110} y={MAP_H / 2 - 14} width="220" height="28" rx="14" fill="rgba(10,14,26,0.82)" />
                <text x={MAP_W / 2} y={MAP_H / 2 + 4} textAnchor="middle" fontSize="12" fill="#E8F0FF" fontFamily="DM Sans, Arial, sans-serif">Finding your house outline…</text>
              </g>
            )}
            {model && (
              <g pointerEvents="none">
                {/* Existing house — red dashed */}
                <path d={path(model.existing)} fill="rgba(225,29,46,0.10)" stroke="#E11D2E" strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round" />
                {/* Proposal — blue */}
                {model.proposed.map((poly, i) => (
                  <path key={i} d={path(poly)} fill="rgba(59,130,246,0.55)" stroke="#60A5FA" strokeWidth="2.5" strokeLinejoin="round" />
                ))}
                {(
                  <g transform={`translate(${labelX} ${labelY})`}>
                    <rect x={-labelW / 2} y="-11" width={labelW} height="22" rx="11" fill="rgba(10,14,26,0.82)" stroke="rgba(96,165,250,0.6)" />
                    <text textAnchor="middle" y="4" fontSize="11.5" fontWeight="600" fill="#fff" fontFamily="DM Sans, Arial, sans-serif">{model.label}</text>
                  </g>
                )}
              </g>
            )}

            {/* North arrow + 5 m scale bar */}
            <g pointerEvents="none">
              <g transform={`translate(${MAP_W - 26} 30)`}>
                <circle r="15" fill="rgba(10,14,26,0.7)" />
                <path d="M0 -6 L4.5 8 L0 5 L-4.5 8Z" fill="#fff" />
                <text y="-8.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="DM Sans, Arial, sans-serif">N</text>
              </g>
              <g transform={`translate(14 ${MAP_H - 34})`}>
                <rect x="-6" y="-14" width={barPx + 40} height="24" rx="6" fill="rgba(10,14,26,0.7)" />
                <path d={`M0 0 H${barPx}`} stroke="#fff" strokeWidth="3" />
                <path d={`M0 -5 V5 M${barPx} -5 V5`} stroke="#fff" strokeWidth="2" />
                <text x={barPx + 6} y="4" fontSize="11" fill="#fff" fontFamily="DM Sans, Arial, sans-serif">5 m</text>
              </g>
            </g>
          </TileMap>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-3.5 pt-2.5 text-[12.5px] text-[#A8B8D8]">
        <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-[3px] border-2 border-dashed border-[#E11D2E]" />Existing house</span>
        <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-[3px] border-2 border-[#60A5FA] bg-[#3B82F6]/60" />Your proposal</span>
      </div>

      {!compact && (
        <>
          <p className="px-3.5 pt-2 text-[12px] leading-snug text-[#5A6A8A]">
            {model && !model.complete ? 'Enter the size below and the blue shape updates. ' : ''}
            {site
              ? <>Outline taken from the building on the map{site.fromRoad ? ' and the front is the side facing the nearest road' : ''}. Indicative only. Front and back look wrong? Swap them.</>
              : <>We couldn&apos;t find this building&apos;s outline, so the red box is an estimate. <span className="inline-flex items-center gap-1 text-[#A8B8D8]"><Move className="h-3 w-3" />Drag</span> it onto your house and rotate it to match.</>}
          </p>
          <div className="flex flex-wrap gap-2 px-3.5 pb-1 pt-2.5">
            <button type="button" className={tool} onClick={() => setBearing(b => (b + 180) % 360)}><Repeat2 className="h-3.5 w-3.5" />Swap front / back</button>
            {!site && <button type="button" className={tool} onClick={() => setBearing(b => (b + 15) % 360)}><RotateCw className="h-3.5 w-3.5" />Rotate</button>}
            {showSideFlip && <button type="button" className={tool} onClick={() => setFlip(f => !f)}><FlipHorizontal2 className="h-3.5 w-3.5" />Other side</button>}
            {(offset.x !== 0 || offset.y !== 0) && <button type="button" className={tool} onClick={() => setOffset({ x: 0, y: 0 })}>Reset position</button>}
          </div>
        </>
      )}

      {/* Your proposal */}
      <div className="mt-2 border-t border-white/[0.07] px-3.5 pb-3.5 pt-3">
        <p className="mb-1.5 text-[14px] font-semibold text-[#E8F0FF]">Your proposal</p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt className="text-[#5A6A8A]">Status</dt>
            <dd className="text-right font-medium text-[#E8F0FF]">{model?.complete ? 'Preview matches your answers' : 'Choose the size below'}</dd>
          </div>
          {summary.subtype && (
            <div className="flex justify-between gap-3"><dt className="text-[#5A6A8A]">Type of work</dt><dd className="text-right text-[#E8F0FF]">{summary.subtype}</dd></div>
          )}
          {summary.lines.slice(0, compact ? 4 : 8).map(l => (
            <div key={l.label} className="flex justify-between gap-3"><dt className="text-[#5A6A8A]">{l.label}</dt><dd className="text-right text-[#E8F0FF]">{l.value}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  )
}
