'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────────────────────────────────────────
// Types declaration (avoids need for @types/matter-js)
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MatterLib = any

export interface FloatingLabelItem {
  id:        string
  text:      string
  onSelect?: (text: string) => void
}

interface FloatingLabelsProps {
  items:      FloatingLabelItem[]
  height?:    number
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Pill sizing & colours
// ─────────────────────────────────────────────────────────────────────────────

const PILL_H = 38
const CHAR_W = 8.4
const PAD_X  = 32
const MIN_W  = 110

function pillWidth(text: string) {
  return Math.max(MIN_W, Math.ceil(text.length * CHAR_W + PAD_X * 2))
}

const STYLES = [
  { fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.20)', text: '#C8D8F8' },
  { fill: 'rgba(0,232,122,0.10)',   stroke: 'rgba(0,232,122,0.40)',   text: '#00E87A' },
  { fill: 'rgba(0,212,255,0.10)',   stroke: 'rgba(0,212,255,0.38)',   text: '#00D4FF' },
  { fill: 'rgba(139,92,246,0.10)',  stroke: 'rgba(139,92,246,0.38)',  text: '#A78BFA' },
  { fill: 'rgba(251,191,36,0.10)',  stroke: 'rgba(251,191,36,0.36)',  text: '#FCD34D' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FloatingLabels({
  items,
  height    = 300,
  className,
}: FloatingLabelsProps) {
  const wrapRef    = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Store Matter objects for teardown
  const mRef = useRef<{
    M:      MatterLib
    engine: MatterLib
    render: MatterLib
    runner: MatterLib
  } | null>(null)

  const teardown = useCallback(() => {
    const s = mRef.current
    if (!s) return
    s.M.Render.stop(s.render)
    s.M.Runner.stop(s.runner)
    s.M.Composite.clear(s.engine.world, false)
    s.M.Engine.clear(s.engine)
    mRef.current = null
    if (overlayRef.current) overlayRef.current.innerHTML = ''
  }, [])

  const build = useCallback(async () => {
    teardown()

    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    // ── Dynamic import (Next.js SSR safe) ────────────────────────────────
    // @ts-ignore — types not installed, that's fine
    const M = await import('matter-js')

    const W = wrap.offsetWidth
    const H = height

    // Make canvas match container
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    canvas.style.width  = `${W}px`
    canvas.style.height = `${H}px`

    // ── Engine ──
    const engine = M.Engine.create({ gravity: { x: 0, y: 1.1 } })

    // ── Renderer ──
    const render = M.Render.create({
      canvas,
      engine,
      options: {
        width:      W,
        height:     H,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio ?? 1,
      },
    })

    // ── Invisible static walls ──
    const wall = (x: number, y: number, w: number, h: number) =>
      M.Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        render: { fillStyle: 'transparent', strokeStyle: 'transparent', lineWidth: 0 },
        collisionFilter: { category: 0x0002, mask: 0x0001 },
      })

    const T = 80
    M.Composite.add(engine.world, [
      wall(W / 2,    H + T / 2,   W + T * 2, T),      // floor
      wall(-T / 2,   H / 2,       T,         H * 4),   // left wall
      wall(W + T / 2, H / 2,      T,         H * 4),   // right wall
    ])

    // ── Spawn pills staggered ──
    items.forEach((item, i) => {
      const delay = i * 160 + Math.random() * 80

      setTimeout(() => {
        if (!mRef.current) return

        const w   = pillWidth(item.text)
        const sty = STYLES[i % STYLES.length]
        const x   = Math.random() * Math.max(w, W - w) + w / 2
        const y   = -PILL_H

        const body = M.Bodies.rectangle(x, y, w, PILL_H, {
          chamfer:    { radius: PILL_H / 2 },
          restitution: 0.30,
          friction:    0.05,
          frictionAir: 0.016,
          density:     0.002,
          label:       item.id,
          collisionFilter: { category: 0x0001, mask: 0x0003 },
          render: {
            fillStyle:   sty.fill,
            strokeStyle: sty.stroke,
            lineWidth:   1.5,
          },
        })

        M.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06)
        M.Composite.add(engine.world, body)
      }, delay)
    })

    // ── Mouse constraint (drag & throw) ──
    const mouse = M.Mouse.create(canvas)
    const mc    = M.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })

