import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | AI4Planning',
    default:  'Account | AI4Planning',
  },
  robots: { index: false, follow: false },
}

/**
 * /dashboard route group layout
 * ───────────────────────────────
 * Intentionally a no-op wrapper. Every page under /dashboard resolves
 * its own session/workspace state (useWorkspace()) and renders its
 * own <DashboardShell> — the shell can't live here because it needs
 * the resolved workspace + firstName, which aren't known until each
 * page's data has loaded. /dashboard/new/* is the one exception: it
 * has its own nested layout.tsx that resolves the workspace once and
 * renders <DashboardShell> for both steps of that flow.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
