/**
 * planningData.ts
 * ──────────────────
 * Real data source for postcode → coordinates → planning constraints.
 * This is the swap-in referred to in constraints.ts's "API swap point"
 * comment — two free, public, no-API-key UK gov/open data services:
 *
 *   1. postcodes.io          — postcode → lat/long, council, ward
 *   2. planning.data.gov.uk  — lat/long → constraint entities
 *      (conservation areas, listed buildings, flood zones, etc.),
 *      one request, many datasets at once
 *
 * Server-only by convention: call this from an API route (see
 * /api/planning-check/route.ts), not directly from client components.
 * That keeps postcode lookups off the client bundle, gives one place
 * to apply polite rate-limiting/caching, and means a failed upstream
 * call surfaces as a clean error to the UI instead of a raw fetch
 * failure.
 *
 * Coverage note: two constraints from the reference report template
 * — coal mining risk and rights of way — don't have a reliable free
 * national dataset (coal risk sits behind the Coal Authority's paid
 * CON29M search; rights of way are held per-county with inconsistent
 * coverage) and are deliberately left out of CONSTRAINT_DATASETS
 * below rather than faked.
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface PostcodeLookupResult {
  postcode: string
  coordinates: Coordinates
  council: string
  ward?: string
  country: string
}

export interface PlanningConstraint {
  /** planning.data.gov.uk dataset slug, e.g. 'conservation-area' */
  dataset: string
  /** Human label for UI, e.g. 'Conservation area' */
  label: string
  /** Whether an entity from this dataset intersects the point */
  present: boolean
  status: 'warning' | 'clear'
  /** Entity name/reference, if the API returned one — shown as supporting detail */
  detail?: string
}

const POSTCODES_IO_BASE = 'https://api.postcodes.io'
const PLANNING_DATA_BASE = 'https://www.planning.data.gov.uk'

/**
 * Every dataset checked, and the UI label it maps to. All are treated
 * as "warning" when present, "clear" when absent — matching how the
 * existing ConstraintResult/ReportCard chips are styled today.
 */
const CONSTRAINT_DATASETS: { dataset: string; label: string }[] = [
  { dataset: 'flood-risk-zone', label: 'Flood risk' },
  { dataset: 'green-belt', label: 'Green Belt' },
  { dataset: 'area-of-outstanding-natural-beauty', label: 'AONB' },
  { dataset: 'national-park', label: 'National Park' },
  { dataset: 'listed-building', label: 'Listed building' },
  { dataset: 'conservation-area', label: 'Conservation area' },
  { dataset: 'scheduled-monument', label: 'Scheduled monument' },
  { dataset: 'site-of-special-scientific-interest', label: 'SSSI' },
  { dataset: 'ancient-woodland', label: 'Ancient woodland' },
  { dataset: 'tree-preservation-zone', label: 'Tree Preservation Orders' },
  { dataset: 'air-quality-management-area', label: 'Air quality (AQMA)' },
  { dataset: 'article-4-direction-area', label: 'Article 4 direction' },
]

export class PlanningDataError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'PlanningDataError'
  }
}

/** postcode → coordinates + council. Throws PlanningDataError on an invalid/not-found postcode. */
export async function lookupPostcode(postcode: string): Promise<PostcodeLookupResult> {
  const clean = postcode.trim()
  if (!clean) throw new PlanningDataError('Enter a postcode.')

  const res = await fetch(`${POSTCODES_IO_BASE}/postcodes/${encodeURIComponent(clean)}`)
  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.result) {
    throw new PlanningDataError(
      res.status === 404 ? "We couldn't find that postcode." : 'Postcode lookup failed — please try again.',
      res.status
    )
  }

  const r = json.result
  return {
    postcode: r.postcode,
    coordinates: { latitude: r.latitude, longitude: r.longitude },
    council: r.admin_district,
    ward: r.admin_ward ?? undefined,
    country: r.country,
  }
}

/** coordinates → every tracked constraint, present or not, in a single request. */
export async function checkPlanningConstraints(coords: Coordinates): Promise<PlanningConstraint[]> {
  const params = new URLSearchParams()
  params.set('latitude', String(coords.latitude))
  params.set('longitude', String(coords.longitude))
  CONSTRAINT_DATASETS.forEach(d => params.append('dataset', d.dataset))
  params.set('limit', '100')

  const res = await fetch(`${PLANNING_DATA_BASE}/entity.json?${params.toString()}`)
  if (!res.ok) {
    throw new PlanningDataError('Constraint check failed — please try again.', res.status)
  }

  const json = await res.json()
  const entities: { dataset: string; name?: string; reference?: string }[] = json.entities ?? []

  return CONSTRAINT_DATASETS.map(d => {
    const hit = entities.find(e => e.dataset === d.dataset)
    return {
      dataset: d.dataset,
      label: d.label,
      present: !!hit,
      status: hit ? 'warning' : 'clear',
      detail: hit?.name ?? hit?.reference,
    }
  })
}

/** Convenience: postcode straight through to constraints, for callers that don't need the coordinates separately. */
export async function lookupAndCheck(postcode: string) {
  const location = await lookupPostcode(postcode)
  const constraints = await checkPlanningConstraints(location.coordinates)
  return { location, constraints }
}