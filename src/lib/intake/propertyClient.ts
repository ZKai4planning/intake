import type {
  ConfirmRequest,
  ConfirmResponse,
  MediaKind,
  SearchResponse,
} from './propertyTypes'
import type { IntakeProperty } from './types'

/** Browser-side calls to /api/property/*. Never throws — errors come back as { error }. */

export async function searchProperties(q: string, signal?: AbortSignal): Promise<SearchResponse | { error: string }> {
  try {
    const res = await fetch(`/api/property/search?q=${encodeURIComponent(q)}`, { signal })
    const json = await res.json().catch(() => null)
    if (json && 'type' in json) return json as SearchResponse
    return { error: 'Address search is unavailable right now.' }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return { error: 'aborted' }
    return { error: 'Address search is unavailable right now.' }
  }
}

export async function confirmProperty(
  body: ConfirmRequest,
  signal?: AbortSignal,
): Promise<{ data: ConfirmResponse } | { error: string }> {
  try {
    const res = await fetch('/api/property/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.applicationId) {
      return { error: json?.message ?? "We couldn't load that property just now." }
    }
    return { data: json as ConfirmResponse }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return { error: 'aborted' }
    return { error: "We couldn't load that property just now." }
  }
}

export function mediaUrl(applicationId: string, kind: MediaKind, label?: string): string {
  const params = new URLSearchParams({ app: applicationId, kind })
  if (label) params.set('label', label)
  return `/api/property/media?${params.toString()}`
}

/** Engine response → what we keep in the intake draft. */
export function toIntakeProperty(r: ConfirmResponse): IntakeProperty {
  return {
    addressId: r.address.id,
    applicationId: r.applicationId,
    fullAddress: r.address.fullAddress,
    line1: r.address.line1,
    town: r.address.town,
    postcode: r.address.postcode,
    lat: r.address.lat,
    lng: r.address.lng,
    uprn: r.address.uprn,
    propertyType: r.propertyType,
    council: r.council,
    facts: r.facts,
    constraintFlags: r.constraintFlags,
    streetViewAvailable: r.streetViewAvailable,
    streetViewAttribution: r.streetViewAttribution,
    aerialAttribution: r.aerialAttribution,
    manual: r.manual,
    demo: r.demo,
    confirmed: false,
  }
}