    // Prevent canvas stealing scroll wheel
    try {
      mc.mouse.element.removeEventListener('mousewheel',    mc.mouse.mousewheel)
      mc.mouse.element.removeEventListener('DOMMouseScroll',mc.mouse.mousewheel)
    } catch (_) {}

    M.Composite.add(engine.world, mc)

    // ── Click detection (click = move < 6px) ──
    let dragStart: { x: number; y: number } | null = null
    M.Events.on(mc, 'startdrag', (e: any) => {
      dragStart = { x: e.mouse.position.x, y: e.mouse.position.y }
    })
    M.Events.on(mc, 'enddrag', (e: any) => {
      if (!dragStart || !e.body) { dragStart = null; return }
      const dist = Math.hypot(
        e.mouse.position.x - dragStart.x,
        e.mouse.position.y - dragStart.y,
      )
      if (dist < 6) {
        const item = items.find(it => it.id === e.body.label)
        item?.onSelect?.(item.text)
      }
      dragStart = null
    })

    // ── Run ──
    const runner = M.Runner.create()
    M.Runner.run(runner, engine)
    M.Render.run(render)

    mRef.current = { M, engine, render, runner }
  }, [items, height, teardown])

  // ── Text overlay — sync HTML spans to body positions each rAF ──────────
  useEffect(() => {
    let rafId: number
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const s = mRef.current
      if (!s || !overlayRef.current) return

      const bodies: any[] = s.M.Composite.allBodies(s.engine.world).filter(
        (b: any) => b.label && !b.isStatic && items.some(it => it.id === b.label)
      )

      const alive = new Set<string>()

      bodies.forEach((body: any) => {
        const id   = body.label as string
        const item = items.find(it => it.id === id)
        if (!item) return
        alive.add(id)

        let el = overlayRef.current!.querySelector<HTMLDivElement>(`[data-pill="${id}"]`)
        if (!el) {
          const idx = items.findIndex(it => it.id === id)
          el = document.createElement('div')
          el.setAttribute('data-pill', id)
          el.style.cssText = `
            position:absolute;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:13px;
            font-weight:500;
            letter-spacing:0.01em;
            white-space:nowrap;
            pointer-events:none;
            border-radius:9999px;
            height:${PILL_H}px;
            width:${pillWidth(item.text)}px;
            transform-origin:center center;
            color:${STYLES[idx % STYLES.length].text};
          `
          el.textContent = item.text
          overlayRef.current!.appendChild(el)
        }

        const w = pillWidth(item.text)
        el.style.left      = `${body.position.x - w / 2}px`
        el.style.top       = `${body.position.y - PILL_H / 2}px`
        el.style.transform = `rotate(${body.angle}rad)`
      })

      // Remove labels for bodies that no longer exist
      overlayRef.current!.querySelectorAll<HTMLDivElement>('[data-pill]').forEach(el => {
        if (!alive.has(el.getAttribute('data-pill')!)) el.remove()
      })
    }
    tick()
    return () => cancelAnimationFrame(rafId)
  }, [items])

  // ── Responsive resize ──
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(build, 350)
    }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [build])

  // ── Mount / unmount ──
  useEffect(() => {
    build()
    return () => teardown()
  }, [build, teardown])

  return (
    <div
      ref={wrapRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ height }}
    >
      {/* Matter.js renders pill shapes onto this canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: 'block' }}
      />
      {/* HTML text labels rendered on top, position-synced each frame */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  )
}

