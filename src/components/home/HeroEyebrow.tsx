import { cn } from '@/lib/cn'

interface HeroEyebrowProps {
  text?:      string
  className?: string
}

/**
 * HeroEyebrow
 * ────────────
 * Small ALL-CAPS label above the H1. Contains an animated pulse dot
 * to reinforce the "live / AI-powered" feel.
 */
export function HeroEyebrow({
  text      = 'AI-powered planning advice',
  className,
}: HeroEyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 mb-5',
        'px-3 py-1.5 rounded-full',
        'border border-[rgba(0,212,255,0.25)]',
        'bg-[rgba(0,212,255,0.06)]',
        className
      )}
    >
      {/* Pulse dot */}
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: '#00D4FF' }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: '#00D4FF', boxShadow: '0 0 6px rgba(0,212,255,0.8)' }}
        />
      </span>

      <span
        className="text-[11px] font-semibold tracking-[0.1em] uppercase"
        style={{ color: '#00D4FF', textShadow: '0 0 16px rgba(0,212,255,0.5)' }}
      >
        {text}
      </span>
    </div>
  )
}
