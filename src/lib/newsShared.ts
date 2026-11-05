/** Client-safe pieces shared by the news server code, ticker and /updates page. */

export type NewsCategory = 'Planning' | 'Housing' | 'Consultation' | 'Local government' | 'General'

export interface NewsItem {
  id: string
  title: string
  url: string
  /** ISO date string, '' when unknown */
  date: string
  summary: string
  category: NewsCategory
  source: string
}

export interface NewsResult {
  items: NewsItem[]
  /** false when we had to fall back to static links */
  live: boolean
  fetchedAt: string
}

export const CATEGORY_COLOURS: Record<NewsCategory, string> = {
  Planning: '#ec3f9c',
  Housing: '#2f8cff',
  Consultation: '#f5b82e',
  'Local government': '#14c8b0',
  General: '#8b9bb8',
}

export function formatNewsDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London',
  })
}
