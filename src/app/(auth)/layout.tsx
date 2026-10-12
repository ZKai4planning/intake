import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | AI4Planning',
    default:  'Account | AI4Planning',
  },
  robots: { index: false, follow: false },
}

/**
 * (auth) route group layout
 * ──────────────────────────
 * Wraps all auth pages. No chrome — AuthShell handles its own layout.
 * Route group name "(auth)" is invisible in the URL.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
