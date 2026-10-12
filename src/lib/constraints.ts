/**
 * constraints.ts
 * ───────────────
 * Mock planning-constraint check + address lookup, standing in for the
 * real planning.data.gov.uk / Environment Agency / Land Registry calls
 * until that backend integration exists.
 *
 * Deliberately deterministic (hashed from the postcode) rather than
 * random, so the same postcode always returns the same demo result —
 * useful for QA and for the person testing the flow twice.
 *
 * API swap point: once the backend exposes /api/constraints?postcode=…
 * and /api/address-lookup?postcode=…, replace the bodies of
 * `lookupAddresses` and `checkConstraints` with fetch calls. Callers
 * (the address step page) don't need to change.
 */

export interface AddressOption {
  id: string
  line1: string
  city: string
  postcode: string
}

export interface ConstraintResult {
  label: string
  /** 'warning' surfaces as an amber chip + feeds the snapshot's risk framing; 'clear' as a blue chip. */
  status: 'warning' | 'clear'
  /** One-line supporting detail, e.g. from a live planning.data.gov.uk entity match. Mock results omit this. */
  detail?: string
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const STREET_NAMES = ['Maple Close', 'Birch Grove', 'Elm Terrace', 'Cedar Road', 'Willow Lane']
const CITIES = ['London', 'Manchester', 'Bristol', 'Leeds', 'Birmingham']
const COUNCILS = [
  'Westminster City Council',
  'Manchester City Council',
  'Bristol City Council',
  'Leeds City Council',
  'Birmingham City Council',
]

/** Returns 3 plausible addresses on the same street for the given postcode — mirrors a real lookup's shape. */
export function lookupAddresses(postcode: string): AddressOption[] {
  const clean = postcode.trim().toUpperCase()
  const seed = hashStr(clean)
  const street = STREET_NAMES[seed % STREET_NAMES.length]
  const city = CITIES[seed % CITIES.length]

  return [12, 14, 16].map(num => ({
    id: `${seed}-${num}`,
    line1: `${num} ${street}`,
    city,
    postcode: clean,
  }))
}

export function councilFor(postcode: string): string {
  const seed = hashStr(postcode.trim().toUpperCase())
  return COUNCILS[seed % COUNCILS.length]
}

/** Runs the (mock) constraint check for a postcode. Same shape/labels as the reference design. */
export function checkConstraints(postcode: string): ConstraintResult[] {
  const seed = hashStr(postcode.trim().toUpperCase())
  const inConservationArea = seed % 3 === 0
  const hasArticle4 = seed % 5 === 0

  return [
    {
      label: inConservationArea ? 'Conservation area' : 'Not in a conservation area',
      status: inConservationArea ? 'warning' : 'clear',
    },
    { label: 'Not listed', status: 'clear' },
    {
      label: hasArticle4 ? 'Article 4 direction applies' : 'No Article 4 direction',
      status: hasArticle4 ? 'warning' : 'clear',
    },
    { label: 'Flood zone 1 (low risk)', status: 'clear' },
    { label: 'No TPO recorded', status: 'clear' },
  ]
}