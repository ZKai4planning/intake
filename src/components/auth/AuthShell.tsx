import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { cn }   from '@/lib/cn'

interface AuthShellProps {
  children:    React.ReactNode
  /** Small label above the title, e.g. "Step 1 of 2" */
  eyebrow?:    string
  title:       string
  subtitle?:   string | React.ReactNode
  /** Footer link, e.g. "Already have an account? Log in" */
  footerText?: string
  footerLink?: { label: string; href: string }
  maxWidth?:   'sm' | 'md'
}

/**
 * AuthShell
 * ──────────
 * Shared page wrapper for every auth screen.
 * - Centred card on desktop, full-screen on mobile
 * - Ambient background matching the hero section
 * - Logo top-left links home
 */
export function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
  footerText,
  footerLink,
  maxWidth = 'sm',
}: AuthShellProps) {
  const maxW = maxWidth === 'sm' ? 'max-w-[420px]' : 'max-w-[520px]'

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0E1A] overflow-hidden">

      {/* ── Ambient glows ──────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(19,91,236,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)',
          }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40" />
      </div>

      {/* ── Top bar ────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 h-[60px]">
        <Logo />
        {footerLink && (
          <Link
            href={footerLink.href}
            className="text-sm text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors"
          >
            {footerLink.label}
          </Link>
        )}
      </header>

      {/* ── Card ───────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className={cn('w-full', maxW)}>

          {/* Card surface */}
          <div
            className={cn(
              'rounded-[20px] px-6 py-8 sm:px-8 sm:py-10',
              'bg-[#0F1525] border border-white/[0.08]',
              'shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]'
            )}
          >
            {/* Eyebrow */}
            {eyebrow && (
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5A6A8A] mb-3">
                {eyebrow}
              </p>
            )}

            {/* Title */}
            <h1 className="font-display text-[26px] sm:text-[30px] font-normal tracking-tight text-[#E8F0FF] mb-2 leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-[14px] text-[#5A6A8A] mb-7 leading-relaxed">
                {subtitle}
              </p>
            )}

            {children}
          </div>

          {/* Footer line */}
          {footerText && footerLink && (
            <p className="mt-5 text-center text-[13px] text-[#5A6A8A]">
              {footerText}{' '}
              <Link
                href={footerLink.href}
                className="text-[#135BEC] hover:text-[#2A6BF0] font-medium transition-colors"
              >
                {footerLink.label}
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
