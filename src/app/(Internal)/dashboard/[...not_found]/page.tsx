import { notFound } from 'next/navigation'

/**
 * dashboard/[...not_found]/page.tsx
 * ───────────────────────────────────
 * Catch-all for any /dashboard/* path that doesn't match a real page
 * (typo'd link, stale bookmark, hand-edited URL).
 *
 * Why this file has to exist:
 * Next.js only renders a segment's own not-found.tsx when something
 * INSIDE that already-matched segment explicitly calls notFound() (e.g.
 * a dynamic page like /dashboard/projects/[id] rejecting a bad id). A
 * URL that doesn't match any page at all — e.g. /dashboard/wat — never
 * matches into the dashboard segment in the first place, so Next falls
 * straight through to the site-wide app/not-found.tsx (no sidebar/
 * header, "back to homepage" only), which looks like the user got
 * kicked out of the dashboard entirely.
 *
 * This catch-all matches every otherwise-unmatched /dashboard/* path,
 * bringing it into the dashboard segment, then immediately calls
 * notFound() — which correctly triggers the co-located
 * dashboard/not-found.tsx (DashboardShell chrome, "back to dashboard").
 */
export default function DashboardCatchAll() {
  notFound()
}
