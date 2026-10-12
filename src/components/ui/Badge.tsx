import { cn } from '@/lib/cn'

const VARIANTS = {
  blue:   'bg-[rgba(19,91,236,0.10)] text-[#135BEC] border border-[rgba(19,91,236,0.25)]',
  cyan:   'bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border border-[rgba(0,212,255,0.20)]',
  purple: 'bg-[rgba(139,92,246,0.10)] text-[#8B5CF6] border border-[rgba(139,92,246,0.25)]',
  amber:  'bg-[rgba(245,158,11,0.10)] text-[#F59E0B] border border-[rgba(245,158,11,0.25)]',
  red:    'bg-[rgba(248,113,113,0.10)] text-[#F87171] border border-[rgba(248,113,113,0.25)]',
  muted:  'bg-white/[0.05] text-[#A8B8D8] border border-white/[0.12]',
} as const

interface BadgeProps {
  variant?:  keyof typeof VARIANTS
  children:  React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-[3px] rounded-full',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
