'use client'

import { HeroEyebrow }      from './HeroEyebrow'
import { HeroHeadline }     from './HeroHeadline'
import { HeroActorSelect }  from './HeroActorSelect'
import { HeroVideoBackground } from './HeroVideoBackground'

export function HeroSection() {
  return (
    <section
  className="relative overflow-hidden bg-[#0A0E1A] min-h-[92vh] flex flex-col"
  aria-labelledby="hero-heading"
>
  {/* Background layers — pinned behind everything */}
  <div className="absolute inset-0 z-0">
    <HeroVideoBackground />
  </div>

  <div className="absolute inset-0 z-[1]">
    <AmbientBackground />
  </div>

  {/* Foreground content */}
  <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-24 sm:pt-28 md:pt-32 pb-12">
    {/* Outer column */}
    <div className="max-w-[720px] w-full mx-auto flex flex-col items-center">
      <HeroEyebrow className="mb-5" />

      {/* Headline + subtext */}
      <div className="max-w-[560px] text-center">
        <HeroHeadline
          id="hero-heading"
          className="mb-4"
        />

        <p className="text-[15px] sm:text-[16px] text-[#8A96B8] leading-relaxed mb-9">
          Describe your project and we'll check it against local planning
          policy, then connect you with the right next step.
        </p>
      </div>

      <HeroActorSelect className="max-w-[560px]" />
    </div>
  </div>
</section>
  )
}

// ── Ambient Background ─────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 dot-grid opacity-60" />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(19,91,236,0.14) 0%, rgba(19,91,236,0.05) 40%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />
      <div
        className="absolute top-[15%] right-0 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-[30%] left-0 w-[350px] h-[350px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(19,91,236,0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0A0E1A)',
        }}
      />
    </div>
  )
}