'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  /** Show a toast. Defaults to 'info'. Auto-dismisses after ~4.5s. */
  show: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, { border: string; dot: string }> = {
  success: { border: 'border-[rgba(19,91,236,0.3)]', dot: 'bg-[#135BEC]' },
  error:   { border: 'border-[rgba(248,113,113,0.35)]', dot: 'bg-[#F87171]' },
  info:    { border: 'border-white/[0.12]', dot: 'bg-[#00D4FF]' },
}

/**
 * ToastProvider
 * ──────────────
 * Mounted once at the app root. Exists specifically so failures that
 * used to be silent (best-effort network calls, storage quota errors)
 * become visible to the user instead of disappearing.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev, { id, message, variant }])
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[340px]"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'flex items-start gap-2.5 rounded-[10px] border bg-[#141C30] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.4)]',
              VARIANT_STYLES[t.variant].border
            )}
          >
            <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0', VARIANT_STYLES[t.variant].dot)} />
            <p className="text-[12.5px] text-[#E8F0FF] leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Returns a no-op show() if no provider is mounted, so this is always safe to call. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  return ctx ?? { show: () => {} }
}
