'use client'

import { useState, useEffect, useCallback } from 'react'

const SCROLL_THRESHOLD = 20

/**
 * useNavbar
 * ──────────
 * Tracks:
 *  - scrolled: whether to apply backdrop/border styling
 *  - mobileOpen: whether the mobile drawer is open
 *
 * Self-contained — no dependencies outside React.
 */
export function useNavbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleMobile = useCallback(() => setMobileOpen(v => !v), [])
  const closeMobile  = useCallback(() => setMobileOpen(false), [])

  return { scrolled, mobileOpen, toggleMobile, closeMobile }
}
