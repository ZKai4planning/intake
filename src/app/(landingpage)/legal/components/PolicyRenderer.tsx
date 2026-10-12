'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import type {
  PolicySection,
  PolicySubsection,
  PolicyParagraph,
  PolicyTable,
  PolicyList,
  PolicyNotice,
  PolicyContact,
  PolicyBlock,
} from '../_data/policies'

// ── Notice ────────────────────────────────────────────────────────
const noticeStyles = {
  warning: {
    wrap: 'bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.2)]',
    title: 'text-[#FCA5A5]',
    body: 'text-[#FCA5A5]/80',
  },
  info: {
    wrap: 'bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)]',
    title: 'text-[#67E8F9]',
    body: 'text-[#67E8F9]/80',
  },
  success: {
    wrap: 'bg-[rgba(19,91,236,0.08)] border border-[rgba(19,91,236,0.2)]',
    title: 'text-[#6EE7B7]',
    body: 'text-[#6EE7B7]/80',
  },
}

function Notice({ block }: { block: PolicyNotice }) {
  const s = noticeStyles[block.variant]
  return (
    <div className={cn('rounded-[10px] px-4 py-3.5 my-4 text-[13px]', s.wrap)}>
      <p className={cn('font-semibold mb-1', s.title)}>{block.title}</p>
      <p className={s.body}>{block.body}</p>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────
function Table({ block }: { block: PolicyTable }) {
  return (
    <div className="overflow-x-auto my-4 rounded-[10px] border border-white/[0.08]">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {block.headers.map((h) => (
              <th
                key={h}
                className="bg-[#141C30] px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#5A6A8A] whitespace-nowrap border-b border-white/[0.08]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'px-3.5 py-2.5 align-top',
                    ci === 0 ? 'text-[#E8F0FF] font-medium' : 'text-[#A8B8D8]'
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── List ──────────────────────────────────────────────────────────
function List({ block }: { block: PolicyList }) {
  return (
    <ul className="my-3 space-y-2">
      {block.items.map((item, i) => {
        const isObj = typeof item === 'object'
        return (
          <li key={i} className="flex gap-3 text-[13.5px] text-[#A8B8D8]">
            <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#135BEC] opacity-60" />
            <span>
              {isObj ? (
                <>
                  <strong className="text-[#E8F0FF]">{item.label}</strong>{' '}
                  {item.text}
                </>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: item }} />
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// ── Paragraph ─────────────────────────────────────────────────────
function Paragraph({ block }: { block: PolicyParagraph }) {
  return (
    <p
      className="text-[13.5px] text-[#A8B8D8] leading-relaxed mb-3 last:mb-0 [&_a]:text-[#135BEC] [&_a:hover]:text-[#2A6BF0] [&_strong]:text-[#E8F0FF] [&_strong]:font-semibold"
      dangerouslySetInnerHTML={{ __html: block.text }}
    />
  )
}

// ── Contact ───────────────────────────────────────────────────────
function Contact({ block }: { block: PolicyContact }) {
  return (
    <div className="mt-3 rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
      {block.rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.06] last:border-0 text-[13px]"
        >
          <span className="min-w-[70px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#5A6A8A]">
            {row.label}
          </span>
          {row.href ? (
            <a href={row.href} className="text-[#135BEC] hover:text-[#2A6BF0] transition-colors">
              {row.value}
            </a>
          ) : (
            <span className="text-[#A8B8D8]">{row.value}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Block dispatcher ──────────────────────────────────────────────
// type AnyBlock =
//   | PolicyParagraph
//   | PolicyList
//   | PolicyTable
//   | PolicyNotice
//   | PolicyContact
//   | PolicySubsection

// function Block({ block }: { block: AnyBlock }) {
//   if (block.type === 'paragraph')  return <Paragraph block={block} />
//   if (block.type === 'list')       return <List block={block} />
//   if (block.type === 'table')      return <Table block={block} />
//   if (block.type === 'notice')     return <Notice block={block} />
//   if (block.type === 'contact')    return <Contact block={block} />
//   if (block.type === 'subsection') return <Subsection block={block} />
//   return null
// }

function Block({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <Paragraph block={block} />

    case 'list':
      return <List block={block} />

    case 'table':
      return <Table block={block} />

    case 'notice':
      return <Notice block={block} />

    case 'contact':
      return <Contact block={block} />

    case 'subsection':
      return <Subsection block={block} />

    default:
      return null
  }
}

// ── Subsection ────────────────────────────────────────────────────
function Subsection({ block }: { block: PolicySubsection }) {
  return (
    <div id={block.id} className="mt-5 scroll-mt-20">
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-3">{block.title}</h3>
      {block.content.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────
export function PolicySection({ section }: { section: PolicySection }) {
  return (
    <section id={section.id} className="mt-10 scroll-mt-20">
      <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#135BEC] mb-1.5">
        Section {section.num}
      </p>
      <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#E8F0FF] mb-4 pb-3 border-b border-white/[0.08]">
        {section.title}
      </h2>
      {section.content.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </section>
  )
}