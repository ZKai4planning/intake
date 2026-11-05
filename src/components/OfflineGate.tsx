'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * OfflineGate
 * ───────────
 * 1. Registers /sw.js (production only) so a reload or new navigation while
 *    offline shows /offline.html instead of the browser's dinosaur page.
 * 2. If the connection drops while the app is already open, shows the same
 *    branded screen as a full-page overlay and removes it when back online.
 */
export default function OfflineGate() {
  const [offline, setOffline] = useState(false)
  const [checking, setChecking] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    setOffline(!navigator.onLine)
    const down = () => setOffline(true)
    const up = () => { setOffline(false); setMsg('') }
    window.addEventListener('offline', down)
    window.addEventListener('online', up)
    return () => {
      window.removeEventListener('offline', down)
      window.removeEventListener('online', up)
    }
  }, [])

  const retry = useCallback(async () => {
    setChecking(true)
    setMsg('Checking connection…')
    try {
      await fetch('/favicon.ico', { cache: 'no-store' })
      setOffline(false)
      setMsg('')
    } catch {
      setMsg('Still offline — please check your connection.')
    } finally {
      setChecking(false)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="offline-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0E1A] px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px 360px at 50% 38%, rgba(0,212,255,.14), transparent 70%)',
        }}
      />
      <div className="relative max-w-[380px] text-center">
        <div
          className="mx-auto mb-6 grid h-[92px] w-[92px] place-items-center rounded-[24px] border border-[rgba(0,212,255,.35)]"
          style={{
            background: 'linear-gradient(145deg,#0f2740,#0a1626)',
            boxShadow: '0 0 0 6px rgba(0,212,255,.06), 0 18px 44px rgba(0,0,0,.5), 0 0 40px rgba(0,212,255,.18)',
          }}
        >
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="#00D4FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 22 24 9l16 13" />
            <path d="M12 20v18h24V20" />
            <path d="M20 38V28h8v10" />
            <path d="M17 15a10 10 0 0 1 14 0" strokeWidth="1.8" opacity=".7" className="animate-pulse" />
          </svg>
        </div>
        <p className="mb-3.5 text-[14.5px] font-semibold tracking-[0.18em] text-[#7fdcf2]">AI4PLANNING</p>
        <h1 id="offline-title" className="mb-2.5 text-[29px] font-bold text-[#E8F0FF]">You&apos;re offline</h1>
        <p className="mb-6 text-[16px] leading-relaxed text-[#A8B8D8]">
          AI4Planning needs an internet connection to check properties and load planning data. Reconnect and try again.
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={checking}
          className="rounded-full bg-[#00D4FF] px-8 py-3 text-[15.5px] font-bold text-[#021019] transition hover:bg-[#4fe3ff] active:scale-[.97] disabled:opacity-70"
        >
          Retry
        </button>
        <p className="mt-4 min-h-[16px] text-[13.5px] text-[#5A6A8A]" role="status">{msg}</p>
      </div>
    </div>
  )
}
