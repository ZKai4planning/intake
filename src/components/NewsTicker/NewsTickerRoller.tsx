'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { CATEGORY_COLOURS, formatNewsDate, type NewsItem } from '@/lib/newsShared'

const INTERVAL_MS = 4500

/**
 * Headlines roll upward one at a time. Pauses on hover/focus, and doesn't
 * auto-advance for people who prefer reduced motion (the arrows still work).
 * The first item is repeated at the end so the loop never visibly rewinds.
 */
export default function NewsTickerRoller({ items }: { items: NewsItem[] }) {
  const n = items.length
  const slides = n > 1 ? [...items, items[0]] : items
  const [idx, setIdx] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const next = useCallback(() => setIdx((i) => Math.min(i + 1, n)), [n])

  const prev = useCallback(() => {
    if (idx > 0) return setIdx(idx - 1)
    // jump (no animation) to the duplicate at the end, then roll up from there
    setAnimate(false)
    setIdx(n)
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => {
        setAnimate(true)
        setIdx(n - 1)
      })
    })
  }, [idx, n])

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current) }, [])

  useEffect(() => {
    if (n < 2 || paused || reduced) return
    const t = setInterval(next, INTERVAL_MS)
    return () => clearInterval(t)
  }, [n, paused, reduced, next])

  // After rolling onto the duplicate, snap back to the real first item.
  const onTransitionEnd = () => {
    if (n > 1 && idx === n) {
      setAnimate(false)
      setIdx(0)
      frame.current = requestAnimationFrame(() => setAnimate(true))
    }
  }

  const current = n ? (idx % n) + 1 : 0

  return (
    <>
      <div
        className="nt-roller"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <ul
          className="nt-slides"
          style={{
            transform: `translateY(calc(${idx} * var(--nt-row) * -1))`,
            transition: animate ? 'transform .55s cubic-bezier(.65,0,.35,1)' : 'none',
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((it, i) => {
            const active = i === idx
            return (
              <li key={`${it.id}-${i}`} className="nt-slide" aria-hidden={!active}>
                <i style={{ background: CATEGORY_COLOURS[it.category] }} />
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={active ? 0 : -1}
                  className="nt-item"
                >
                  <span className="nt-title">{it.title}</span>
                  <small>
                    {[formatNewsDate(it.date), it.category].filter(Boolean).join(' · ')}
                  </small>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      {n > 1 && (
        <div className="nt-ctrl" role="group" aria-label="News headline controls">
          <button type="button" onClick={prev} aria-label="Previous headline"><ChevronUp size={16} /></button>
          <span aria-hidden>{current}/{n}</span>
          <button type="button" onClick={next} aria-label="Next headline"><ChevronDown size={16} /></button>
        </div>
      )}

      <Link href="/updates" className="nt-all">
        View all updates <ArrowRight size={14} />
      </Link>
    </>
  )
}
