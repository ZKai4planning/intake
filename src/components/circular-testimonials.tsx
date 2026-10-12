'use client'

import Image from 'next/image'
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface CircularTestimonial {
  quote: string
  name: string
  designation: string
  src: string
  focusAreas?: readonly string[]
}

interface CircularTestimonialsProps {
  testimonials: readonly CircularTestimonial[]
  autoplay?: boolean
}

const QUOTE_PREVIEW_LENGTH = 280

/**
 * CircularTestimonials
 * ───────────────────────
 * Rounded-square portrait with a peeking photo-stack behind it (the
 * previous and next member's photos, rotated and dimmed) — for the
 * team showcase. Same site accent (#00D4FF) and lucide-react icons,
 * no react-icons, no prop-driven colour/fontSize overrides since this
 * only appears on the team page.
 */
export function CircularTestimonials({ testimonials, autoplay = true }: CircularTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverPrev, setHoverPrev] = useState(false)
  const [hoverNext, setHoverNext] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const length = useMemo(() => testimonials.length, [testimonials])
  const active = useMemo(() => testimonials[activeIndex], [activeIndex, testimonials])
  const prevMember = useMemo(() => testimonials[(activeIndex - 1 + length) % length], [activeIndex, length, testimonials])
  const nextMember = useMemo(() => testimonials[(activeIndex + 1) % length], [activeIndex, length, testimonials])

  useEffect(() => {
    setExpanded(false)
  }, [activeIndex])

  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % length)
      }, 6000)
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
    }
  }, [autoplay, length])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % length)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [length])

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + length) % length)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [length])

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handlePrev, handleNext])

  const contentVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  }

  const needsTruncation = active.quote.length > QUOTE_PREVIEW_LENGTH
  const displayedQuote = expanded || !needsTruncation
    ? active.quote
    : `${active.quote.slice(0, QUOTE_PREVIEW_LENGTH).trimEnd()}…`

  return (
    <div className="circular-container">
      {/* Preload every photo off-screen so navigating (dots, arrows, or
          jumping several people at once) never hits an uncached image —
          that uncached moment is what showed as a flash of the card's
          background colour before the photo painted. */}
      <div aria-hidden="true" className="preload-layer">
        {testimonials.map(member => (
          <Image key={member.src} src={member.src} alt="" width={4} height={4} priority />
        ))}
      </div>

      <div className="circular-grid">

        {/* Portrait stack */}
        <div className="portrait-wrap">
          <div className="portrait-glow" aria-hidden="true" />

          {/* Peeking back cards — previous / next member, clickable */}
          <button
            type="button"
            className="stack-card stack-card-left"
            onClick={handlePrev}
            aria-label={`Show ${prevMember.name}`}
          >
            <Image src={prevMember.src} alt="" fill sizes="20rem" className="object-cover" />
          </button>
          <button
            type="button"
            className="stack-card stack-card-right"
            onClick={handleNext}
            aria-label={`Show ${nextMember.name}`}
          >
            <Image src={nextMember.src} alt="" fill sizes="20rem" className="object-cover" />
          </button>

          {/* Front card — old and new image crossfade with no unmount gap */}
          <div className="stack-card stack-card-front">
            <div className="portrait-image">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.src}
                  className="portrait-image-layer"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <Image
                    src={active.src}
                    alt={active.name}
                    fill
                    sizes="(min-width: 768px) 26rem, 80vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dot pagination */}
          <div className="dots" role="tablist" aria-label="Team members">
            {testimonials.map((member, i) => (
              <button
                key={member.name}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={member.name}
                onClick={() => goTo(i)}
                className={`dot ${i === activeIndex ? 'dot-active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="circular-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3 className="name">{active.name}</h3>
              <p className="designation">{active.designation}</p>

              {active.focusAreas && active.focusAreas.length > 0 && (
                <div className="chips">
                  {active.focusAreas.map(area => (
                    <span key={area} className="chip">{area}</span>
                  ))}
                </div>
              )}

              <p className="quote">
                {displayedQuote}
              </p>
              {needsTruncation && (
                <button
                  type="button"
                  className="read-more"
                  onClick={() => setExpanded(prev => !prev)}
                >
                  {expanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="arrow-buttons">
            <button
              className="arrow-button"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? '#00D4FF' : '#0B1224',
                boxShadow: hoverPrev ? '0 0 16px rgba(0,212,255,0.4)' : 'none',
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous team member"
            >
              <ChevronLeft size={22} color={hoverPrev ? '#050A12' : '#E8F0FF'} />
            </button>
            <button
              className="arrow-button"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? '#00D4FF' : '#0B1224',
                boxShadow: hoverNext ? '0 0 16px rgba(0,212,255,0.4)' : 'none',
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next team member"
            >
              <ChevronRight size={22} color={hoverNext ? '#050A12' : '#E8F0FF'} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preload-layer { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
        .circular-container { width: 100%; max-width: 72rem; margin: 0 auto; position: relative; }
        .circular-grid { display: grid; gap: 3rem; align-items: center; }

        .portrait-wrap { position: relative; display: flex; flex-direction: column; align-items: center; padding: 28px 0; }
        .portrait-glow {
          position: absolute; top: 42%; left: 50%;
          width: 480px; height: 380px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%);
          pointer-events: none;
        }

        .stack-card {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 26px;
          overflow: hidden;
          top: 28px;
        }
        button.stack-card {
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
        }
        .stack-card-left {
          left: 50%;
          transform: translateX(-60%) rotate(-9deg);
          opacity: 0.4;
          filter: saturate(0.7);
          z-index: 1;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          transition: opacity 0.25s, transform 0.25s;
        }
        .stack-card-left:hover { opacity: 0.65; transform: translateX(-62%) rotate(-9deg) scale(1.02); }
        .stack-card-right {
          left: 50%;
          transform: translateX(-40%) rotate(9deg);
          opacity: 0.4;
          filter: saturate(0.7);
          z-index: 1;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          transition: opacity 0.25s, transform 0.25s;
        }
        .stack-card-right:hover { opacity: 0.65; transform: translateX(-38%) rotate(9deg) scale(1.02); }
        .stack-card-front {
          position: relative;
          z-index: 2;
          width: 300px; height: 300px;
          border-radius: 26px;
          padding: 3px;
          background: linear-gradient(160deg, rgba(0,212,255,0.55), rgba(0,212,255,0.05));
          box-shadow: 0 24px 48px rgba(0,0,0,0.55);
        }
        .portrait-image {
          position: relative;
          width: 100%; height: 100%;
          border-radius: 23px;
          overflow: hidden;
          background: #0B1224;
        }
        .portrait-image-layer {
          position: absolute;
          inset: 0;
        }

        .dots { display: flex; gap: 8px; margin-top: 28px; }
        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: none; cursor: pointer; padding: 0;
          transition: background-color 0.25s, transform 0.25s;
        }
        .dot-active { background: #00D4FF; transform: scale(1.3); }

        .circular-content { display: flex; flex-direction: column; }
        .name { font-weight: 700; font-size: 1.5rem; color: #E8F0FF; margin-bottom: 0.2rem; }
        .designation { color: #00D4FF; font-size: 0.9rem; margin-bottom: 1rem; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.25rem; }
        .chip {
          font-size: 11.5px; font-weight: 600; color: #00D4FF;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 999px; padding: 4px 12px;
        }
        .quote { line-height: 1.75; color: #A8B8D8; font-size: 0.95rem; }
        .read-more {
          margin-top: 8px; padding: 0; border: none; background: none; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #E8F0FF;
        }
        .arrow-buttons { display: flex; gap: 1rem; padding-top: 1.75rem; }
        .arrow-button {
          width: 2.6rem; height: 2.6rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background-color 0.3s, box-shadow 0.3s;
          border: 1px solid rgba(0,212,255,0.25);
        }

        @media (min-width: 768px) {
          .circular-grid { grid-template-columns: 360px 1fr; }
        }
      `}</style>
    </div>
  )
}