import type { AddressSuggestion, ConfirmRequest, ConfirmResponse, MediaKind, SearchResponse } from '@/lib/intake/propertyTypes'

/**
 * Demo data for the property step.
 *
 * Used automatically when PLANNING_ENGINE_URL isn't set (or
 * PLANNING_ENGINE_MOCK=true), so the intake chat is fully clickable in
 * a design review without running the planning engine. It mirrors the
 * engine's own offline mock: postcode E6 2AA → Example Road, London.
 * Anything else gets an honest "demo mode" message — we never invent
 * addresses for real postcodes.
 */

const POSTCODE = 'E6 2AA'
const BASE = { lat: 51.539, lng: 0.059 }

const DB: AddressSuggestion[] = [18, 20, 22, 24, 26, 28].map(n => ({
  id: String(1234567890 + (n - 22)),
  uprn: String(1234567890 + (n - 22)),
  fullAddress: `${n}, Example Road, London, ${POSTCODE}`,
  postcode: POSTCODE,
  propertyType: 'Terraced house',
  lat: BASE.lat,
  lng: BASE.lng + ((n - 22) / 2) * 0.000072,
}))

const DEMO_NOTE =
  'Demo mode — only the sample postcode E6 2AA is searchable here. Connect the planning engine (PLANNING_ENGINE_URL) for live UK addresses.'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

export function mockSearch(q: string): SearchResponse {
  const query = norm(q)
  if (query.length < 3) return { type: 'none', addresses: [], postcodes: [], demo: true }

  const compact = query.replace(/ /g, '')
  if (compact.startsWith('e62') && compact.length < 5) {
    return { type: 'postcode_partial', addresses: [], postcodes: [POSTCODE], demo: true }
  }

  const tokens = query.split(' ').filter(t => t && t !== 'london')
  const hits = DB.filter(a => {
    const hay = norm(a.fullAddress)
    return tokens.every(t => hay.includes(t))
  })

  if (hits.length) {
    return {
      type: compact.includes('e62aa') && tokens.length <= 2 ? 'postcode' : 'address',
      addresses: hits,
      postcodes: [],
      demo: true,
    }
  }
  return { type: 'unavailable', addresses: [], postcodes: [], message: DEMO_NOTE, demo: true }
}

function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

export function mockConfirm(req: ConfirmRequest): ConfirmResponse | null {
  if ('id' in req) {
    const a = DB.find(x => x.id === req.id)
    if (!a) return null
    // "22, Example Road, London, E6 2AA" → ["22", "Example Road", "London", "E6 2AA"]
    const [number, street, town] = a.fullAddress.split(', ')
    return {
      applicationId: `demo-${a.id}`,
      address: {
        id: a.id,
        uprn: a.uprn ?? null,
        fullAddress: a.fullAddress,
        line1: `${number} ${street}`,
        town,
        postcode: a.postcode,
        lat: a.lat,
        lng: a.lng,
      },
      propertyType: 'Terraced house',
      council: 'Newham',
      facts: [
        { label: 'Property type', value: 'Terraced house' },
        { label: 'Site area', value: '118 m² (Land Registry, indicative)' },
        { label: 'Age', value: '1900–1929 (from EPC)' },
      ],
      constraintFlags: [],
      streetViewAvailable: true,
      streetViewAttribution: null,
      aerialAttribution: null,
      warnings: [],
      manual: false,
      demo: true,
    }
  }

  const m = req.manual
  const postcode = m.postcode.trim().toUpperCase().replace(/\s+/g, ' ')
  const fullAddress = [m.line1, m.line2, m.town, postcode].map(s => (s ?? '').trim()).filter(Boolean).join(', ')
  return {
    applicationId: `demo-manual-${hash(fullAddress)}`,
    address: {
      id: 'manual',
      uprn: null,
      fullAddress,
      line1: m.line1.trim(),
      town: (m.town ?? '').trim(),
      postcode,
    },
    facts: [],
    constraintFlags: [],
    streetViewAvailable: false,
    streetViewAttribution: null,
    aerialAttribution: null,
    warnings: ['Entered manually — please check the outline once your project is set up.'],
    manual: true,
    demo: true,
  }
}

// ── SVG imagery ───────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

export function mockMediaSvg(kind: MediaKind, label: string): string {
  return kind === 'aerial' ? aerialSvg(label) : streetSvg(label)
}

function tag(text: string) {
  return `<g transform="translate(24 690)"><rect width="${22 + text.length * 7.4}" height="26" rx="13" fill="rgba(10,14,26,0.72)"/><text x="12" y="17.5" font-family="DM Sans,Arial,sans-serif" font-size="12" font-weight="600" fill="#A8B8D8">${esc(text)}</text></g>`
}

