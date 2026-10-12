'use client'

/**
 * AssistantOrb.tsx
 * ──────────────────
 * The floating assistant's visual identity: a small speckled sphere in
 * AI4Planning's brand blue, rather than a generic chat-bubble icon.
 * Deliberately built from plain SVG + Tailwind's built-in `spin`/`pulse`
 * keyframes (no custom keyframes to add to the Tailwind config, no
 * external image asset) so it drops in anywhere.
 *
 * `state` drives how "alive" it looks:
 *   idle        — slow drift, calm glow (the resting floating button)
 *   thinking    — faster spin, brighter glow (model is composing a reply)
 *   working     — same, used while a confirmed action is executing
 *   redirecting — same, used in the moment before navigating
 */

export type OrbState = 'idle' | 'thinking' | 'working' | 'redirecting'

const SPIN_DURATION: Record<OrbState, string> = {
  idle: '18s',
  thinking: '3s',
  working: '2.5s',
  redirecting: '2s',
}

export function AssistantOrb({ size = 32, state = 'idle' }: { size?: number; state?: OrbState }) {
  const active = state !== 'idle'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 transition-[box-shadow] duration-300 ${active ? 'animate-pulse' : ''}`}
      style={{
        width: size,
        height: size,
        boxShadow: active
          ? '0 0 16px 3px rgba(19,91,236,0.55), inset 0 0 8px rgba(255,255,255,0.15)'
          : '0 0 8px 1px rgba(19,91,236,0.3), inset 0 0 6px rgba(255,255,255,0.1)',
      }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="animate-spin"
        style={{ animationDuration: SPIN_DURATION[state] }}
      >
        <defs>
          <radialGradient id="orbBase" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#5B92FF" />
            <stop offset="50%" stopColor="#135BEC" />
            <stop offset="100%" stopColor="#08245F" />
          </radialGradient>
          <filter id="orbGrain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0" result="speckle" />
            <feComposite in="speckle" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#orbBase)" />
        <circle cx="32" cy="32" r="30" filter="url(#orbGrain)" opacity="0.55" />
        <circle cx="24" cy="20" r="7" fill="rgba(255,255,255,0.35)" />
      </svg>
    </span>
  )
}
