import Link from 'next/link'

export function QuickCheckWidget({ className }: { className?: string }) {
  return (
    <div className={`rounded-[14px] border border-[rgba(19,91,236,0.25)] bg-[rgba(19,91,236,0.05)] p-5 ${className ?? ''}`}>
      <p className="text-[13px] font-semibold text-[#E8F0FF] mb-1">Start a new planning check</p>
      <p className="text-[12px] text-[#A8B8D8] mb-4 leading-relaxed">
        Got another property or project? Get a free result in under 2 minutes.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#135BEC] text-white text-[12.5px] font-semibold hover:bg-[#2A6BF0] transition-colors"
      >
        New check →
      </Link>
    </div>
  )
}
