'use client'

import { useState, useRef, useCallback } from 'react'

const LENGTH = 6

/**
 * useOtpInput
 * ────────────
 * Manages the 6-box OTP input:
 *  - auto-focus next box on digit entry
 *  - backspace moves focus back
 *  - paste fills all boxes at once
 *  - returns the combined code string
 */
export function useOtpInput(onComplete?: (code: string) => void) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const refs = useRef<Array<HTMLInputElement | null>>(Array(LENGTH).fill(null))

  const code = digits.join('')
  const isComplete = code.length === LENGTH && digits.every(d => /^\d$/.test(d))

  const focus = (index: number) => {
    refs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus()
  }

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digits
      const digit = value.replace(/\D/g, '').slice(-1)

      const next = [...digits]
      next[index] = digit
      setDigits(next)

      if (digit && index < LENGTH - 1) focus(index + 1)

      const combined = next.join('')
      if (combined.length === LENGTH && next.every(d => /^\d$/.test(d))) {
        onComplete?.(combined)
      }
    },
    [digits, onComplete]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index]) {
          // Clear current
          const next = [...digits]
          next[index] = ''
          setDigits(next)
        } else if (index > 0) {
          // Move back and clear previous
          focus(index - 1)
          const next = [...digits]
          next[index - 1] = ''
          setDigits(next)
        }
      }
      if (e.key === 'ArrowLeft'  && index > 0)          focus(index - 1)
      if (e.key === 'ArrowRight' && index < LENGTH - 1) focus(index + 1)
    },
    [digits]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
      if (!pasted) return

      const next = Array(LENGTH).fill('')
      pasted.split('').forEach((d, i) => { next[i] = d })
      setDigits(next)

      const focusIdx = Math.min(pasted.length, LENGTH - 1)
      focus(focusIdx)

      if (pasted.length === LENGTH) onComplete?.(pasted)
    },
    [onComplete]
  )

  const reset = useCallback(() => {
    setDigits(Array(LENGTH).fill(''))
    focus(0)
  }, [])

  const setRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      refs.current[index] = el
    },
    []
  )

  return {
    digits,
    code,
    isComplete,
    setRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
    focusFirst: () => focus(0),
  }
}
