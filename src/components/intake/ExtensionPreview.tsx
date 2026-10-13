'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle, MapPinOff, RotateCw, Repeat2, FlipHorizontal2, Move } from 'lucide-react'
import { cn } from '@/lib/cn'
import { buildPreview, centroid, hasPreview, metresPerPixel, type Pt } from '@/lib/intake/footprint'
import { checkFit } from '@/lib/intake/fit'
import { deriveSite, type Site } from '@/lib/intake/site'
import { summariseProject } from '@/lib/intake/projectTypes'
import type { IntakeMore, IntakePlanning, IntakeProperty, SiteFit } from '@/lib/intake/types'
import { engineToFit, type EnginePreview } from '@/lib/intake/engineMap'
import { fetchEnginePreview } from '@/lib/intake/propertyClient'
import { MAP_H, MAP_W, TileMap, projectToView, type MapLayer } from './TileMap'

const ZOOM = 20

interface Props {
  property: IntakeProperty | null
  planning: IntakePlanning
  more: IntakeMore
  /** Smaller version for the review card. */
  compact?: boolean
  className?: string
  /** Called with the fit result (clash with neighbouring buildings) whenever it changes. */
  onFit?: (fit: SiteFit | null) => void
}

/**
 * Live plan-view preview of the proposal on the real aerial photo / map.
 * Redraws as the person answers the questions underneath it.
 *
 * ENGINE MODE (default when the property came from the planning engine): the engine draws the
 * proposal and runs the Map checks (neighbour overlap, title boundary) — we only display what
 * POST /api/property/proposal returns, so engine improvements show up here with no change to this file.
 * LOCAL MODE (demo data, or the engine is unreachable): the older in-browser calculation below is used instead.
 *
 * If the house outline is only an estimate, the person can rotate it, swap
 * front/back, flip the side and drag it into place.
 */
