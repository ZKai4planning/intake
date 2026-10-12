// import Link from 'next/link'
// import { NewsletterForm } from '@/components/layout/NewsletterForm'

// /**
//  * Footer
//  * ───────
//  * Server Component — no 'use client' needed.
//  * NewsletterForm is a separate 'use client' island.
//  *
//  * Place in app/layout.tsx:
//  *   <Footer />
//  *   <CookieConsentBanner />
//  */

// const NAV = [
//   {
//     heading: 'Product',
//     links: [
//       { label: 'Planning Check',   href: '/planning-check' },
//       { label: 'Site Analysis',    href: '/site-analysis' },
//       { label: 'Policy Search',    href: '/policy-search' },
//       { label: 'Appeal Tracker',   href: '/appeals' },
//     ],
//   },
//   {
//     heading: 'Company',
//     links: [
//       { label: 'About',            href: '/about' },
//       { label: 'Blog',             href: '/blog' },
//       { label: 'Careers',          href: '/careers' },
//       { label: 'Press',            href: '/press' },
//       { label: 'Our Research',     href: '/research' },
//     ],
//   },
//   {
//     heading: 'Support',
//     links: [
//       { label: 'Dashboard',        href: '/dashboard' },
//       { label: 'FAQ',              href: '/faq' },
//       { label: 'Contact Us',       href: '/contact' },
//       { label: 'Accessibility',    href: '/accessibility' },
//     ],
//   },
//   {
//     heading: 'Legal',
//     links: [
//       { label: 'Privacy Policy',   href: '/privacy' },
//       { label: 'Terms of Service', href: '/terms' },
//       { label: 'Cookie Policy',    href: '/cookies' },
//       { label: 'Data Processing',  href: '/dpa' },
//     ],
//   },
// ]

// const SOCIALS = [
//   {
//     label: 'X / Twitter',
//     href:  'https://twitter.com/ai4planning',
//     icon: (
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//         <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
//       </svg>
//     ),
//   },
//   {
//     label: 'LinkedIn',
//     href:  'https://linkedin.com/company/ai4planning',
//     icon: (
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//         <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
//         <circle cx="4" cy="4" r="2"/>
//       </svg>
//     ),
//   },
//   {
//     label: 'YouTube',
//     href:  'https://youtube.com/@ai4planning',
//     icon: (
//       <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//         <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
//       </svg>
//     ),
//   },
// ]

// export function Footer() {
//   const year = new Date().getFullYear()

//   return (
//     <footer className="bg-[#070B14] border-t border-white/[0.06] mt-auto">

//       {/* ── Main grid ──────────────────────────────────────────── */}
//       <div className="max-w-[1200px] mx-auto px-5 sm:px-8 xl:px-10 py-16 sm:py-20">
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-14 lg:gap-10">

//           {/* Left — Newsletter */}
//           <div className="max-w-[340px]">
//             <Link href="/" className="inline-block mb-8" aria-label="AI4Planning home">
//               <span className="font-display text-[20px] font-normal tracking-tight text-[#E8F0FF]">
//                 AI<span className="text-[#00D4FF]">4</span>Planning
//               </span>
//             </Link>

//             <p className="text-[15px] font-medium text-[#E8F0FF] mb-1.5">
//               Stay ahead of planning policy
//             </p>
//             <p className="text-[13px] text-[#5A6A8A] mb-5 leading-relaxed">
//               Get weekly AI-curated planning intelligence, policy updates, and appeal decisions — straight to your inbox.
//             </p>

//             <NewsletterForm />

//             <p className="mt-3 text-[11px] text-[#3A4A60] leading-relaxed">
//               By subscribing you agree to receive planning intelligence emails from AI4Planning. Unsubscribe any time.
//             </p>
//           </div>

//           {/* Right — Nav columns */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
//             {NAV.map(col => (
//               <div key={col.heading}>
//                 <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#E8F0FF] mb-4">
//                   {col.heading}
//                 </p>
//                 <ul className="space-y-2.5">
//                   {col.links.map(link => (
//                     <li key={link.label}>
//                       <Link
//                         href={link.href}
//                         className="text-[13px] text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors duration-150"
//                       >
//                         {link.label}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Divider + bottom bar ───────────────────────────────── */}
//       <div className="border-t border-white/[0.06]">
//         <div className="max-w-[1200px] mx-auto px-5 sm:px-8 xl:px-10 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <p className="text-[12px] text-[#3A4A60]">
//             © {year} AI4Planning Ltd. All rights reserved.
//           </p>

//           {/* Social icons */}
//           <div className="flex items-center gap-4">
//             {SOCIALS.map(s => (
//               <a
//                 key={s.label}
//                 href={s.href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label={s.label}
//                 className="text-[#3A4A60] hover:text-[#A8B8D8] transition-colors duration-150"
//               >
//                 {s.icon}
//               </a>
//             ))}
//           </div>
//         </div>

