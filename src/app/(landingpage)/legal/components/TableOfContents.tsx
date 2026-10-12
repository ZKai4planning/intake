'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { PolicySection } from '../_data/policies'

interface Props {
  sections: PolicySection[]
}

export function TableOfContents({ sections }: Props) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label="Table of Contents"
      className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 sticky top-24"
    >
      <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#5A6A8A] mb-3">
        Contents
      </p>
      <ul className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                'flex items-center gap-2.5 py-1.5 px-2 rounded-[6px] text-[12.5px] transition-all duration-150',
                active === s.id
                  ? 'text-[#135BEC] bg-[rgba(19,91,236,0.08)]'
                  : 'text-[#5A6A8A] hover:text-[#A8B8D8] hover:bg-white/[0.03]'
              )}
            >
              <span
                className={cn(
                  'h-[4px] w-[4px] shrink-0 rounded-full transition-colors',
                  active === s.id ? 'bg-[#135BEC]' : 'bg-[#5A6A8A]'
                )}
              />
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}