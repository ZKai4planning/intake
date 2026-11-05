import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Megaphone, RefreshCw } from 'lucide-react'
import { getNews } from '@/lib/news'
import { CATEGORY_COLOURS, formatNewsDate, type NewsCategory } from '@/lib/newsShared'

export const metadata: Metadata = {
  title: 'Planning & property updates',
  description:
    'The latest planning policy, housing and local government announcements from GOV.UK, in one place.',
}

// Re-fetched from GOV.UK at most every 15 minutes (see lib/news.ts).
export const revalidate = 900

const CATEGORIES: NewsCategory[] = ['Planning', 'Housing', 'Consultation', 'Local government', 'General']

const slug = (c: string) => c.toLowerCase().replace(/\s+/g, '-')

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const { items, live, fetchedAt } = await getNews(50)

  const active = CATEGORIES.find((c) => slug(c) === searchParams?.category)
  const shown = active ? items.filter((i) => i.category === active) : items
  const counts = new Map<string, number>()
  for (const i of items) counts.set(i.category, (counts.get(i.category) ?? 0) + 1)
  const present = CATEGORIES.filter((c) => counts.has(c))

  const checked = new Date(fetchedAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  })

  return (
    <main className="up-page">
      <div className="container up-wrap">
        <header className="up-head">
          <span className="up-eyebrow"><Megaphone size={14} /> UPDATES</span>
          <h1>Planning &amp; property updates</h1>
          <p>
            Policy changes, guidance and consultations that could affect your project, pulled
            from GOV.UK so you don&apos;t have to go hunting.
          </p>
          <p className="up-meta">
            <RefreshCw size={12} />
            {live
              ? `Live from GOV.UK · refreshed every 15 minutes · last checked ${checked}`
              : 'Live feed is temporarily unavailable — showing useful GOV.UK links instead.'}
          </p>
        </header>

        {present.length > 1 && (
          <nav className="up-filters" aria-label="Filter updates by topic">
            <Link href="/updates" className={!active ? 'on' : ''} scroll={false}>
              All <b>{items.length}</b>
            </Link>
            {present.map((c) => (
              <Link
                key={c}
                href={`/updates?category=${slug(c)}`}
                className={active === c ? 'on' : ''}
                scroll={false}
              >
                <i style={{ background: CATEGORY_COLOURS[c] }} />
                {c} <b>{counts.get(c)}</b>
              </Link>
            ))}
          </nav>
        )}

        {shown.length === 0 ? (
          <p className="up-empty">No updates in this topic right now. <Link href="/updates">See all updates</Link></p>
        ) : (
          <ul className="up-grid">
            {shown.map((it) => (
              <li key={it.id}>
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="up-card">
                  <span className="up-tag" style={{ color: CATEGORY_COLOURS[it.category] }}>
                    <i style={{ background: CATEGORY_COLOURS[it.category] }} />
                    {it.category}
                  </span>
                  <h2>{it.title}</h2>
                  {it.summary && <p>{it.summary}</p>}
                  <span className="up-foot">
                    <span>{[formatNewsDate(it.date), it.source].filter(Boolean).join(' · ')}</span>
                    <span className="up-read">Read on GOV.UK <ArrowUpRight size={14} /></span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="up-note">
          Updates are summarised from public GOV.UK feeds under the Open Government Licence v3.0.
          For advice on your own property, <Link href="/">run a free planning check</Link>.
        </p>
      </div>
    </main>
  )
}
