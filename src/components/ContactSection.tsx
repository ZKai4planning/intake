'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

// ── Types ─────────────────────────────────────────────────────────
type FieldState = 'idle' | 'error'

interface FormState {
  name: string
  phone: string
  email: string
  company: string
  industry: string
  reason: string
}

interface FieldErrors {
  name?: string
  phone?: string
  email?: string
  company?: string
  industry?: string
  reason?: string
}

const INDUSTRIES = [
  'Construction & Infrastructure',
  'Real Estate Development',
  'Architecture & Engineering',
  'Urban Planning',
  'Project Management',
  'Government & Public Sector',
  'Energy & Utilities',
  'Transportation & Logistics',
  'Technology',
  'Other',
]

// ── Sub-components ────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#5A6A8A]">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-[#F87171] flex items-center gap-1.5" role="alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const inputBase = [
  'w-full rounded-[10px] px-4 py-3',
  'bg-[#141C30] text-[#E8F0FF] text-[14px]',
  'placeholder:text-[#5A6A8A]',
  'border transition-all duration-150 outline-none',
  'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]',
].join(' ')

const inputIdle  = 'border-white/[0.12]'
const inputError = 'border-[rgba(248,113,113,0.6)] shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'

// ── LinkedIn icon ─────────────────────────────────────────────────
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

// ── Success state ─────────────────────────────────────────────────
function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#135BEC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>
      <div>
        <h3 className="text-[18px] font-semibold text-[#E8F0FF] mb-2">We'll be in touch soon</h3>
        <p className="text-[14px] text-[#5A6A8A] max-w-[280px]">
          Thanks for reaching out. One of our team will get back to you within one business day.
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export function ContactSection() {
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', email: '', company: '', industry: '', reason: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!form.name.trim())    next.name    = 'Name is required'
    if (!form.email.trim())   next.email   = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               next.email   = 'Enter a valid email address'
    if (!form.phone.trim())   next.phone   = 'Phone number is required'
    if (!form.company.trim()) next.company = 'Company is required'
    if (!form.industry)       next.industry = 'Please select an industry'
    if (!form.reason.trim())  next.reason  = 'Please tell us why you\'re reaching out'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    // Replace this with your actual API call:
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section className="relative py-20 px-5 overflow-hidden" id="contact">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(19,91,236,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Section eyebrow ── */}
        <div className="mb-10 text-center">
          <span className="inline-block text-[11px] font-semibold tracking-[0.08em] uppercase text-[#135BEC] bg-[rgba(19,91,236,0.1)] border border-[rgba(19,91,236,0.2)] rounded-[6px] px-2.5 py-1 mb-4">
            Contact
          </span>
          <h2 className="text-[clamp(28px,5vw,40px)] font-light tracking-[-0.02em] text-[#E8F0FF]">
            Get in touch
          </h2>
          <p className="mt-3 text-[15px] text-[#5A6A8A]">
            Fill in the form and one of our team will be in touch very soon.
          </p>
        </div>

        {/* ── Two-column card ── */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">

          {/* Left — form card */}
          <div className="rounded-[20px] bg-[#0F1525] border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.4)] px-6 py-8 sm:px-8 sm:py-10">
            {submitted ? (
              <SuccessMessage />
            ) : (
              <div className="flex flex-col gap-5">

                {/* Row: Name + Phone */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full name" error={errors.name}>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={set('name')}
                      className={cn(inputBase, errors.name ? inputError : inputIdle)}
                    />
                  </Field>
                  <Field label="Phone number" error={errors.phone}>
                    <input
                      type="tel"
                      placeholder="+44 7700 000000"
                      value={form.phone}
                      onChange={set('phone')}
                      className={cn(inputBase, errors.phone ? inputError : inputIdle)}
                    />
                  </Field>
                </div>

                {/* Row: Email + Company */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={set('email')}
                      className={cn(inputBase, errors.email ? inputError : inputIdle)}
                    />
                  </Field>
                  <Field label="Company" error={errors.company}>
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={set('company')}
                      className={cn(inputBase, errors.company ? inputError : inputIdle)}
                    />
                  </Field>
                </div>

                {/* Industry select */}
                <Field label="Industry" error={errors.industry}>
                  <div className="relative">
                    <select
                      value={form.industry}
                      onChange={set('industry')}
                      className={cn(
                        inputBase,
                        'appearance-none pr-10 cursor-pointer',
                        errors.industry ? inputError : inputIdle,
                        !form.industry && 'text-[#5A6A8A]'
                      )}
                    >
                      <option value="" disabled>Select your industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-[#141C30] text-[#E8F0FF]">
                          {ind}
                        </option>
                      ))}
                    </select>
                    {/* Chevron */}
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A6A8A]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </Field>

                {/* Reason textarea */}
                <Field label="Reason for enquiry" error={errors.reason}>
                  <textarea
                    placeholder="Tell us how we can help…"
                    value={form.reason}
                    onChange={set('reason')}
                    rows={4}
                    className={cn(
                      inputBase,
                      'resize-none leading-relaxed',
                      errors.reason ? inputError : inputIdle
                    )}
                  />
                </Field>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={cn(
                    'relative w-full rounded-[10px] py-3.5 text-[14px] font-semibold tracking-[0.01em] transition-all duration-200',
                    'bg-[#135BEC] text-white',
                    'hover:bg-[#2A6BF0] hover:shadow-[0_0_24px_rgba(19,91,236,0.35)]',
                    'active:scale-[0.99]',
                    'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none'
                  )}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    'Request a callback'
                  )}
                </button>

              </div>
            )}
          </div>

          {/* Right — contact info card */}
          <div className="rounded-[20px] bg-[#0F1525] border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.4)] px-6 py-8 flex flex-col justify-between">

            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#5A6A8A] mb-1">
                Contact us
              </p>
              {/* Expand/collapse icon — decorative to match screenshot */}
              <div className="flex justify-end">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A6A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              </div>
            </div>

            {/* ── Contact details ── */}
            <div className="space-y-4 mt-auto">

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#141C30] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A6A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <a
                  href="mailto:hello@ai4planning.com"
                  className="text-[13px] text-[#A8B8D8] hover:text-[#135BEC] transition-colors"
                >
                  hello@ai4planning.com
                </a>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#141C30] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A6A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="text-[13px] text-[#A8B8D8] leading-relaxed">
                  [Your Office Address]<br />
                  City, Postcode
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Social */}
              <div className="flex items-center gap-2">
                <a
                  href="https://linkedin.com/company/ai4planning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-[8px] bg-[#141C30] border border-white/[0.08] flex items-center justify-center text-[#5A6A8A] hover:text-[#135BEC] hover:border-[rgba(19,91,236,0.3)] transition-all"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}