//         {/* Legal small print */}
//         <div className="max-w-[1200px] mx-auto px-5 sm:px-8 xl:px-10 pb-8 space-y-2">
//           <p className="text-[11px] text-[#2A3A50] leading-relaxed">
//             * AI4Planning provides planning intelligence tools for informational purposes only. Nothing on this platform constitutes formal planning advice. Always consult a qualified planning consultant or local planning authority before submitting applications.
//           </p>
//           <p className="text-[11px] text-[#2A3A50] leading-relaxed">
//             ** Planning decisions, policies, and designations are subject to change. AI4Planning uses publicly available data sources and accepts no liability for decisions made on the basis of information provided herein.
//           </p>
//         </div>
//       </div>
//     </footer>
//   )
// }

import Link from 'next/link'
import { NewsletterForm } from '@/components/layout/NewsletterForm'

/**
 * Footer
 * ───────
 * Server Component — no 'use client' needed.
 * NewsletterForm is a separate 'use client' island.
 *
 * Place in app/layout.tsx:
 *   <Footer />
 *   <CookieConsentBanner />
 */

const NAV = [
  {
    heading: 'Product',
    links: [
      { label: 'Planning Check',   href: '/planning-check' },
      { label: 'Site Analysis',    href: '/site-analysis' },
      { label: 'Policy Search',    href: '/policy-search' },
      { label: 'Appeal Tracker',   href: '/appeals' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',            href: '/about' },
      { label: 'Blog',             href: '/blog' },
      { label: 'Careers',          href: '/careers' },
      { label: 'Press',            href: '/press' },
      { label: 'Our Research',     href: '/research' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Dashboard',        href: '/dashboard' },
      { label: 'FAQ',              href: '/faq' },
      { label: 'Contact Us',       href: '/contact' },
      { label: 'Accessibility',    href: '/accessibility' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',   href: '/legal/privacy-policy' },
      { label: 'Terms of Service', href: '/legal/terms-and-conditions' },
      { label: 'Cookie Policy',    href: '/legal/cookie-policy' },
      { label: 'GDPR',  href: '/legal/gdpr-compliance' },
      { label: 'Disclaimer',  href: '/legal/disclaimer' },
    ],
  },
]

const SOCIALS = [
  {
    label: 'X / Twitter',
    href:  'https://twitter.com/ai4planning',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href:  'https://linkedin.com/company/ai4planning',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href:  'https://youtube.com/@ai4planning',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#070B14] border-t border-white/[0.06] mt-auto">

      {/* ── Main grid ──────────────────────────────────────────── */}
      <div className="w-full px-5 sm:px-8 xl:px-16 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-14 lg:gap-10">

          {/* Left — Newsletter */}
          <div className="max-w-[340px]">
            <Link href="/" className="inline-block mb-8" aria-label="AI4Planning home">
              <span className="font-display text-[20px] font-normal tracking-tight text-[#E8F0FF]">
                AI<span className="text-[#00D4FF]">4</span>Planning
              </span>
            </Link>

            <p className="text-[15px] font-medium text-[#E8F0FF] mb-1.5">
              Stay ahead of planning policy
            </p>
            <p className="text-[13px] text-[#5A6A8A] mb-5 leading-relaxed">
              Get weekly AI-curated planning intelligence, policy updates, and appeal decisions — straight to your inbox.
            </p>

            <NewsletterForm />

            <p className="mt-3 text-[11px] text-[#3A4A60] leading-relaxed">
              By subscribing you agree to receive planning intelligence emails from AI4Planning. Unsubscribe any time.
            </p>
          </div>

          {/* Right — Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
            {NAV.map(col => (
              <div key={col.heading}>
                <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#E8F0FF] mb-4">
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider + bottom bar ───────────────────────────────── */}
      <div className="border-t border-white/[0.06]">
        <div className="w-full px-5 sm:px-8 xl:px-16 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] text-[#3A4A60]">
            © {year} AI4Planning Ltd. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-[#3A4A60] hover:text-[#A8B8D8] transition-colors duration-150"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Legal small print */}
        <div className="w-full px-5 sm:px-8 xl:px-16 pb-8 space-y-2">
          <p className="text-[11px] text-[#2A3A50] leading-relaxed">
            * AI4Planning provides planning intelligence tools for informational purposes only. Nothing on this platform constitutes formal planning advice. Always consult a qualified planning consultant or local planning authority before submitting applications.
          </p>
          <p className="text-[11px] text-[#2A3A50] leading-relaxed">
            ** Planning decisions, policies, and designations are subject to change. AI4Planning uses publicly available data sources and accepts no liability for decisions made on the basis of information provided herein.
          </p>
        </div>
      </div>
    </footer>
  )
}