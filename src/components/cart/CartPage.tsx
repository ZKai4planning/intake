'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Trash2, FileText, Wrench, ArrowRight, ArrowLeft } from 'lucide-react'
import { getCart, removeFromCart, cartTotal, type CartItem } from '@/lib/cart'
import { isLoggedIn } from '@/lib/reportStorage'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

/**
 * CartPage
 * ──────────
 * Separate cart page. Shows everything in the cart (reports from the
 * chat and services added from the homepage), lets the person remove
 * items, and hands off to the existing checkout:
 *   - a report in the cart → the same report checkout route
 *     ReportPaywall's "Checkout" button uses (unchanged flow);
 *   - services only → into the app's project start (login if needed).
 */
export function CartPage() {
  const goToApp = useAuthRedirect()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function refresh() {
      setItems(getCart())
      setTotal(cartTotal())
      setReady(true)
    }
    refresh()
    window.addEventListener('cart:changed', refresh)
    return () => window.removeEventListener('cart:changed', refresh)
  }, [])

  const reports = items.filter(i => i.kind !== 'service')
  const services = items.filter(i => i.kind === 'service')

  function checkout() {
    if (reports.length > 0) {
      const id = reports[0].reportId
      const dest = `/dashboard/new/intent?report=${id}&checkout=1`
      window.location.href = isLoggedIn()
        ? dest
        : `/signup?report=${id}&returnTo=${encodeURIComponent(dest)}`
      return
    }
    goToApp('homeowner', '/dashboard/new/intent')
  }

  return (
    <main className="min-h-screen pt-32 pb-20 px-5 sm:px-8">
      <div className="max-w-[860px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[14.5px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Continue browsing
        </Link>

        <h1 className="font-display text-[33.5px] sm:text-[40.5px] font-normal text-[#E8F0FF] tracking-tight mb-1">
          Your cart
        </h1>
        <p className="text-[15.5px] text-[#A8B8D8] mb-8">
          {ready && items.length > 0
            ? `${items.length} ${items.length === 1 ? 'item' : 'items'} — review, remove anything you don’t need, then check out.`
            : 'Everything you add from the homepage or a report appears here.'}
        </p>

        {ready && items.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0F1525] px-6 py-14 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00D4FF]/10 text-[#00D4FF]">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <p className="text-[18px] font-semibold text-[#E8F0FF] mb-1">Your cart is empty</p>
            <p className="text-[15px] text-[#A8B8D8] mb-6">Add a service or generate a report to get started.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/#services" className="rounded-full bg-[#135BEC] px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors">
                Browse services
              </Link>
              <Link href="/check/unsure?actor=homeowner" className="rounded-full border border-white/[0.15] px-5 py-2.5 text-[14.5px] font-semibold text-[#E8F0FF] hover:border-white/[0.3] transition-colors">
                Start a planning check
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_280px] items-start">
            <ul className="space-y-3">
              {items.map(item => {
                const isService = item.kind === 'service'
                const Icon = isService ? Wrench : FileText
                return (
                  <li
                    key={item.reportId}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#0F1525] px-4 py-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00D4FF]/10 text-[#00D4FF]">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-semibold text-[#E8F0FF] truncate">{item.label}</p>
                      <p className="text-[13.5px] text-[#5A6A8A]">{isService ? 'Service' : 'Planning report'}</p>
                    </div>
                    <p className="text-[17px] font-semibold text-[#E8F0FF] shrink-0">£{item.priceGBP}</p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.reportId)}
                      aria-label={`Remove ${item.label} from cart`}
                      className="shrink-0 rounded-md p-2 text-[#5A6A8A] hover:text-red-300 hover:bg-white/[0.05] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <aside className="rounded-xl border border-white/[0.08] bg-[#0F1525] p-5 md:sticky md:top-32">
              <p className="text-[14.5px] font-semibold uppercase tracking-[0.06em] text-[#A8B8D8] mb-4">Summary</p>
              <div className="flex items-center justify-between text-[15.5px] text-[#A8B8D8] mb-2">
                <span>Items</span><span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-[19px] font-semibold text-[#E8F0FF] pt-3 border-t border-white/[0.08]">
                <span>Total</span><span>£{total}</span>
              </div>
              <button
                type="button"
                onClick={checkout}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#135BEC] px-4 py-3 text-[15.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
              {reports.length > 0 && services.length > 0 && (
                <p className="mt-3 text-[13px] leading-relaxed text-[#5A6A8A]">
                  Your report is paid for first. Services stay in your cart for the next step.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
