import type {
  AddressSuggestion,
  ConfirmRequest,
  ConfirmResponse,
  MediaKind,
  SearchResponse,
} from '@/lib/intake/propertyTypes'
import { mockConfirm, mockSearch } from './mock'
import { finishProposal, toEngineProposal, type EngineWorkType, type ProposalInput } from './proposalMap'

/**
 * Client for the UK Planning Application Engine (the Express service in
 * the "patch6-plots-heights-epc" package).
 *
 *   PLANNING_ENGINE_URL      e.g. http://localhost:4000  (no trailing slash)
 *   PLANNING_ENGINE_API_KEY  optional — sent as a Bearer token if set
 *   PLANNING_ENGINE_MOCK     "true" forces demo data even when a URL is set
 *
 * With no URL configured everything falls back to built-in demo data
 * (see ./mock.ts), so the UI works out of the box.
 *
 * Only a fixed set of engine endpoints is ever called, and every id is
 * validated by the route handlers before it gets here — this is not an
 * open proxy.
 */

export function engineBase(): string | null {
  const url = (process.env.PLANNING_ENGINE_URL ?? '').trim().replace(/\/+$/, '')
  return url || null
}

export function isDemoMode(): boolean {
  return !engineBase() || process.env.PLANNING_ENGINE_MOCK === 'true'
}

class EngineError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function engineFetch(path: string, init: RequestInit = {}, timeoutMs = 30_000): Promise<Response> {
  const base = engineBase()
  if (!base) throw new EngineError(503, 'Planning engine not configured')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const headers: Record<string, string> = {
      Accept: '*/*',
      ...(init.headers as Record<string, string> | undefined),
    }
    const key = process.env.PLANNING_ENGINE_API_KEY
    if (key) headers.Authorization = `Bearer ${key}`
    return await fetch(`${base}${path}`, { ...init, headers, signal: controller.signal, cache: 'no-store' })
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    throw new EngineError(aborted ? 504 : 502, aborted ? 'The planning engine took too long to respond' : 'Could not reach the planning engine')
  } finally {
    clearTimeout(timer)
  }
}

async function engineJson<T>(path: string, init: RequestInit = {}, timeoutMs?: number): Promise<T> {
  const res = await engineFetch(path, { ...init, headers: { Accept: 'application/json', ...(init.headers as Record<string, string> | undefined) } }, timeoutMs)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = body?.error?.message ?? body?.message ?? (typeof body?.error === 'string' ? body.error : null) ?? `Planning engine returned ${res.status}`
    throw new EngineError(res.status, message)
  }
  return body as T
}

// ── Search ────────────────────────────────────────────────────────────

interface EngineSuggestion {
  id?: string
  uprn?: string | null
  fullAddress?: string
  postcode?: string
  propertyType?: string
  lat?: number
  lng?: number
}

interface EngineSearch {
  type: SearchResponse['type']
  suggestions: EngineSuggestion[]
  message?: string
}

const MAX_ADDRESSES = 40

export async function searchAddresses(q: string): Promise<SearchResponse> {
  if (isDemoMode()) return mockSearch(q)

  try {
    const data = await engineJson<EngineSearch>(`/api/address/search?q=${encodeURIComponent(q)}&limit=8`, {}, 25_000)

    if (data.type === 'postcode_partial') {
      return {
        type: 'postcode_partial',
        addresses: [],
        postcodes: data.suggestions.map(s => s.postcode).filter((p): p is string => !!p).slice(0, 8),
        demo: false,
      }
    }

    if (data.type === 'postcode' || data.type === 'address') {
      const addresses: AddressSuggestion[] = data.suggestions
        .filter(s => s.id && s.fullAddress)
        .slice(0, MAX_ADDRESSES)
        .map(s => ({
          id: s.id as string,
          fullAddress: s.fullAddress as string,
          postcode: s.postcode ?? '',
          propertyType: s.propertyType,
          uprn: s.uprn ?? null,
          lat: s.lat,
          lng: s.lng,
        }))
      return { type: data.type, addresses, postcodes: [], message: data.message, demo: false }
    }

    return { type: data.type === 'unavailable' ? 'unavailable' : 'none', addresses: [], postcodes: [], message: data.message, demo: false }
  } catch (err) {
    const status = err instanceof EngineError ? err.status : 502
    return {
      type: 'unavailable',
      addresses: [],
      postcodes: [],
      message:
        status === 404 || status === 400
          ? "We couldn't find that. Check the postcode, or enter the address manually."
          : 'Address search is slow or unavailable right now. Try again, or enter the address manually.',
      demo: false,
    }
  }
}

// ── Confirm (create + enrich an application) ─────────────────────────

interface EngineSummary {
  id: string
  address: { id: string; uprn?: string | null; fullAddress: string; line1?: string; town?: string; postcode: string; lat?: number; lng?: number }
  authority?: { name?: string } | null
  cards?: {
    property?: { rows?: { label: string; value: string }[]; imageAvailable?: boolean; attribution?: string | null }
    site?: { attribution?: string | null }
  }
  constraints?: { items?: { label?: string }[] } | null
  warnings?: (string | { message?: string })[]
}

const FACT_LABELS = ['Property type', 'Site area', 'Floor area', 'Age']

