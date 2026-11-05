/**
 * Live planning & property news
 * ─────────────────────────────
 * Reads the public GOV.UK Atom feeds (no API key needed), merges them,
 * removes duplicates, tags each item with a category and returns the newest
 * first. Runs on the server only; Next caches each feed for 15 minutes.
 *
 * If every feed fails (GOV.UK down, no network) it returns a small static
 * list of useful GOV.UK links with `live: false`, so the UI never breaks.
 */

import type { NewsCategory, NewsItem, NewsResult } from './newsShared'
export type { NewsCategory, NewsItem, NewsResult } from './newsShared'
export { CATEGORY_COLOURS, formatNewsDate } from './newsShared'

export const REVALIDATE_SECONDS = 900

const MHCLG = 'organisations%5B%5D=ministry-of-housing-communities-local-government'
const GOVUK_SEARCH = 'https://www.gov.uk/search'

const FEEDS = [
  { url: `${GOVUK_SEARCH}/news-and-communications.atom?${MHCLG}`, source: 'GOV.UK · MHCLG' },
  { url: `${GOVUK_SEARCH}/policy-papers-and-consultations.atom?${MHCLG}`, source: 'GOV.UK · MHCLG' },
  { url: `${GOVUK_SEARCH}/news-and-communications.atom?keywords=planning`, source: 'GOV.UK' },
]

const RELEVANT =
  /planning|housing|homes?\b|building|property|permitted development|nppf|local plan|council|renters?|leasehold|landlord|land\b|infrastructure|development|green belt|heritage|conservation|brownfield|extension|devolution/i

/* ── tiny Atom parser (avoids adding an XML dependency) ───────────────── */

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
}

const clean = (s: string) => decode(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? m[1] : ''
}

function linkOf(block: string): string {
  const links = block.match(/<link\b[^>]*>/gi) ?? []
  const alt = links.find((l) => /rel=["']alternate["']/i.test(l)) ?? links[0]
  const href = alt?.match(/href=["']([^"']+)["']/i)?.[1] ?? ''
  return decode(href)
}

export function categorise(text: string, fromPolicyFeed = false): NewsCategory {
  if (/planning|nppf|permitted development|local plan|green belt/i.test(text)) return 'Planning'
  if (/consultation|call for evidence/i.test(text) || fromPolicyFeed) return 'Consultation'
  if (/housing|homes?\b|renters?|rent\b|landlord|tenant|leasehold|mortgage/i.test(text)) return 'Housing'
  if (/council|local government|devolution|mayor|authorit/i.test(text)) return 'Local government'
  return 'General'
}

export function parseAtom(xml: string, source: string, fromPolicyFeed = false): NewsItem[] {
  const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? []
  const out: NewsItem[] = []
  for (const e of entries) {
    const title = clean(tag(e, 'title'))
    const url = linkOf(e)
    if (!title || !/^https?:\/\//i.test(url)) continue
    const summary = clean(tag(e, 'summary') || tag(e, 'content'))
    const rawDate = clean(tag(e, 'updated') || tag(e, 'published'))
    const t = Date.parse(rawDate)
    out.push({
      id: url,
      title,
      url,
      date: Number.isNaN(t) ? '' : new Date(t).toISOString(),
      summary: summary.length > 220 ? summary.slice(0, 217).trimEnd() + '…' : summary,
      category: categorise(`${title} ${summary}`, fromPolicyFeed),
      source,
    })
  }
  return out
}

/* ── fetching ─────────────────────────────────────────────────────────── */

async function loadFeed(url: string, source: string, policy: boolean): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/atom+xml, application/xml;q=0.9, */*;q=0.5' },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) return []
    return parseAtom(await res.text(), source, policy)
  } catch {
    return []
  }
}

const FALLBACK: NewsItem[] = [
  {
    id: 'fb-1', title: 'Latest planning and housing news from MHCLG',
    url: 'https://www.gov.uk/government/organisations/ministry-of-housing-communities-local-government',
    date: '', summary: 'Announcements and guidance from the Ministry of Housing, Communities and Local Government.',
    category: 'Planning', source: 'GOV.UK',
  },
  {
    id: 'fb-2', title: 'National Planning Policy Framework',
    url: 'https://www.gov.uk/guidance/national-planning-policy-framework',
    date: '', summary: 'The government’s planning policies for England and how they should be applied.',
    category: 'Planning', source: 'GOV.UK',
  },
  {
    id: 'fb-3', title: 'Planning Practice Guidance',
    url: 'https://www.gov.uk/government/collections/planning-practice-guidance',
    date: '', summary: 'Detailed guidance on how to apply national planning policy.',
    category: 'Planning', source: 'GOV.UK',
  },
]

export async function getNews(limit = 30): Promise<NewsResult> {
  const lists = await Promise.all(FEEDS.map((f, i) => loadFeed(f.url, f.source, i === 1)))

  const seen = new Set<string>()
  const merged: NewsItem[] = []
  for (const it of lists.flat()) {
    if (seen.has(it.url)) continue
    seen.add(it.url)
    merged.push(it)
  }

  if (merged.length === 0) {
    return { items: FALLBACK, live: false, fetchedAt: new Date().toISOString() }
  }

  merged.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))

  // Keep it on-topic ("Planning & property news"); only widen if too thin.
  const relevant = merged.filter((i) => RELEVANT.test(`${i.title} ${i.summary}`))
  const pool = relevant.length >= 6 ? relevant : merged

  return { items: pool.slice(0, limit), live: true, fetchedAt: new Date().toISOString() }
}
