'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getCart, cartTotal } from '@/lib/cart'
import { cn } from '@/lib/cn'

/**
 * CartButton
 * ───────────
 * Navbar cart indicator, driven by the real report cart (lib/cart.ts —
 * same store ReportPaywall writes to). Replaces the old hardcoded
 * "My Project 2" placeholder. Updates live via the 'cart:changed'
 * event. Always opens the /cart page, where items are reviewed,
 * removed and checked out.
 */
export function CartButton({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    function refresh() {
      const items = getCart()
      setCount(items.length)
      setTotal(cartTotal())
    }
    refresh()
    window.addEventListener('cart:changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('cart:changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const label =
    count === 0
      ? 'Cart (empty)'
      : `Cart — ${count} ${count === 1 ? 'item' : 'items'}, £${total}. View cart`

  return (
    <Link
      href="/cart"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full border px-3.5 h-11 text-[15.5px] font-semibold transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4FF]',
        count > 0
          ? 'border-[#00D4FF]/60 bg-[#00D4FF]/10 text-[#E8F0FF] hover:bg-[#00D4FF]/20'
          : 'border-white/[0.12] text-[#A8B8D8] hover:text-[#E8F0FF] hover:border-white/[0.25]'
      )}
    >
      <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
      {!compact && <span>Cart</span>}
      {count > 0 && (
        <>
          <span className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[#00D4FF] px-1 text-[12.5px] font-bold text-[#021019]">
            {count}
          </span>
          {!compact && <span className="text-[#A8B8D8] font-medium">£{total}</span>}
        </>
      )}
    </Link>
  )
}