export async function confirmAddress(req: ConfirmRequest): Promise<ConfirmResponse> {
  if (isDemoMode()) {
    const demo = mockConfirm(req)
    if (!demo) throw new EngineError(404, 'We could not find that address')
    return demo
  }

  // Enrichment fans out to several public datasets, so allow a generous timeout.
  const s = await engineJson<EngineSummary>(
    '/api/applications',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) },
    55_000,
  )

  const rows = s.cards?.property?.rows ?? []
  const facts = rows.filter(r => FACT_LABELS.includes(r.label) && r.value && !/^(to confirm|not available)$/i.test(r.value))
  const flags = Array.from(new Set((s.constraints?.items ?? []).map(i => i.label).filter((l): l is string => !!l)))

  return {
    applicationId: s.id,
    address: {
      id: s.address.id,
      uprn: s.address.uprn ?? null,
      fullAddress: s.address.fullAddress,
      line1: s.address.line1 ?? s.address.fullAddress.split(', ')[0],
      town: s.address.town ?? '',
      postcode: s.address.postcode,
      lat: s.address.lat,
      lng: s.address.lng,
    },
    propertyType: rows.find(r => r.label === 'Property type')?.value,
    council: s.authority?.name,
    facts,
    constraintFlags: flags,
    streetViewAvailable: s.cards?.property?.imageAvailable ?? false,
    streetViewAttribution: s.cards?.property?.attribution ?? null,
    aerialAttribution: s.cards?.site?.attribution ?? null,
    warnings: (s.warnings ?? []).map(w => (typeof w === 'string' ? w : w?.message ?? '')).filter(Boolean),
    manual: 'manual' in req,
    demo: false,
  }
}

// ── Media ─────────────────────────────────────────────────────────────

export async function fetchMedia(applicationId: string, kind: MediaKind): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const res = await engineFetch(`/api/applications/${encodeURIComponent(applicationId)}/media/${kind}`, {}, 30_000)
  if (!res.ok) throw new EngineError(res.status, 'Image not available')
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  if (!/^image\//i.test(contentType)) throw new EngineError(502, 'Unexpected response from planning engine')
  return { buffer: await res.arrayBuffer(), contentType }
}

export function errorStatus(err: unknown): { status: number; message: string } {
  if (err instanceof EngineError) return { status: err.status >= 400 && err.status < 600 ? err.status : 502, message: err.message }
  return { status: 500, message: 'Something went wrong' }
}


// ── Proposal preview (map + Map checks computed BY THE ENGINE) ─────────────

export interface EngineMapLayer {
  id: string
  kind: 'building' | 'existing_extension' | 'proposal' | 'plot' | 'neighbour' | string
  label: string
  style: string
  status?: string
  indicative: boolean
  dimsText: string | null
  /** [lng, lat] pairs, closed. */
  ring: [number, number][]
}

export interface SiteCheckItem { status: 'fail' | 'warn' | 'pass' | 'info'; message: string }

export interface ProposalPreview {
  frame: { frontBearingDeg: number; frontSource: string; houseWidthM: number; houseDepthM: number; indicative: boolean }
  layers: EngineMapLayer[]
  siteChecks: {
    items: SiteCheckItem[]
    disclaimer: string
    attribution: string[]
    boundary: { status: string; outsideM2: number; maxOutsideM: number }
    neighbours: { status: string }[]
  }
  frontNote: string
  proposalLabel: string | null
  /** Permitted-development screening, passed through untouched for later use. */
  assessment: unknown
}

let workTypeCache: { at: number; list: EngineWorkType[] } | null = null

/** The engine's own list of work types (fields, defaults, limits). Cached for 10 minutes. */
async function workTypes(): Promise<EngineWorkType[]> {
  if (workTypeCache && Date.now() - workTypeCache.at < 10 * 60_000) return workTypeCache.list
  const data = await engineJson<{ types?: EngineWorkType[] }>('/api/work-types', {}, 15_000)
  const list = data.types ?? []
  workTypeCache = { at: Date.now(), list }
  return list
}

/**
 * Sends the person's answers to the engine as a proposal and returns what it computed:
 * the map layers, the Map checks (neighbour overlap + title boundary) and the front direction.
 * Optionally overrides which way the front faces first (the "Swap front / back" button).
 */
export async function previewProposal(applicationId: string, inp: ProposalInput, frontBearingDeg?: number): Promise<ProposalPreview> {
  if (isDemoMode() || applicationId.startsWith('demo-')) throw new EngineError(503, 'Planning engine not available')
  const mapped = toEngineProposal(inp)
  if (!mapped) throw new EngineError(400, 'No preview for this type of work')
  const wt = (await workTypes()).find(w => w.type === mapped.type)
  if (!wt) throw new EngineError(502, 'The planning engine does not offer this type of work')

  const id = encodeURIComponent(applicationId)
  const json = { 'Content-Type': 'application/json' }
  if (frontBearingDeg !== undefined) {
    await engineJson(`/api/applications/${id}/profile`, { method: 'PATCH', headers: json, body: JSON.stringify({ frontBearingDeg }) }, 30_000)
  }
  const s = await engineJson<{
    map: { frame: ProposalPreview['frame']; layers: EngineMapLayer[]; siteChecks: ProposalPreview['siteChecks']; frontNote: string }
    assessment?: unknown
  }>(`/api/applications/${id}/proposal`, { method: 'PUT', headers: json, body: JSON.stringify(finishProposal(wt, mapped.values)) }, 45_000)

  const layers = s.map.layers.map(l => ({
    id: l.id, kind: l.kind, label: l.label, style: l.style, status: l.status, indicative: !!l.indicative, dimsText: l.dimsText ?? null, ring: l.ring,
  }))
  return {
    frame: s.map.frame,
    layers,
    siteChecks: {
      items: s.map.siteChecks.items,
      disclaimer: s.map.siteChecks.disclaimer,
      attribution: s.map.siteChecks.attribution ?? [],
      boundary: s.map.siteChecks.boundary,
      neighbours: s.map.siteChecks.neighbours.map(n => ({ status: n.status })),
    },
    frontNote: s.map.frontNote,
    proposalLabel: layers.find(l => l.kind === 'proposal')?.label ?? null,
    assessment: s.assessment ?? null,
  }
}
