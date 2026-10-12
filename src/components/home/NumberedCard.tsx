
'use client'

import { useState } from 'react'
import { ChevronRight, X, Pencil } from 'lucide-react'

export interface NumberedCardItem {
  key: string
  label: string
  sublabel?: string
  /**
   * Extra detail shown only once the row is expanded (e.g. what's
   * included, what you'll need to provide). When present, tapping the
   * row toggles this open instead of immediately selecting — the user
   * gets an explicit "Choose this" button to actually commit.
   */
  detail?: string
  disabled?: boolean
  onSelect: () => void
}

interface NumberedCardProps {
  title: string
  stepLabel?: string
  items: NumberedCardItem[]
  active: boolean
  /** Selected item's key, once answered — highlights it and locks the card. */
  selectedKey?: string
  /** "Something else" row — free-text fallback when no option fits. */
  onCustom?: (value: string) => void
  /** Bottom-right "Skip" — omit to hide it entirely. */
  onSkip?: () => void
  onClose?: () => void
}

/**
 * NumberedCard
 * ──────────────
 * Shared layout for both the report questions and the tier-selection
 * menu — numbered rows, a step counter, a "Something else" free-text
 * escape hatch, and a Skip action, matching the reference pattern
 * rather than the earlier pill-chip buttons.
 */
export function NumberedCard({
  title,
  stepLabel,
  items,
  active,
  selectedKey,
  onCustom,
  onSkip,
  onClose,
}: NumberedCardProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  function submitCustom() {
    const trimmed = customValue.trim()
    if (!trimmed || !onCustom) return
    onCustom(trimmed)
    setCustomOpen(false)
    setCustomValue('')
  }

  return (
    <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{title}</p>
        <div className="flex items-center gap-2.5 shrink-0">
          {stepLabel && <span className="text-[11.5px] text-[#5A6A8A]">{stepLabel}</span>}
          {onClose && (
            <button
              type="button"
              disabled={!active}
              onClick={onClose}
              aria-label="Dismiss"
              className="text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {items.map((item, i) => {
          const chosen = selectedKey === item.key
          const expanded = expandedKey === item.key
          // Items with `detail` are disclose-then-commit: first tap opens
          // the detail panel, a distinct button inside it actually selects.
          // Items without `detail` keep the old single-tap-to-select behavior.
          const handleRowClick = item.detail
            ? () => setExpandedKey(expanded ? null : item.key)
            : item.onSelect

          return (
            <div key={item.key}>
              <button
                type="button"
                disabled={!active || item.disabled}
                onClick={handleRowClick}
                aria-expanded={item.detail ? expanded : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors disabled:pointer-events-none ${
                  chosen ? 'bg-blue-500/[0.1]' : 'hover:bg-white/[0.03] disabled:opacity-40'
                }`}
              >
                <span
                  className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    chosen ? 'bg-[#135BEC] text-white' : 'bg-white/[0.06] text-[#5A6A8A]'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-medium text-[#E8F0FF]">{item.label}</span>
                  {item.sublabel && (
                    <span className="block mt-0.5 text-[11.5px] text-[#A8B8D8] leading-relaxed">{item.sublabel}</span>
                  )}
                </span>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-[#5A6A8A] transition-transform ${expanded ? 'rotate-90' : ''}`}
                />
              </button>

              {item.detail && expanded && !chosen && (
                <div className="px-4 pb-3.5 pl-[44px]">
                  <p className="text-[12px] text-[#A8B8D8] leading-relaxed">{item.detail}</p>
                  <button
                    type="button"
                    disabled={!active || item.disabled}
                    onClick={item.onSelect}
                    className="mt-2.5 rounded-full bg-[#135BEC] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Choose this report
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {onCustom && (
          <div>
            {customOpen ? (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  submitCustom()
                }}
                className="flex items-center gap-2 px-4 py-2.5"
              >
                <Pencil className="h-3.5 w-3.5 shrink-0 text-[#5A6A8A]" />
                <input
                  autoFocus
                  type="text"
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  placeholder="Type your own answer…"
                  className="flex-1 bg-transparent text-[13px] text-[#E8F0FF] placeholder:text-[#5A6A8A] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!customValue.trim()}
                  className="text-[11.5px] font-semibold text-[#00D4FF] disabled:opacity-40 disabled:pointer-events-none"
                >
                  Use this
                </button>
              </form>
            ) : (
              <button
                type="button"
                disabled={!active}
                onClick={() => setCustomOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Pencil className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[13px]">Something else</span>
              </button>
            )}
          </div>
        )}
      </div>

      {onSkip && (
        <div className="flex justify-end px-4 py-2.5 border-t border-white/[0.06]">
          <button
            type="button"
            disabled={!active}
            onClick={onSkip}
            className="text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  )
}