function streetSvg(label: string): string {
  const BRICKS = ['#a8553b', '#b5654a', '#9c4b34', '#b0603f', '#a05a42']
  const DOORS = ['#1f3a5f', '#2d5a3d', '#7a1f2b', '#1f3a5f', '#3b2f2f']
  let houses = ''
  for (let i = 0; i < 5; i++) {
    const x = -40 + i * 270
    const mine = i === 2
    houses += `
    <g transform="translate(${x} 0)">
      <rect x="0" y="250" width="270" height="330" fill="${BRICKS[i]}"/>
      <polygon points="-6,252 135,140 276,252" fill="#3a4152"/>
      <rect x="60" y="150" width="22" height="70" fill="#8a4630"/>
      <g fill="#e9eef5"><rect x="38" y="300" width="70" height="86" rx="2"/><rect x="162" y="300" width="70" height="86" rx="2"/></g>
      <g fill="#aecbe4"><rect x="44" y="306" width="58" height="74"/><rect x="168" y="306" width="58" height="74"/></g>
      <g stroke="#e9eef5" stroke-width="3"><path d="M73 306v74M44 343h58M197 306v74M168 343h58"/></g>
      <rect x="104" y="430" width="62" height="150" fill="${DOORS[i]}"/>
      <rect x="112" y="440" width="46" height="46" fill="#cfe0ee" opacity=".85"/>
      <rect x="98" y="420" width="74" height="10" fill="#e9eef5"/>
      <rect x="0" y="560" width="270" height="20" fill="#7c7d82"/>
      ${mine ? `<rect x="0" y="250" width="270" height="330" fill="none" stroke="#00D4FF" stroke-width="5" stroke-dasharray="14 8"/>` : ''}
    </g>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="Street view of ${esc(label)}">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb9e3"/><stop offset="1" stop-color="#dcebf6"/></linearGradient></defs>
  <rect width="1280" height="720" fill="url(#sky)"/>
  <g fill="#5d7f4b" opacity=".75"><ellipse cx="120" cy="215" rx="150" ry="85"/><ellipse cx="1150" cy="205" rx="170" ry="95"/></g>
  ${houses}
  <rect x="0" y="580" width="1280" height="44" fill="#a9aab0"/>
  <rect x="0" y="624" width="1280" height="96" fill="#4b4c52"/>
  <g fill="#e8e8e8" opacity=".85"><rect x="80" y="668" width="110" height="7"/><rect x="330" y="668" width="110" height="7"/><rect x="580" y="668" width="110" height="7"/><rect x="830" y="668" width="110" height="7"/><rect x="1080" y="668" width="110" height="7"/></g>
  ${tag('Sample image — demo mode')}
</svg>`
}

function aerialSvg(label: string): string {
  let roofs = ''
  let gardens = ''
  for (let i = 0; i < 6; i++) {
    const x = 90 + i * 180
    const mine = i === 2
    gardens += `<rect x="${x}" y="95" width="172" height="330" fill="${i % 2 ? '#6f9448' : '#7aa04f'}"/>`
    gardens += `<rect x="${x + 40}" y="125" width="92" height="40" rx="4" fill="#8b7a5a" opacity=".7"/>`
    roofs += `<g>
      <rect x="${x + 6}" y="430" width="160" height="150" fill="#464c5c"/>
      <rect x="${x + 6}" y="430" width="160" height="75" fill="#4f566a"/>
      <rect x="${x + 6}" y="503" width="160" height="4" fill="#2f3340"/>
      <rect x="${x + 6}" y="578" width="160" height="6" fill="#2f3340"/>
      <rect x="${x + 6}" y="430" width="160" height="5" fill="#2f3340"/>
      <rect x="${x + 22}" y="430" width="16" height="22" fill="#8a4630"/>
      <rect x="${x + 6}" y="425" width="160" height="6" fill="#6b4a3a" opacity=".0"/>
    </g>`
    if (mine) {
      gardens += `<rect x="${x}" y="95" width="172" height="490" fill="none" stroke="#00D4FF" stroke-width="5" stroke-dasharray="14 8"/>`
      roofs += `<rect x="${x + 6}" y="430" width="160" height="150" fill="#00D4FF" opacity=".22"/>`
    }
  }
  const fences = Array.from({ length: 7 }, (_, i) => `<rect x="${88 + i * 180}" y="95" width="3" height="490" fill="#d9d3c3" opacity=".8"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="Aerial view of ${esc(label)}">
  <rect width="1280" height="720" fill="#5c7f3e"/>
  <rect x="0" y="0" width="1280" height="95" fill="#4f7035"/>
  <g fill="#3f6a33" opacity=".85"><circle cx="150" cy="48" r="30"/><circle cx="470" cy="40" r="26"/><circle cx="820" cy="52" r="32"/><circle cx="1140" cy="44" r="28"/></g>
  ${gardens}${fences}${roofs}
  <rect x="0" y="590" width="1280" height="26" fill="#b9b9bd"/>
  <rect x="0" y="616" width="1280" height="104" fill="#4b4c52"/>
  <g fill="#e8e8e8" opacity=".85"><rect x="90" y="664" width="120" height="7"/><rect x="340" y="664" width="120" height="7"/><rect x="590" y="664" width="120" height="7"/><rect x="840" y="664" width="120" height="7"/><rect x="1090" y="664" width="120" height="7"/></g>
  ${tag('Sample image — demo mode')}
</svg>`
}
