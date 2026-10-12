// 'use client'

// import { useEffect, useState } from 'react'
// import { ArrowRight } from 'lucide-react'
// import { getTierDef, isPaidTier, nextTierId } from '@/lib/reportTiers'
// import { isReportUnlocked } from '@/lib/reportStorage'
// import { ReportDownloadGate } from './ReportDownloadGate'
// import { ReportPaywall } from './ReportPaywall'
// import type { TieredReportContent } from '@/lib/reportContent'
// import type { ReportTierId } from '@/types/reportTiers'

// interface ReportCardProps {
//   reportId: string
//   tier: ReportTierId
//   content: TieredReportContent
//   /** Hide the "upgrade to the next tier" section — used inside the chat flow, which already offers a tier menu after this card. */
//   hideUpgrade?: boolean
// }

// export function ReportCard({ reportId, tier, content, hideUpgrade }: ReportCardProps) {
//   const tierDef = getTierDef(tier)
//   const nextId = nextTierId(tier)
//   const nextTierDef = nextId ? getTierDef(nextId) : null

//   // isPaidTier(tier) only says this TIER is a paid product — locked
//   // also needs to know whether THIS report was actually paid for.
//   // Starts optimistic-locked (matches server/first-paint state) and
//   // corrects itself on mount once we can check localStorage.
//   const [locked, setLocked] = useState(() => isPaidTier(tier))

//   useEffect(() => {
//     setLocked(isPaidTier(tier) && !isReportUnlocked(reportId))
//     function onReportsChanged() {
//       setLocked(isPaidTier(tier) && !isReportUnlocked(reportId))
//     }
//     window.addEventListener('reports:changed', onReportsChanged)
//     return () => window.removeEventListener('reports:changed', onReportsChanged)
//   }, [reportId, tier])

//   return (
//     <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] p-4">
//       <div className="mb-3 flex items-center gap-2">
//         <span className="rounded-full bg-blue-500/15 border border-blue-400/30 px-2.5 py-1 text-[10.5px] font-bold text-[#00D4FF] uppercase tracking-wide">
//           {tierDef.badge}
//         </span>
//         <span className="text-[11px] text-[#5A6A8A]">{tierDef.name}</span>
//         {tierDef.priceGBP !== null && (
//           <span className="ml-auto text-[12px] font-semibold text-[#E8F0FF]">{tierDef.priceLabel}</span>
//         )}
//       </div>

//       <div className="mb-1.5 flex items-center gap-1.5">
//         <p className="text-[12.5px] font-medium text-[#A8B8D8]">{content.council}</p>
//         <span
//           className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
//             content.dataSource === 'live'
//               ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/25'
//               : 'bg-white/[0.04] text-[#5A6A8A] border border-white/[0.08]'
//           }`}
//           title={content.dataNote}
//         >
//           {content.dataSource === 'live' ? 'Live data' : 'Estimate'}
//         </span>
//       </div>

//       <p className="text-[14.5px] font-semibold text-[#E8F0FF] leading-relaxed">{content.route.title}</p>
//       <p className="mt-1 text-[13px] text-[#A8B8D8] leading-relaxed">{content.route.detail}</p>
//       {content.dataNote && <p className="mt-1 text-[11.5px] text-amber-300/80 leading-relaxed">{content.dataNote}</p>}

//       {content.likelyApplicationType && (
//         <p className="mt-3 text-[12.5px] text-[#A8B8D8]">
//           <span className="font-semibold text-[#E8F0FF]">Likely application type: </span>
//           {content.likelyApplicationType}
//         </p>
//       )}

//       <div className="mt-3 flex flex-wrap gap-1.5">
//         {content.constraintsChecked.map(c => (
//           <span
//             key={c.label}
//             title={c.detail}
//             className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
//               c.status === 'warning'
//                 ? 'bg-amber-500/10 text-amber-300 border border-amber-400/25'
//                 : 'bg-white/[0.04] text-[#A8B8D8] border border-white/[0.08]'
//             }`}
//           >
//             {c.label}
//           </span>
//         ))}
//       </div>

