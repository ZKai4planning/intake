'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700)) // replace with real API call
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[#00D4FF]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        You're subscribed — check your inbox.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex items-center border-b border-[#2A3A50] focus-within:border-[#00D4FF] transition-colors duration-150"
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email address"
        required
        aria-label="Email address for newsletter"
        className="flex-1 bg-transparent py-2.5 text-[13px] text-[#E8F0FF] placeholder:text-[#3A4A60] outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Subscribe"
        className="shrink-0 text-[#5A6A8A] hover:text-[#00D4FF] transition-colors duration-150 disabled:opacity-40 pl-2"
      >
        {loading ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
      </button>
    </form>
  )
}