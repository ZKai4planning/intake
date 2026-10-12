import { cn } from '@/lib/cn'

interface TrustItem {
  icon:  string
  label: string
}

const ITEMS: TrustItem[] = [
  { icon: '✅', label: 'Free result in under 2 minutes' },
  { icon: '📍', label: 'Tailored to your exact location' },
  { icon: '🛡️', label: 'No planning jargon' },
  { icon: '👤', label: 'Expert consultants on hand' },
]

interface HeroTrustBarProps {
  className?: string
}

/**
 * HeroTrustBar
 * ─────────────
 * Four short proof-points below the search bar.
 * Wraps gracefully on small screens.
 */
export function HeroTrustBar({ className }: HeroTrustBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-x-5 gap-y-2',
        'pt-5 mt-5 border-t border-white/[0.06]',
        className
      )}
      aria-label="Platform highlights"
    >
      {ITEMS.map(item => (
        <span
          key={item.label}
          className="flex items-center gap-1.5 text-xs text-[#5A6A8A]"
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </span>
      ))}
    </div>
  )
}
