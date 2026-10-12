import { getTierDef } from './reportTiers'
import type { ReportTierId } from '@/types/reportTiers'

/**
 * cart.ts
 * ─────────
 * A generated RPT-002/003 report is real content, but it's a paid
 * tier — so the chat shows a teaser, not the full thing, until it's in
 * the cart and paid for. This is deliberately tiny: one cart item per
 * report, no quantities. The dashboard checkout page still owns the
 * actual (mock) payment form and add-ons — this just gets the person
 * there with the right item and price already known.
 *
 * API swap point: once there's a backend cart, swap the read/write
 * helpers below for real /api/cart calls; keep the same CartItem shape
 * so nothing calling addToCart/getCart needs to change.
 */

const STORAGE_KEY = 'report_cart'

export interface CartItem {
  reportId: string
  tier: ReportTierId
  label: string
  priceGBP: number
  addedAt: string
}

function readAll(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function writeAll(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('cart:changed'))
  } catch {
    // best-effort — cart just won't survive a refresh
  }
}

export function getCart(): CartItem[] {
  return readAll()
}

export function isInCart(reportId: string): boolean {
  return readAll().some(item => item.reportId === reportId)
}

export function addToCart(reportId: string, tier: ReportTierId): CartItem {
  const tierDef = getTierDef(tier)
  const item: CartItem = {
    reportId,
    tier,
    label: tierDef.name,
    priceGBP: tierDef.priceGBP ?? 0,
    addedAt: new Date().toISOString(),
  }
  const existing = readAll().filter(i => i.reportId !== reportId)
  writeAll([...existing, item])
  return item
}

export function removeFromCart(reportId: string) {
  writeAll(readAll().filter(i => i.reportId !== reportId))
}

export function cartTotal(): number {
  return readAll().reduce((sum, item) => sum + item.priceGBP, 0)
}
