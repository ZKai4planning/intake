import Link from 'next/link'

/**
 * DashboardFooter
 * ─────────────────
 * Slim footer shared by every dashboard page — copyright on the left,
 * legal/help links on the right. Mirrors the reference screenshot.
 */
export function DashboardFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-white/[0.06] bg-[#0F1525] px-5 sm:px-8 py-4">
      <div className=" mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="text-[11.5px] text-[#5A6A8A]">
          © {year} AI4Planning. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-[11.5px] text-[#5A6A8A]">
          <Link href="/legal/privacy-policy" className="hover:text-[#A8B8D8] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/legal/terms-and-conditions" className="hover:text-[#A8B8D8] transition-colors">
            Terms of Service
          </Link>
          <Link href="/dashboard/support" className="hover:text-[#A8B8D8] transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  )
}