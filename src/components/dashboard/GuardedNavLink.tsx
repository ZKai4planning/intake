'use client'

import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'

interface GuardedNavLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

/**
 * GuardedNavLink
 * ────────────────
 * Drop-in for <Link> used specifically in the dashboard chrome (sidebar,
 * mobile tab bar). A plain <Link> would abandon in-progress intake-form
 * answers silently; this checks the unsaved-changes guard first and
 * confirms with the user before navigating away.
 *
 * Renders a real <a href> (not just a <button>) so it stays a proper
 * link for middle-click/open-in-new-tab/SEO purposes; the click handler
 * only intervenes for the guarded, same-tab case.
 */
export function GuardedNavLink({ href, className, children }: GuardedNavLinkProps) {
  const { guardedNavigate } = useUnsavedChangesGuard()

  return (
    <a
      href={href}
      className={className}
      onClick={e => {
        // Let modified clicks (new tab, new window, middle-click) behave natively.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        guardedNavigate(href)
      }}
    >
      {children}
    </a>
  )
}
