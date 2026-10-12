'use client'

import { useEffect, useState } from 'react'
import { Lock, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { getTierDef } from '@/lib/reportTiers'
import { addToCart, isInCart } from '@/lib/cart'
import { isLoggedIn } from '@/lib/reportStorage'
import type { ReportTierId } from '@/types/reportTiers'

interface ReportPaywallProps {
  reportId: string
  tier: ReportTierId
}

/**
 * ReportPaywall
 * ────────────────
 * Shown instead of ReportDownloadGate for paid tiers (RPT-002/003).
 * The report is genuinely generated already — this just keeps the
 * deeper sections (risks, documents, package recommendation) locked
 * in ReportCard until it's added to cart and paid for, same "pay
 * before it's released" principle as the dashboard checkout.
 */
export function ReportPaywall({ reportId, tier }: ReportPaywallProps) {
  const tierDef = getTierDef(tier)
  const [inCart, setInCart] = useState(false)

  useEffect(() => {
    setInCart(isInCart(reportId))
  }, [reportId])

  const checkoutHref = (() => {
    const dest = `/dashboard/new/intent?report=${reportId}&checkout=1`
    if (isLoggedIn()) return dest
    return `/signup?report=${reportId}&returnTo=${encodeURIComponent(dest)}`
  })()

  if (!inCart) {
    return (
      <div className="mt-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-3.5 py-3.5">
        <div className="flex items-start gap-2.5 mb-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[#00D4FF]">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
            The risks, document checklist and recommendation are ready — this is a paid report
            (<span className="text-[#E8F0FF] font-semibold">{tierDef.priceLabel}</span>). Add it to your
            cart to unlock the full version.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            addToCart(reportId, tier)
            setInCart(true)
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#135BEC] px-4 py-2.5 sm:py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Add to cart — {tierDef.priceLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.06] px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        <p className="text-[12.5px] text-[#A8B8D8]">
          In your cart — <span className="text-[#E8F0FF] font-semibold">{tierDef.priceLabel}</span>. Checkout to unlock
          the full report.
        </p>
      </div>
      <a
        href={checkoutHref}
        className="shrink-0 w-full sm:w-auto text-center rounded-full bg-[#135BEC] px-4 py-2.5 sm:py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
      >
        Checkout
      </a>
    </div>
  )
}