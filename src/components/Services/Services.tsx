'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { addServiceToCart, getCart, serviceCartId } from '@/lib/cart'
import { Settings, ShoppingCart, Check, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const services = [
  { id: "measured-survey", t: "Measured survey", d: "Get accurate measurements for your drawings.", p: 299, img: "survey" },
  { id: "planning-drawings", t: "Planning drawings", d: "Existing & proposed drawings by qualified professionals.", p: 550, img: "drawings" },
  { id: "planning-consultant", t: "Planning consultant", d: "Book a consultation with a vetted planning expert.", p: 150, img: "consultant", badge: "Most popular" },
  { id: "title-plan-boundary", t: "Title plan & boundary check", d: "Check ownership, boundaries and constraints.", p: 120, img: "boundary" },
  { id: "building-regs", t: "Building Regulations support", d: "Structural advice, compliance and certification.", p: 350, img: "building-regs" },
  { id: "construction", t: "Construction", d: "Vetted builders and site teams to take your approved plans to completion.", p: 1500, img: "construction" },
];

export default function Services() {
  const [inCart, setInCart] = useState<Set<string>>(new Set())
  const trackRef = useRef<HTMLUListElement>(null)

  // Keep the buttons in sync with the real cart (also when it changes elsewhere).
  useEffect(() => {
    function refresh() {
      setInCart(new Set(getCart().map(i => i.reportId)))
    }
    refresh()
    window.addEventListener('cart:changed', refresh)
    return () => window.removeEventListener('cart:changed', refresh)
  }, [])

  function scrollTrack(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 220), behavior: 'smooth' })
  }

  return (
    <section className="svc-section">
      <div className={`container svc-wrap`}>
        <header className="svc-head">
          <span className="svc-icon"><Settings size={26} color="var(--cyan)" /></span>
          <div>
            <h2>Recommended for your project</h2>
            <p>Based on common projects in your area. You can add these later in your journey.</p>
          </div>
          <Link href="/#services" className="svc-all">View all services <ArrowRight size={14} /></Link>
        </header>
        <div className="svc-carousel">
          <button type="button" onClick={() => scrollTrack(-1)} className={`svc-nav svc-prev`} aria-label="Previous"><ChevronLeft size={16} /></button>
          <ul className="svc-track" ref={trackRef}>
            {services.map((s) => (
              <li key={s.t} className="svc-card">
                <div className="svc-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/home/${s.img}.jpg`} alt="" width={506} height={335} decoding="async" />
                  {s.badge && <span className="svc-badge">{s.badge}</span>}
                </div>
                <div className="svc-body">
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <strong>From £{s.p}</strong>
                  {inCart.has(serviceCartId(s.id)) ? (
                    <Link href="/cart" className="svc-add svc-added" aria-label={`${s.t} added — view cart`}>
                      <Check size={15} /> Added · View cart <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="svc-add"
                      onClick={() => addServiceToCart(s.id, s.t, s.p)}
                    >
                      <ShoppingCart size={15} /> Add to project <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => scrollTrack(1)} className={`svc-nav svc-next`} aria-label="Next"><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}
