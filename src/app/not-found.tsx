// import Link from 'next/link'

// export default function NotFound() {
//   return (
//     <main className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
//       <div className="text-center">
//         <p
//           className="font-display text-[96px] font-normal leading-none mb-4"
//           style={{ color: '#135BEC', textShadow: '0 0 40px rgba(19,91,236,0.4)' }}
//         >
//           404
//         </p>
//         <h1 className="text-xl font-semibold text-[#E8F0FF] mb-2">
//           Page not found
//         </h1>
//         <p className="text-[#5A6A8A] text-sm mb-8">
//           The page you're looking for doesn't exist.
//         </p>
//         <Link
//           href="/"
//           className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors duration-150"
//         >
//           ← Back home
//         </Link>
//       </div>
//     </main>
//   )
// }

import Link from 'next/link'

/**
 * not-found.tsx
 * ──────────────
 * AI4Planning · 404
 *
 * Concept: "Site not on record" — planning map language.
 * - Faint planning-grid SVG fills the background (the "404" ghost)
 * - Animated GPS-ping marker as the hero element
 * - Copy uses planning vocabulary
 * - Ambient radial glow matches auth system palette
 */
export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center px-5 overflow-hidden">

      {/* ── Background: ghost planning grid ──────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">

        {/* Radial glow — top centre */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(19,91,236,0.07) 0%, transparent 70%)' }}
        />

        {/* "404" ghost — large watermark made of planning grid parcels */}
        <svg
          viewBox="0 0 900 340"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(900px,110vw)] opacity-[0.055]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ─ 4 (left) ─ */}
          <g stroke="#135BEC" strokeWidth="1">
            {/* vertical left */}
            <line x1="60" y1="40" x2="60" y2="200" />
            <line x1="80" y1="40" x2="80" y2="200" />
            <line x1="100" y1="40" x2="100" y2="200" />
            <line x1="120" y1="40" x2="120" y2="200" />
            {/* horizontal mid */}
            <line x1="60" y1="160" x2="220" y2="160" />
            <line x1="60" y1="180" x2="220" y2="180" />
            {/* vertical right */}
            <line x1="200" y1="40" x2="200" y2="300" />
            <line x1="220" y1="40" x2="220" y2="300" />
            {/* grid fill — left bar */}
            <line x1="60" y1="60" x2="120" y2="60" /><line x1="60" y1="80" x2="120" y2="80" />
            <line x1="60" y1="100" x2="120" y2="100" /><line x1="60" y1="120" x2="120" y2="120" />
            <line x1="60" y1="140" x2="120" y2="140" />
            {/* grid fill — right bar */}
            <line x1="200" y1="200" x2="220" y2="200" /><line x1="200" y1="220" x2="220" y2="220" />
            <line x1="200" y1="240" x2="220" y2="240" /><line x1="200" y1="260" x2="220" y2="260" />
            <line x1="200" y1="280" x2="220" y2="280" />
          </g>

          {/* ─ 0 ─ */}
          <g stroke="#135BEC" strokeWidth="1">
            <rect x="320" y="40" width="160" height="260" rx="0" />
            <line x1="340" y1="40" x2="340" y2="300" /><line x1="360" y1="40" x2="360" y2="300" />
            <line x1="380" y1="40" x2="380" y2="300" /><line x1="400" y1="40" x2="400" y2="300" />
            <line x1="420" y1="40" x2="420" y2="300" /><line x1="440" y1="40" x2="440" y2="300" />
            <line x1="460" y1="40" x2="460" y2="300" />
            <line x1="320" y1="60" x2="480" y2="60" /><line x1="320" y1="80" x2="480" y2="80" />
            <line x1="320" y1="100" x2="480" y2="100" /><line x1="320" y1="120" x2="480" y2="120" />
            <line x1="320" y1="140" x2="480" y2="140" /><line x1="320" y1="160" x2="480" y2="160" />
            <line x1="320" y1="180" x2="480" y2="180" /><line x1="320" y1="200" x2="480" y2="200" />
            <line x1="320" y1="220" x2="480" y2="220" /><line x1="320" y1="240" x2="480" y2="240" />
            <line x1="320" y1="260" x2="480" y2="260" /><line x1="320" y1="280" x2="480" y2="280" />
            {/* hollow centre */}
            <rect x="340" y="60" width="120" height="220" fill="#0A0E1A" stroke="none" />
          </g>

          {/* ─ 4 (right) ─ */}
          <g stroke="#135BEC" strokeWidth="1">
            <line x1="580" y1="40" x2="580" y2="200" />
            <line x1="600" y1="40" x2="600" y2="200" />
            <line x1="620" y1="40" x2="620" y2="200" />
            <line x1="640" y1="40" x2="640" y2="200" />
            <line x1="580" y1="160" x2="740" y2="160" />
            <line x1="580" y1="180" x2="740" y2="180" />
            <line x1="720" y1="40" x2="720" y2="300" />
            <line x1="740" y1="40" x2="740" y2="300" />
            <line x1="580" y1="60" x2="640" y2="60" /><line x1="580" y1="80" x2="640" y2="80" />
            <line x1="580" y1="100" x2="640" y2="100" /><line x1="580" y1="120" x2="640" y2="120" />
            <line x1="580" y1="140" x2="640" y2="140" />
            <line x1="720" y1="200" x2="740" y2="200" /><line x1="720" y1="220" x2="740" y2="220" />
            <line x1="720" y1="240" x2="740" y2="240" /><line x1="720" y1="260" x2="740" y2="260" />
            <line x1="720" y1="280" x2="740" y2="280" />
          </g>
        </svg>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      {/* ── Hero content ─────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[420px]">

        {/* Animated GPS ping marker */}
        <div className="relative mb-8 w-16 h-16 flex items-center justify-center">
          {/* Ping rings */}
          <span className="absolute inset-0 rounded-full border border-[#135BEC]/30 animate-[ping_2s_ease-out_infinite]" />
          <span className="absolute inset-2 rounded-full border border-[#135BEC]/20 animate-[ping_2s_ease-out_0.4s_infinite]" />
          {/* Pin body */}
          <div className="relative w-10 h-10 rounded-full bg-[#0F1525] border border-[#135BEC]/40 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#135BEC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
              {/* X over pin */}
              <line x1="4" y1="4" x2="20" y2="20" stroke="#F87171" strokeWidth="1.5"/>
              <line x1="20" y1="4" x2="4" y2="20" stroke="#F87171" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        {/* Eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5A6A8A] mb-3">
          Coordinates not found
        </p>

        {/* Title */}
        <h1 className="font-display text-[36px] sm:text-[44px] font-normal leading-[1.1] tracking-tight text-[#E8F0FF] mb-4">
          This site isn't<br />on the record.
        </h1>

        {/* Body */}
        <p className="text-[14px] text-[#5A6A8A] leading-relaxed mb-8">
          The page you requested has no planning reference,
          no application number, and no site boundary.
          It may have been moved, demolished, or never existed.
        </p>

        {/* Status chip */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141C30] border border-white/[0.08] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] animate-pulse" />
          <span className="text-[11px] font-mono text-[#5A6A8A] tracking-widest">
            REF: 404 · STATUS: NOT FOUND
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#135BEC] text-white text-[13px] font-semibold tracking-wide hover:bg-[#2A6BF0] active:scale-[0.97] transition-all duration-150"
          >
            ← Back to homepage
          </Link>
          {/* <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-transparent border border-white/[0.12] text-[#A8B8D8] text-[13px] font-semibold tracking-wide hover:border-white/[0.25] hover:text-[#E8F0FF] active:scale-[0.97] transition-all duration-150"
          >
            Go to dashboard
          </Link> */}
        </div>
      </div>

      {/* ── Bottom corner grid ref ────────────────────────────── */}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none" aria-hidden="true">
        <p className="font-mono text-[10px] text-[#1E2A42] tracking-widest">
          AI4PLANNING · GRID REF: 404/NF
        </p>
        <p className="font-mono text-[10px] text-[#1E2A42] tracking-widest">
          {new Date().getFullYear()} · SITE INTELLIGENCE
        </p>
      </div>
    </main>
  )
}