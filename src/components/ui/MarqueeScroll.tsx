'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/cn'

export interface MarqueeItem {
  id:        string
  label:     string
  imageSrc:  string
  imageAlt?: string
}

interface MarqueeScrollProps {
  items:       MarqueeItem[]
  speed?:      number
  className?:  string
  labelSize?:  string
}

const IMG_W = 260
const IMG_H = 320

/**
 * MarqueeScroll
 * ─────────────
 * Infinite horizontal scroll.
 * On hover the preview image appears BEHIND the text, centred on the label.
 * The text remains fully readable on top.
 */
export function MarqueeScroll({
  items,
  speed     = 55,
  className,
  labelSize = 'text-4xl',
}: MarqueeScrollProps) {
  const [activeId,  setActiveId]  = useState<string | null>(null)
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 })

  const approxWidth = items.length * 240
  const duration    = approxWidth / speed

  const handleEnter = useCallback((id: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    setAnchorPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setActiveId(id)
  }, [])

  const handleLeave = useCallback(() => setActiveId(null), [])

  const activeItem = activeId ? items.find(i => i.id === activeId) : null

  return (
    <div className={cn('relative overflow-hidden w-full select-none', className)}>

      {/* ── Image layer — z-0, behind everything ── */}
      {activeItem && (
        <div
          className="fixed pointer-events-none"
          style={{
            left:   anchorPos.x - IMG_W / 2,
            top:    anchorPos.y - IMG_H / 2,
            width:  IMG_W,
            height: IMG_H,
            zIndex: 40,              // below text (z-50)
          }}
        >
          <div
            className="w-full h-full rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
              animation: 'img-pop 0.16s ease-out both',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeItem.imageSrc}
              alt={activeItem.imageAlt ?? activeItem.label}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Dark vignette so text on top stays legible */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Marquee text — z-50, always on top of image ── */}
      <div
        className="relative flex whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite`,
          zIndex: 50,
        }}
      >
        {[0, 1].map(copy => (
          <div key={copy} className="flex items-center gap-10 pr-10" aria-hidden={copy === 1}>
            {items.map(item => (
              <MarqueeLabel
                key={`${copy}-${item.id}`}
                item={item}
                labelSize={labelSize}
                isActive={activeId === item.id}
                onEnter={handleEnter}
                onLeave={handleLeave}
              />
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes img-pop {
          from { opacity: 0; transform: scale(0.86); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee-scroll"] { animation-play-state: paused; }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface MarqueeLabelProps {
  item:      MarqueeItem
  labelSize: string
  isActive:  boolean
  onEnter:   (id: string, el: HTMLElement) => void
  onLeave:   () => void
}

function MarqueeLabel({ item, labelSize, isActive, onEnter, onLeave }: MarqueeLabelProps) {
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <span
      ref={ref}
      className={cn(
        'relative inline-flex items-center gap-3 cursor-default',
        'transition-colors duration-150',
        labelSize,
        'font-semibold tracking-tight',
        // text always readable — brighten on hover
        isActive ? 'text-white' : 'text-white/60 hover:text-white/90',
      )}
      style={{ zIndex: 50 }}  // ensure text always above the fixed image
      onMouseEnter={() => ref.current && onEnter(item.id, ref.current)}
      onMouseLeave={onLeave}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" aria-hidden="true" />
      {item.label}
    </span>
  )
}