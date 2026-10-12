import { useEffect, useRef, useState } from 'react'

/**
 * useVoiceInput
 * ──────────────
 * Free, browser-native speech-to-text (Web Speech API — no key, no
 * external calls). Chrome/Edge/Safari only; Firefox has no
 * SpeechRecognition implementation, so `supported` flips false on
 * mount there and callers should disable/hide the mic button.
 *
 * Extracted from SearchBar.tsx so any composer (hero search, chat,
 * future inputs) can get a mic button with three lines of wiring:
 *
 *   const { isListening, supported, toggle } = useVoiceInput({
 *     value: text,
 *     onChange: setText,
 *   })
 */
export interface UseVoiceInputOptions {
  /** Current text value of the field the transcript should be appended to. */
  value: string
  /** Called with the full updated string (existing value + live transcript) as speech comes in. */
  onChange: (next: string) => void
  /** Called whenever listening starts/stops. */
  onListeningChange?: (listening: boolean) => void
}

export interface UseVoiceInputResult {
  isListening: boolean
  /** False on browsers with no SpeechRecognition implementation (e.g. Firefox). */
  supported: boolean
  /** Starts listening if idle, stops if already listening. */
  toggle: () => void
}

export function useVoiceInput({
  value,
  onChange,
  onListeningChange,
}: UseVoiceInputOptions): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const baseValueRef = useRef('')
  // Keep a live ref to `value` so `toggle` (created once via useRef-free
  // closures below) always appends to the latest text, not a stale
  // snapshot from when the hook first rendered.
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
        : null
    setSupported(!!SpeechRecognitionCtor)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const toggle = () => {
    // Already listening -> this call means "stop".
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    if (!supported) return

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US'

    // Preserve whatever the person already typed and append transcribed
    // speech after it, rather than overwriting the field.
    baseValueRef.current = valueRef.current ? `${valueRef.current} ` : ''

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onChange(`${baseValueRef.current}${transcript}`)
    }

    recognition.onerror = () => {
      setIsListening(false)
      onListeningChange?.(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      onListeningChange?.(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    onListeningChange?.(true)
  }

  return { isListening, supported, toggle }
}
