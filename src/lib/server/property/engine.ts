import type {
  AddressSuggestion,
  ConfirmRequest,
  ConfirmResponse,
  MediaKind,
  SearchResponse,
} from '@/lib/intake/propertyTypes'
import { mockConfirm, mockSearch } from './mock'

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