export function ExtensionPreview({ property, planning, more, compact, className, onFit }: Props) {
  const [layer, setLayer] = useState<MapLayer>('aerial')
  const [bearing, setBearing] = useState(180) // direction the FRONT of the house faces
  const [flip, setFlip] = useState(false)
  const [offset, setOffset] = useState<Pt>({ x: 0, y: 0 }) // metres
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  // ── Engine mode ──
  const [eng, setEng] = useState<{ status: 'loading' | 'ok' | 'failed'; data: EnginePreview | null }>({ status: 'loading', data: null })
  const [bearingOverride, setBearingOverride] = useState<number | null>(null) // only after Swap / Rotate
  const engineOn = !!property?.applicationId && !property.demo && !property.applicationId.startsWith('demo-') && hasPreview(planning.categoryId, more.subtypeId)
  const useLocal = !engineOn || eng.status === 'failed'
  const answersKey = JSON.stringify(more.answers)
  const appId = property?.applicationId

  useEffect(() => {
    if (!engineOn || !appId || !planning.categoryId) return
    const ctl = new AbortController()
    setEng(e => ({ status: e.data ? 'ok' : 'loading', data: e.data }))
    const t = setTimeout(async () => {
      const r = await fetchEnginePreview(
        { applicationId: appId, categoryId: planning.categoryId as string, subtypeId: more.subtypeId, answers: more.answers, flip, ...(bearingOverride !== null ? { frontBearingDeg: bearingOverride } : {}) },
        ctl.signal,
      )
      if (ctl.signal.aborted) return
      setEng('data' in r ? { status: 'ok', data: r.data } : { status: 'failed', data: null })
    }, 350)
    return () => { clearTimeout(t); ctl.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineOn, appId, planning.categoryId, more.subtypeId, answersKey, flip, bearingOverride])

  // Real building outline + road direction from OpenStreetMap (LOCAL mode only). 'loading' → 'ready' (site or null → estimate).
  const [lookup, setLookup] = useState<'loading' | 'ready'>('loading')
  const [site, setSite] = useState<Site | null>(null)
  const [plotAttribution, setPlotAttribution] = useState<string | null>(null)
  const lat = property?.lat
  const lng = property?.lng

  useEffect(() => {
    if (lat == null || lng == null || !useLocal) return
    const ctl = new AbortController()
    setLookup('loading')
    setSite(null)
    setPlotAttribution(null)
    setOffset({ x: 0, y: 0 })
    fetch(`/api/property/building?lat=${lat}&lng=${lng}`, { signal: ctl.signal })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { outline: { lat: number; lng: number }[] | null; neighbours?: { lat: number; lng: number }[][]; roads: { lat: number; lng: number }[][]; plot?: { ring: { lat: number; lng: number }[]; attribution?: string } | null } | null) => {
        const found = d?.outline ? deriveSite({ lat, lng }, d.outline, d.roads ?? [], d.neighbours ?? [], d.plot?.ring ?? null) : null
        setSite(found)
        setPlotAttribution(found?.plot ? d?.plot?.attribution ?? null : null)
        if (found) setBearing(Math.round(found.bearing))
        setLookup('ready')
      })
      .catch(() => { if (!ctl.signal.aborted) setLookup('ready') })
    return () => ctl.abort()
  }, [lat, lng, useLocal])

  const model = useMemo(
    () => (useLocal && lookup === 'ready' ? buildPreview(planning.categoryId, more.subtypeId, more.answers, bearing, flip, site) : null),
    [useLocal, lookup, planning.categoryId, more.subtypeId, more.answers, bearing, flip, site],
  )

  // Does it physically fit? Checked against the real outlines of neighbouring buildings.
  const result = useMemo(
    () => (useLocal && lookup === 'ready' ? checkFit({ categoryId: planning.categoryId, subtypeId: more.subtypeId, answers: more.answers, bearing, flip, site }) : null),
    [useLocal, lookup, planning.categoryId, more.subtypeId, more.answers, bearing, flip, site],
  )
  const ed = !useLocal ? eng.data : null // what the engine returned
  const engFit = useMemo(() => (ed ? engineToFit(ed) : null), [ed])
  const fit = ed ? engFit : result?.fit ?? null
  const ready = useLocal ? lookup === 'ready' : !!ed
  const draftComplete = useMemo(() => buildPreview(planning.categoryId, more.subtypeId, more.answers, bearing, flip, null)?.complete ?? false, [planning.categoryId, more.subtypeId, more.answers, bearing, flip])
  const complete = ed ? draftComplete : !!model?.complete
  const boundaryCrossed = fit?.boundary?.status === 'crosses'
  const fitKey = fit ? JSON.stringify(fit) : ''
  const onFitRef = useRef(onFit)
  onFitRef.current = onFit
  useEffect(() => {
    if (ready) onFitRef.current?.(fit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, ready])

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

  // Engine layers are lng/lat → project onto the same map the tiles use, then apply the drag offset.
  const ringPx = (ring: [number, number][]) => ring.map(([lo, la]) => { const q = projectToView(lat as number, lng as number, ZOOM, lo, la); return { x: q.x + offset.x / mpp, y: q.y + offset.y / mpp } })
  const pathPx = (pts: { x: number; y: number }[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ') + 'Z'
  const engLayers = ed ? ed.layers.map(l => ({ ...l, d: pathPx(ringPx(l.ring)), px: ringPx(l.ring) })) : []
  const ofKind = (k: string) => engLayers.filter(l => l.kind === k)
  const labelText = ed ? [ed.proposalLabel, ofKind('proposal')[0]?.dimsText].filter(Boolean).join(' · ') : model?.label ?? ''
  const hasDrawing = ed ? engLayers.some(l => l.kind === 'proposal') : !!model

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

  // Swap / rotate the front. In engine mode the engine is told (it remembers the override); locally we just turn the drawing.
  const turn = (deg: number) => {
    setBearing(b => (b + deg) % 360)
    if (engineOn) setBearingOverride((((ed?.frame.frontBearingDeg ?? bearing) + deg) % 360 + 360) % 360)
  }

  // 5 m scale bar
  const barPx = 5 / mpp
  // Label sits just outside the drawing (above it, or below if there's no room) so it never hides the shapes.
  const labelW = hasDrawing ? Math.min(labelText.length * 6.6 + 16, MAP_W - 16) : 0
  let labelX = 0
  let labelY = 0
  if (hasDrawing) {
    const all = ed
      ? engLayers.filter(l => l.kind === 'proposal' || l.kind === 'building').flatMap(l => l.px)
      : [...model!.existing, ...model!.proposed.flat()].map(toPx)
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
            {!ready && (
              <g pointerEvents="none">
                <rect x={MAP_W / 2 - 110} y={MAP_H / 2 - 14} width="220" height="28" rx="14" fill="rgba(10,14,26,0.82)" />
                <text x={MAP_W / 2} y={MAP_H / 2 + 4} textAnchor="middle" fontSize="12" fill="#E8F0FF" fontFamily="DM Sans, Arial, sans-serif">Finding your house outline…</text>
              </g>
            )}
            {ed && hasDrawing && (
              <g pointerEvents="none">
                {/* Neighbouring buildings: grey; red if the proposal overlaps, amber if very close */}
                {ofKind('neighbour').map(l => (
                  <path
                    key={l.id}
                    d={l.d}
                    fill={l.status === 'overlap' ? 'rgba(239,68,68,0.35)' : 'rgba(148,163,184,0.16)'}
                    stroke={l.status === 'overlap' ? '#EF4444' : l.status === 'close' ? '#F59E0B' : 'rgba(203,213,225,0.7)'}
                    strokeWidth={l.status === 'overlap' || l.status === 'close' ? 2.5 : 1.5}
                    strokeLinejoin="round"
                  />
                ))}
                {/* Registered title boundary: green dashed, red if the proposal sticks out of it */}
                {ofKind('plot').map(l => (
                  <path key={l.id} d={l.d} fill="none" stroke={l.status === 'crosses' ? '#EF4444' : '#22C55E'} strokeWidth="2.5" strokeDasharray="8 5" strokeLinejoin="round" />
                ))}
                {ofKind('building').map(l => (
                  <path key={l.id} d={l.d} fill="rgba(225,29,46,0.10)" stroke="#E11D2E" strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round" />
                ))}
                {ofKind('existing_extension').map(l => (
                  <path key={l.id} d={l.d} fill="rgba(225,29,46,0.06)" stroke="#E11D2E" strokeWidth="2" strokeDasharray="3 4" strokeLinejoin="round" />
                ))}
                {ofKind('proposal').map(l => (
                  <path
                    key={l.id}
                    d={l.d}
                    fill={fit?.status === 'collision' ? 'rgba(239,68,68,0.5)' : l.style === 'roof' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.55)'}
                    stroke={fit?.status === 'collision' ? '#F87171' : '#60A5FA'}
                    strokeWidth="2.5"
                    strokeDasharray={l.style === 'roof' ? '5 3' : undefined}
                    strokeLinejoin="round"
                  />
                ))}
                <g transform={`translate(${labelX} ${labelY})`}>
                  <rect x={-labelW / 2} y="-11" width={labelW} height="22" rx="11" fill="rgba(10,14,26,0.82)" stroke={fit?.status === 'collision' ? 'rgba(248,113,113,0.8)' : 'rgba(96,165,250,0.6)'} />
                  <text textAnchor="middle" y="4" fontSize="11.5" fontWeight="600" fill="#fff" fontFamily="DM Sans, Arial, sans-serif">{labelText}</text>
                </g>
              </g>
            )}
            {!ed && model && (
              <g pointerEvents="none">
                {/* Neighbouring buildings (grey) */}
                {site?.neighbours.map((n, i) => (
                  <path key={`nb-${i}`} d={path(n)} fill="rgba(148,163,184,0.16)" stroke="rgba(203,213,225,0.7)" strokeWidth="1.5" strokeLinejoin="round" />
                ))}
                {/* Registered title boundary — green dashed, red if the proposal sticks out of it */}
                {site?.plot && (
                  <path
                    d={path(site.plot)}
                    fill="none"
                    stroke={boundaryCrossed ? '#EF4444' : '#22C55E'}
                    strokeWidth="2.5"
                    strokeDasharray="8 5"
                    strokeLinejoin="round"
                  />
                )}
                {/* Existing house — red dashed */}
                <path d={path(model.existing)} fill="rgba(225,29,46,0.10)" stroke="#E11D2E" strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round" />
                {/* Proposal — blue */}
                {/* Neighbouring buildings the proposal runs into */}
                {site && result?.hits.map(i => (
                  <path key={`hit-${i}`} d={path(site.neighbours[i])} fill="rgba(239,68,68,0.35)" stroke="#EF4444" strokeWidth="2.5" strokeLinejoin="round" />
                ))}
                {model.proposed.map((poly, i) => (
                  <path
                    key={i}
                    d={path(poly)}
                    fill={fit?.status === 'collision' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.55)'}
                    stroke={fit?.status === 'collision' ? '#F87171' : '#60A5FA'}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                ))}
                {(
                  <g transform={`translate(${labelX} ${labelY})`}>
                    <rect x={-labelW / 2} y="-11" width={labelW} height="22" rx="11" fill="rgba(10,14,26,0.82)" stroke={fit?.status === 'collision' ? 'rgba(248,113,113,0.8)' : 'rgba(96,165,250,0.6)'} />
                    <text textAnchor="middle" y="4" fontSize="11.5" fontWeight="600" fill="#fff" fontFamily="DM Sans, Arial, sans-serif">{labelText}</text>
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
        {(ed ? ofKind('neighbour').length > 0 : !!site && site.neighbours.length > 0) && <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-[3px] border border-slate-300/70 bg-slate-400/20" />Neighbouring buildings</span>}
        {(ed ? ofKind('plot').length > 0 : !!site?.plot) && <span className="inline-flex items-center gap-2"><span className={cn('h-3.5 w-3.5 rounded-[3px] border-2 border-dashed', boundaryCrossed ? 'border-[#EF4444]' : 'border-[#22C55E]')} />Title boundary (indicative)</span>}
        {fit?.status === 'collision' && <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-[3px] border-2 border-[#EF4444] bg-[#EF4444]/40" />In the way</span>}
      </div>

      {fit?.items && fit.items.length > 0 && (
        <div className="mx-3.5 mt-3" data-testid="map-checks">
          <p className="mb-1 text-[13px] font-semibold text-[#E8F0FF]">Map checks</p>
          <ul className="divide-y divide-white/[0.07] border-t border-white/[0.07]">
            {fit.items.map((it, i) => (
              <li key={i} className="flex items-start gap-2.5 py-2 text-[12.5px] leading-snug text-[#C9D6F0]">
                {it.status === 'fail' ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
                  : it.status === 'warn' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
                  : it.status === 'pass' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                  : <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7FA8]" />}
                <span>{it.message}</span>
              </li>
            ))}
          </ul>
          {!compact && (
            <p className="pt-1.5 text-[11.5px] leading-snug text-[#5A6A8A]">
              {ed
                ? <>{ed.siteChecks.disclaimer} {ed.siteChecks.attribution.join(' · ')}</>
                : <>Indicative only: based on OpenStreetMap building outlines and HM Land Registry title boundaries. Positions can be a metre or more out, and a title boundary is not the legal boundary. Please check on site.{plotAttribution ? <> {plotAttribution}</> : null}</>}
            </p>
          )}
        </div>
      )}

      {fit && fit.status !== 'unknown' && (
        <div
          role={fit.status === 'collision' ? 'alert' : 'status'}
          data-testid="fit-alert"
          className={cn(
            'mx-3.5 mt-3 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[12.5px] leading-snug',
            fit.status === 'collision' && 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#FCA5A5]',
            fit.status === 'tight' && 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FCD34D]',
            fit.status === 'ok' && 'border-[#10B981]/30 bg-[#10B981]/10 text-[#6EE7B7]',
          )}
        >
          {fit.status === 'ok' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <p>{fit.status === 'collision' ? <strong className="font-semibold">Doesn’t look possible here. </strong> : null}{fit.message}</p>
        </div>
      )}
      {fit?.status === 'unknown' && (
        <p className="mx-3.5 mt-3 flex items-start gap-2 text-[12px] text-[#5A6A8A]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{fit.message}</p>
      )}

      {!compact && (
        <>
          <p className="px-3.5 pt-2 text-[12px] leading-snug text-[#5A6A8A]">
            {hasDrawing && !complete ? 'Enter the size below and the blue shape updates. ' : ''}
            {ed && !ed.frame.indicative
              ? <>Outline taken from the building on the map. {ed.frontNote} Indicative only. Front and back look wrong? Swap them.</>
              : ed ? <>We couldn&apos;t find this building&apos;s outline, so the red box is an estimate. <span className="inline-flex items-center gap-1 text-[#A8B8D8]"><Move className="h-3 w-3" />Drag</span> it onto your house and rotate it to match.</>
              : site
              ? <>Outline taken from the building on the map{site.fromRoad ? ' and the front is the side facing the nearest road' : ''}. Indicative only. Front and back look wrong? Swap them.</>
              : <>We couldn&apos;t find this building&apos;s outline, so the red box is an estimate. <span className="inline-flex items-center gap-1 text-[#A8B8D8]"><Move className="h-3 w-3" />Drag</span> it onto your house and rotate it to match.</>}
          </p>
          <div className="flex flex-wrap gap-2 px-3.5 pb-1 pt-2.5">
            <button type="button" className={tool} onClick={() => turn(180)}><Repeat2 className="h-3.5 w-3.5" />Swap front / back</button>
            {(ed ? ed.frame.indicative : !site) && <button type="button" className={tool} onClick={() => turn(15)}><RotateCw className="h-3.5 w-3.5" />Rotate</button>}
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
            <dd className="text-right font-medium text-[#E8F0FF]">{fit?.status === 'collision' ? 'Appears not to fit' : fit?.status === 'tight' ? 'Tight fit — needs checking' : complete ? 'Preview matches your answers' : 'Choose the size below'}</dd>
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
