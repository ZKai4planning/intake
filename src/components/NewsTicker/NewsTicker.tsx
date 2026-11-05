import { Megaphone } from 'lucide-react'
import { getNews } from '@/lib/news'
import NewsTickerRoller from './NewsTickerRoller'

/**
 * Planning & property news strip. Fetches live GOV.UK headlines on the server
 * (cached 15 min) and hands them to the client-side roller that scrolls them up.
 */
export default async function NewsTicker() {
  const { items, live } = await getNews(8)

  return (
    <section className="nt-ticker" aria-label="Planning and property news">
      <div className="container nt-inner">
        <div className="nt-lead">
          <Megaphone size={32} color="#ec3f9c" />
          <div>
            <strong>Planning &amp; property news</strong>
            <small>{live ? 'Live from GOV.UK' : 'Latest updates. Stay informed.'}</small>
          </div>
        </div>
        <NewsTickerRoller items={items} />
      </div>
    </section>
  )
}
