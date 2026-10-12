import { cn } from '@/lib/cn'

export function AuthDivider({ label = 'or', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 my-5', className)}>
      <div className="flex-1 h-px bg-white/[0.08]" />
      <span className="text-[11px] font-medium uppercase tracking-widest text-[#5A6A8A]">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/[0.08]" />
    </div>
  )
}
