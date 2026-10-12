import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/cn'

interface DashboardLoadingProps {
  /** Shown faintly under the skeleton content, e.g. "Loading your workspace…" */
  label?: string
  /** How many skeleton widget cards to show in the content grid */
  cards?: number
}

/**
 * DashboardLoading
 * ──────────────────
 * Full-shell skeleton shown while useWorkspace() resolves the session.
 * Replaces the old "plain box in the middle of the screen" loading
 * state (a centered spinner with no chrome) that every dashboard route
 * used to render individually.
 *
 * Because this mirrors the real <DashboardShell> layout — sidebar,
 * header bar, content grid — the page doesn't visually "pop" once data
 * arrives; the skeleton just resolves into real content in place.
 *
 * Usage — drop in wherever `isLoading` was returning the old box:
 *   if (isLoading) return <DashboardLoading />
 */
export function DashboardLoading({ label, cards = 4 }: DashboardLoadingProps) {
  return (
    <div className="relative min-h-screen bg-[#0A0E1A] flex overflow-hidden">
      {/* ── Ambient glow (matches AuthShell, keeps the brand feel while empty) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(19,91,236,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      {/* ── Sidebar skeleton ─────────────────────────────────── */}
      <aside className="relative z-10 hidden md:flex md:w-[220px] flex-col border-r border-white/[0.06] bg-[#0F1525] shrink-0">
        <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06]">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[36px] rounded-[10px] bg-white/[0.04] animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </nav>
      </aside>

      {/* ── Main column ──────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Mobile logo bar */}
        <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
          <Logo size="sm" />
        </div>

        {/* Header skeleton */}
        <div className="h-[60px] flex items-center justify-between px-5 sm:px-8 border-b border-white/[0.06] shrink-0">
          <div className="h-[14px] w-[140px] rounded-full bg-white/[0.05] animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.05] animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/[0.05] animate-pulse" />
          </div>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-7 w-full max-w-[1200px] mx-auto">
          {/* Greeting skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div className="space-y-2.5">
              <div className="h-[26px] w-[220px] rounded-[8px] bg-white/[0.06] animate-pulse" />
              <div className="h-[13px] w-[280px] rounded-full bg-white/[0.04] animate-pulse" />
            </div>
            <div className="h-[40px] w-[170px] rounded-[10px] bg-white/[0.05] animate-pulse shrink-0" />
          </div>

          {/* Widget grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: cards }).map((_, i) => (
              <div
                key={i}
                className="h-[150px] rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-[13px] w-[40%] rounded-full bg-white/[0.06] mb-4" />
                <div className="h-[28px] w-[60%] rounded-[6px] bg-white/[0.08] mb-3" />
                <div className="h-[11px] w-[80%] rounded-full bg-white/[0.04]" />
              </div>
            ))}
          </div>

          {label && (
            <p className="mt-8 text-center text-[12px] text-[#5A6A8A]">{label}</p>
          )}
        </main>
      </div>
    </div>
  )
}
