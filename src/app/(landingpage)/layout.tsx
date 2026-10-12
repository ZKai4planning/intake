import type { Metadata, Viewport } from 'next'

import { CookieConsentBanner } from '@/components/cookie/CookieConsentBanner'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout'

export const metadata: Metadata = {
  title: {
    default: 'AI4Planning — Smart Planning Permission Advisor',
    template: '%s | AI4Planning',
  },
  description:
    'AI-powered UK planning permission advice. Tell us your goal, we check your location, analyse constraints, and give you a free result in under 2 minutes.',
  keywords: [
    'planning permission',
    'householder application',
    'permitted development',
    'LDC',
    'HMO licence',
    'UK planning advice',
    'AI planning',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    title: 'AI4Planning — Smart Planning Permission Advisor',
    description:
      'Free AI-powered planning advice. Know your route in under 2 minutes.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI4Planning',
    description: 'Free AI-powered planning advice. Know your route in 2 minutes.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
}

/**
 * (landingpage) route group layout
 * ──────────────────────────────────
 * Wraps every public page — the homepage, /check/[goalId] (the chat
 * flow), /contact, /legal/* — in the SAME persistent chrome: sticky
 * Navbar up top, Footer + cookie banner at the bottom. Because this
 * layout is shared across the whole group, navigating from the
 * homepage into /check/[goalId] (a client-side transition) does NOT
 * remount the Navbar — it just stays mounted and visible, exactly
 * like every other page in this group.
 *
 * IMPORTANT: this must NOT render its own <html>/<body> — the real
 * root layout (src/app/layout.tsx) already owns those. Nesting a
 * second <html>/<body> here previously produced an invalid, doubled
 * document that could make client components (like Navbar) fail to
 * hydrate correctly on some routes.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CookieConsentBanner />
    </>
  )
}
