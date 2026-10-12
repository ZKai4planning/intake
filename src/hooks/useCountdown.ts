'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useCountdown
 * ─────────────
 * Counts down from `initialSeconds` to 0.
 * Used for the "Resend code in Xs" timer on OTP screens.
 *
 * @param initialSeconds - how long to wait before allowing resend (default 60)
 */
export function useCountdown(initialSeconds = 60) {
  const [seconds,   setSeconds]   = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback((from = initialSeconds) => {
    setSeconds(from)
    setIsRunning(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setIsRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatted = seconds > 0
    ? `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    : '00:00'

  return {
    seconds,
    formatted,
    isRunning,
    canResend: !isRunning && seconds === 0,
    start,
    stop,
  }
}
