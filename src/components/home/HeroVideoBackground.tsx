'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * HeroVideoBackground
 * ─────────────────────
 * Full-bleed cinematic video behind the hero copy — the glowing blue
 * network animation the brand palette was basically built around.
 *
 * Loading strategy (this is the whole point of the component):
 *  1. The poster JPG (~130KB) is a normal <img>-equivalent background
 *     and paints immediately — there is never a blank/black hero.
 *  2. The <video> itself isn't mounted until after first paint (a
 *     `mounted` flag set in useEffect), so it never competes with the
 *     hero text for the browser's initial parse/LCP budget.
 *  3. Once mounted it only starts loading (`preload="auto"`) if the
 *     visitor hasn't asked for reduced motion and isn't on a
 *     save-data / slow connection — everyone else just keeps the
 *     poster, which looks intentional on its own.
 *  4. The video is muted/loop/playsInline so autoplay is allowed by
 *     every mobile browser, and it cross-fades in on `canplaythrough`
 *     rather than popping in over the poster.
 *  5. It's `aria-hidden` + decorative only; all real content (the
 *     headline, search bar) is unchanged and simply layered on top.
 */
export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  // Defer to after first paint so the video element never competes
  // with the hero headline/search bar for initial render priority.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Decide once, on the client, whether this visitor should get the
  // motion at all.
  useEffect(() => {
    if (!mounted) return

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const conn = (navigator as any).connection
    const isSlowOrSaveData =
      !!conn && (conn.saveData === true || /^(slow-2g|2g)$/.test(conn.effectiveType ?? ''))

    setCanPlayVideo(!prefersReducedMotion && !isSlowOrSaveData)
  }, [mounted])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Poster — paints instantly, stays underneath as a fallback for
          reduced-motion / slow-connection visitors and while the
          video itself is still buffering. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero/hero-bg-poster.jpg)' }}
      />

      {mounted && canPlayVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out"
          style={{ opacity: videoReady ? 1 : 0 }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero/hero-bg-poster.jpg"
          onCanPlayThrough={() => setVideoReady(true)}
        >
          <source src="/hero/hero-bg.webm" type="video/webm" />
          <source src="/hero/hero-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Legibility overlay — same navy as the page background, fading
          out toward the top-center so the footage still reads clearly
          behind the eyebrow/headline while the edges stay grounded. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 900px 520px at 50% 30%, rgba(10,14,26,0.55) 0%, rgba(10,14,26,0.78) 55%, rgba(10,14,26,0.94) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(to bottom, transparent, #0A0E1A)' }}
      />
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{ background: 'linear-gradient(to top, transparent, #0A0E1A)' }}
      />
    </div>
  )
}
