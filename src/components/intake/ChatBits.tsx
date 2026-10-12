'use client'

import React, { useEffect, useState } from 'react'
import { Pencil, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Chat chrome for the intake: assistant/user bubbles + the "thinking…" reveal. */

export function AssistantShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/15 text-[#00D4FF]">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="w-full min-w-0 max-w-[calc(100%-44px)]">{children}</div>
    </div>
  )
}

export function ThinkingBubble() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] px-4 py-3.5" aria-label="Thinking">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5A6A8A] [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5A6A8A] [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5A6A8A]" />
    </div>
  )
}

export function AssistantText({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] px-4 py-3 text-[14.5px] leading-relaxed text-[#E8F0FF] animate-fade-in">
      {children}
    </div>
  )
}

export function UserBubble({
  title,
  lines,
  onChange,
}: {
  title: string
  lines?: string[]
  onChange?: () => void
}) {
  return (
    <div className="flex animate-fade-in items-start justify-end gap-3">
      <div className="flex max-w-[82%] flex-col items-end gap-1">
        <div className="rounded-2xl rounded-tr-sm bg-[#135BEC] px-4 py-3 text-left text-white">
          <p className="text-[14.5px] font-medium leading-snug">{title}</p>
          {lines?.map((l, i) => (
            <p key={i} className="mt-0.5 text-[12.5px] leading-snug text-white/75">
              {l}
            </p>
          ))}
        </div>
        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="inline-flex items-center gap-1 pr-1 text-[11.5px] font-medium text-[#5A6A8A] transition-colors hover:text-[#00D4FF]"
          >
            <Pencil className="h-3 w-3" />
            Change
          </button>
        )}
      </div>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#A8B8D8]">
        <User className="h-4 w-4" />
      </span>
    </div>
  )
}

/**
 * Shows thinking dots for `delayMs`, then the children — the same
 * "assistant is typing" beat as the rest of the chat. `delayMs={0}`
 * renders immediately (used when stepping Back).
 */
export function Reveal({
  delayMs,
  onShown,
  children,
}: {
  delayMs: number
  onShown?: () => void
  children: React.ReactNode
}) {
  const [shown, setShown] = useState(delayMs <= 0)

  useEffect(() => {
    if (delayMs <= 0) {
      onShown?.()
      return
    }
    const t = setTimeout(() => {
      setShown(true)
      onShown?.()
    }, delayMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AssistantShell>{shown ? children : <ThinkingBubble />}</AssistantShell>
}