//       {!locked && content.risks && content.risks.length > 0 && (
//         <div className="mt-4 space-y-2">
//           <p className="text-[12px] font-semibold text-[#E8F0FF]">Risks</p>
//           {content.risks.map(risk => (
//             <div key={risk.title} className="rounded-lg bg-white/[0.03] px-3 py-2">
//               <p className="text-[12.5px] font-medium text-[#E8F0FF]">{risk.title}</p>
//               <p className="mt-0.5 text-[12px] text-[#A8B8D8] leading-relaxed">{risk.detail}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {!locked && content.missingInfo && content.missingInfo.length > 0 && (
//         <div className="mt-4">
//           <p className="text-[12px] font-semibold text-[#E8F0FF] mb-1.5">Missing information</p>
//           <ul className="space-y-1">
//             {content.missingInfo.map(item => (
//               <li key={item} className="text-[12.5px] text-[#A8B8D8] flex gap-2">
//                 <span className="text-[#5A6A8A]">•</span>
//                 {item}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {!locked && content.documents && content.documents.length > 0 && (
//         <div className="mt-4">
//           <p className="text-[12px] font-semibold text-[#E8F0FF] mb-1.5">Documents you'll likely need</p>
//           <ul className="space-y-1">
//             {content.documents.map(doc => (
//               <li key={doc.title} className="text-[12.5px] text-[#A8B8D8] flex gap-2">
//                 <span className="text-[#5A6A8A]">•</span>
//                 <span>
//                   {doc.title}
//                   {doc.detail && <span className="text-[#5A6A8A]"> — {doc.detail}</span>}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {!locked && content.complexityLevel && (
//         <p className="mt-4 text-[12.5px] text-[#A8B8D8]">
//           <span className="font-semibold text-[#E8F0FF]">Complexity: </span>
//           {content.complexityLevel} — recommended package: {content.recommendedPackage}
//         </p>
//       )}

//       {locked && (content.risks?.length || content.documents?.length) ? (
//         <p className="mt-4 text-[12.5px] text-[#A8B8D8]">
//           <span className="font-semibold text-[#E8F0FF]">
//             {content.risks?.length ?? 0} risk{content.risks?.length === 1 ? '' : 's'} found
//           </span>
//           {content.documents?.length ? ` and a ${content.documents.length}-item document checklist are` : ' is'} ready
//           — unlock below to see the full breakdown.
//         </p>
//       ) : null}

//       {!locked && (
//         <div className="mt-4">
//           <p className="text-[12px] font-semibold text-[#E8F0FF] mb-1.5">What to check next</p>
//           <ul className="space-y-1">
//             {content.whatToCheckNext.map(step => (
//               <li key={step} className="text-[12.5px] text-[#A8B8D8] flex gap-2">
//                 <span className="text-[#5A6A8A]">•</span>
//                 {step}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <p className="mt-4 text-[11.5px] italic text-[#5A6A8A]">{content.confidenceCaveat}</p>

//       {locked ? <ReportPaywall reportId={reportId} tier={tier} /> : <ReportDownloadGate reportId={reportId} />}

//       {!hideUpgrade && nextTierDef && (
//         <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
//           <p className="text-[12px] text-[#A8B8D8] leading-relaxed">{tierDef.upsellQuestion}</p>
//           <a
//             href={`/check/unsure?resumeReport=${reportId}&tier=${nextId}`}
//             className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff] transition-colors"
//           >
//             Continue to {nextTierDef.name}
//             {nextTierDef.priceGBP !== null && <span className="text-[#A8B8D8] font-normal">· {nextTierDef.priceLabel}</span>}
//             <ArrowRight className="h-3.5 w-3.5" />
//           </a>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { getTierDef, isPaidTier, nextTierId } from '@/lib/reportTiers'
import { isReportUnlocked } from '@/lib/reportStorage'
import { ReportDownloadGate } from './ReportDownloadGate'
import { ReportPaywall } from './ReportPaywall'
import type { TieredReportContent } from '@/lib/reportContent'
import type { ReportTierId } from '@/types/reportTiers'

interface ReportCardProps {
  reportId: string
  tier: ReportTierId
  content: TieredReportContent
  /** Hide the "upgrade to the next tier" section — used inside the chat flow, which already offers a tier menu after this card. */
  hideUpgrade?: boolean
  /** Trim the extra bottom detail (what-to-check-next list, confidence caveat) — used inside the chat flow, which keeps the free-report card focused on "log in to get the report". */
  compact?: boolean
}

