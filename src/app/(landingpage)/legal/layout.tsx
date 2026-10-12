import Link from 'next/link'
import { FOOTER_LINKS } from './_data/policies'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0E1A] overflow-hidden">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(19,91,236,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      

      {/* ── Page content ── */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      

    </div>
  )
}