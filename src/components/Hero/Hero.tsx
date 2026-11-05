'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeroVideoBackground } from '@/components/home/HeroVideoBackground'
import { MapPin, ArrowRight, CircleCheck, FileText, Home, Layers, Warehouse, DoorOpen, ChevronDown, ChevronRight } from "lucide-react";

// goalId = id in lib/goals.ts (the /check/[goalId] route)
const projects = [
  { label: "Extension", goalId: "ext", Icon: Home },
  { label: "Loft conversion", goalId: "loft", Icon: Layers },
  { label: "Outbuilding", goalId: "outbuilding", Icon: Warehouse },
  { label: "Windows & doors", goalId: "windows", Icon: DoorOpen },
] as const;

const points = [
  [CircleCheck, "Understand\nyour options"],
  [FileText, "Get clear\nnext steps"],
  [CircleCheck, "Plan with\nconfidence"],
] as const;

export default function Hero() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [goalId, setGoalId] = useState('unsure')

  // Same destination as the main hero: the chat takes it from here;
  // the typed address (if any) is passed along as the query.
  function go(id: string) {
    const params = new URLSearchParams({ actor: 'homeowner' })
    if (address.trim()) params.set('q', address.trim())
    router.push(`/check/${id}?${params.toString()}`)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    go(goalId)
  }

  return (
    <section className="hero-hero">
      <div className="hero-video"><HeroVideoBackground /></div>
      <div className={`container hero-inner`}>
        <p className="hero-eyebrow">PLAN SMARTER · BUILD BRIGHTER</p>
        <h1>Your home.<br />More <span>possibilities.</span></h1>
        <p className="hero-sub">Get a clear, personalised view of what may be possible{' '}<br />for your property with AI-powered planning intelligence.</p>
        <form className="hero-search" onSubmit={onSubmit}>
          <MapPin size={18} color="var(--cyan)" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address or postcode"
            aria-label="Property address"
          />
          {/* Large screens only: the extra field that fills the width */}
          <label className="hero-project">
            <span className="sr-only">Type of project</span>
            <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
              <option value="unsure">What are you planning?</option>
              {projects.map((p) => (<option key={p.goalId} value={p.goalId}>{p.label}</option>))}
            </select>
            <ChevronDown size={14} aria-hidden />
          </label>
          <button type="submit" className="hero-go">Check my property <ArrowRight size={16} /></button>
        </form>
        <ul className="hero-points">
          {points.map(([Icon, t]) => (
            <li key={t}><Icon size={30} strokeWidth={1.3} /><span>{t}</span></li>
          ))}
        </ul>
        <aside className="hero-popular" aria-label="Popular projects">
          <p className="hero-pop-title">Popular projects <small>Pick one to start your check</small></p>
          <ul>
            {projects.map(({ label, goalId: id, Icon }) => (
              <li key={id}>
                <button type="button" className="hero-pop-item" onClick={() => go(id)} aria-label={`Start a ${label} check`}>
                  <span className="hero-pop-ico"><Icon size={16} /></span>
                  <span className="hero-pop-lbl">{label}</span>
                  <ChevronRight size={16} className="hero-pop-go" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <p className="hero-script">Intelligent Planning,<br />brighter futures</p>
      </div>
    </section>
  );
}