export function ReportCard({ reportId, tier, content, hideUpgrade, compact }: ReportCardProps) {
  const tierDef = getTierDef(tier)
  const nextId = nextTierId(tier)
  const nextTierDef = nextId ? getTierDef(nextId) : null

  // isPaidTier(tier) only says this TIER is a paid product — locked
  // also needs to know whether THIS report was actually paid for.
  // Starts optimistic-locked (matches server/first-paint state) and
  // corrects itself on mount once we can check localStorage.
  const [locked, setLocked] = useState(() => isPaidTier(tier))

  useEffect(() => {
    setLocked(isPaidTier(tier) && !isReportUnlocked(reportId))
    function onReportsChanged() {
      setLocked(isPaidTier(tier) && !isReportUnlocked(reportId))
    }
    window.addEventListener('reports:changed', onReportsChanged)
    return () => window.removeEventListener('reports:changed', onReportsChanged)
  }, [reportId, tier])

  return (
    <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-blue-500/15 border border-blue-400/30 px-2.5 py-1 text-[10.5px] font-bold text-[#00D4FF] uppercase tracking-wide">
          {tierDef.badge}
        </span>
        <span className="text-[11px] text-[#5A6A8A]">{tierDef.name}</span>
        {tierDef.priceGBP !== null && (
          <span className="ml-auto text-[12px] font-semibold text-[#E8F0FF]">{tierDef.priceLabel}</span>
        )}
      </div>

      <div className="mb-1.5 flex items-center gap-1.5">
        <p className="text-[12.5px] font-medium text-[#A8B8D8]">{content.council}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            content.dataSource === 'live'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/25'
              : 'bg-white/[0.04] text-[#5A6A8A] border border-white/[0.08]'
          }`}
          title={content.dataNote}
        >
          {content.dataSource === 'live' ? 'Live data' : 'Estimate'}
        </span>
      </div>

      <p className="text-[14.5px] font-semibold text-[#E8F0FF] leading-relaxed">{content.route.title}</p>
      <p className="mt-1 text-[13px] text-[#A8B8D8] leading-relaxed">{content.route.detail}</p>
      {content.dataNote && <p className="mt-1 text-[11.5px] text-amber-300/80 leading-relaxed">{content.dataNote}</p>}

      {content.likelyApplicationType && (
        <p className="mt-3 text-[12.5px] text-[#A8B8D8]">
          <span className="font-semibold text-[#E8F0FF]">Likely application type: </span>
          {content.likelyApplicationType}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {content.constraintsChecked.map(c => (
          <span
            key={c.label}
            title={c.detail}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              c.status === 'warning'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-400/25'
                : 'bg-white/[0.04] text-[#A8B8D8] border border-white/[0.08]'
            }`}
          >
            {c.label}
          </span>
        ))}
      </div>

      {!locked && content.risks && content.risks.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[12px] font-semibold text-[#E8F0FF]">Risks</p>
          {content.risks.map(risk => (
            <div key={risk.title} className="rounded-lg bg-white/[0.03] px-3 py-2">
              <p className="text-[12.5px] font-medium text-[#E8F0FF]">{risk.title}</p>
              <p className="mt-0.5 text-[12px] text-[#A8B8D8] leading-relaxed">{risk.detail}</p>
            </div>
          ))}
        </div>
      )}

      {!locked && content.missingInfo && content.missingInfo.length > 0 && (
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#E8F0FF] mb-1.5">Missing information</p>
          <ul className="space-y-1">
            {content.missingInfo.map(item => (
              <li key={item} className="text-[12.5px] text-[#A8B8D8] flex gap-2">
                <span className="text-[#5A6A8A]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!locked && content.documents && content.documents.length > 0 && (
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#E8F0FF] mb-1.5">Documents you'll likely need</p>
          <ul className="space-y-1">
            {content.documents.map(doc => (
              <li key={doc.title} className="text-[12.5px] text-[#A8B8D8] flex gap-2">
                <span className="text-[#5A6A8A]">•</span>
                <span>
                  {doc.title}
                  {doc.detail && <span className="text-[#5A6A8A]"> — {doc.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!locked && content.complexityLevel && (
        <p className="mt-4 text-[12.5px] text-[#A8B8D8]">
          <span className="font-semibold text-[#E8F0FF]">Complexity: </span>
          {content.complexityLevel} — recommended package: {content.recommendedPackage}
        </p>
      )}

      {locked && (content.risks?.length || content.documents?.length) ? (
        <p className="mt-4 text-[12.5px] text-[#A8B8D8]">
          <span className="font-semibold text-[#E8F0FF]">
            {content.risks?.length ?? 0} risk{content.risks?.length === 1 ? '' : 's'} found
          </span>
          {content.documents?.length ? ` and a ${content.documents.length}-item document checklist are` : ' is'} ready
          — unlock below to see the full breakdown.
        </p>
      ) : null}

      {!locked && !compact && (
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#E8F0FF] mb-1.5">What to check next</p>
          <ul className="space-y-1">
            {content.whatToCheckNext.map(step => (
              <li key={step} className="text-[12.5px] text-[#A8B8D8] flex gap-2">
                <span className="text-[#5A6A8A]">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && <p className="mt-4 text-[11.5px] italic text-[#5A6A8A]">{content.confidenceCaveat}</p>}

      {locked ? <ReportPaywall reportId={reportId} tier={tier} /> : <ReportDownloadGate reportId={reportId} />}

      {!hideUpgrade && nextTierDef && (
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
          <p className="text-[12px] text-[#A8B8D8] leading-relaxed">{tierDef.upsellQuestion}</p>
          <a
            href={`/check/unsure?resumeReport=${reportId}&tier=${nextId}`}
            className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff] transition-colors"
          >
            Continue to {nextTierDef.name}
            {nextTierDef.priceGBP !== null && <span className="text-[#A8B8D8] font-normal">· {nextTierDef.priceLabel}</span>}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}