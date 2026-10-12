export function BulkImportWidget({ className }: { className?: string }) {
  return (
    <div className={`rounded-[14px] border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.05)] p-5 ${className ?? ''}`}>
      <p className="text-[13px] font-semibold text-[#E8F0FF] mb-1">Bulk portfolio check</p>
      <p className="text-[12px] text-[#A8B8D8] mb-4 leading-relaxed">
        Upload a CSV of addresses to run planning checks across your entire portfolio at once.
      </p>
      <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#00D4FF] text-[#050A12] text-[12.5px] font-semibold hover:bg-[#33DDFF] transition-colors">
        Upload CSV →
      </button>
    </div>
  )
}
