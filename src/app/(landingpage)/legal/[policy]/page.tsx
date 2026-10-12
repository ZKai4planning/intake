import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { POLICIES, POLICY_SLUGS } from '../_data/policies'
import { PolicySection } from '../components/PolicyRenderer'
import { TableOfContents } from '../components/TableOfContents'


interface Props {
  params: { policy: string }
}

// ── Static params for build-time generation ───────────────────────
export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ policy: slug }))
}

// ── Metadata ──────────────────────────────────────────────────────
export function generateMetadata({ params }: Props): Metadata {
  const doc = POLICIES[params.policy]
  if (!doc) return {}
  return {
    title: `${doc.title} — AI4Planning`,
    description: `AI4Planning ${doc.title}. Read our full ${doc.title} for the AI-powered planning platform.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────
export default function PolicyPage({ params }: Props) {
  const doc = POLICIES[params.policy]
  if (!doc) notFound()

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">

      {/* ── Page header ── */}
      <div className="mb-10">
        <span className="inline-block text-[11px] font-semibold tracking-[0.08em] uppercase text-[#135BEC] bg-[rgba(19,91,236,0.1)] border border-[rgba(19,91,236,0.2)] rounded-[6px] px-2.5 py-1 mb-4">
          {doc.eyebrow}
        </span>
        <h1 className="text-[clamp(26px,5vw,36px)] font-light tracking-[-0.02em] text-[#E8F0FF] leading-tight mb-3">
          {doc.title}
        </h1>
        <p className="text-[12px] text-[#5A6A8A] pb-8 border-b border-white/[0.08]">
          {doc.meta}
        </p>
      </div>

      {/* ── Two-column layout: TOC sidebar + content ── */}
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 xl:gap-16">

        {/* Sidebar TOC — hidden on mobile (inline TOC shown instead) */}
        <aside className="hidden lg:block">
          <TableOfContents sections={doc.sections} />
        </aside>

        {/* Mobile inline TOC */}
        <div className="lg:hidden mb-8 rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#5A6A8A] mb-3">
            Contents
          </p>
          <ul className="space-y-1">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2.5 py-1 text-[12.5px] text-[#5A6A8A] hover:text-[#135BEC] transition-colors"
                >
                  <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[#5A6A8A]" />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Main content */}
        <article>
          {doc.sections.map((section) => (
            <PolicySection key={section.id} section={section} />
          ))}
        </article>

      </div>
    </div>
  )
}