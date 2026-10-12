'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/cn'
import type { QuestionRow } from '@/types/questions'

interface QuestionFieldProps {
  question: QuestionRow
  value:    string | string[] | File[] | null
  onChange: (value: string | string[] | File[] | null) => void
}

/**
 * QuestionField
 * ──────────────
 * Single dispatcher component that renders the correct input UI for
 * every QuestionInputType in the workbook schema. Adding a new row to
 * QUESTION_BANK never requires a new component — only data.
 */
export function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  switch (question.inputType) {
    case 'text':
      return <TextField question={question} value={value as string} onChange={onChange} />

    case 'textarea':
      return <TextAreaField question={question} value={value as string} onChange={onChange} />

    case 'radio':
      return <RadioField question={question} value={value as string} onChange={onChange} />

    case 'radio-text':
      return <RadioTextField question={question} value={value as string} onChange={onChange} />

    case 'dropdown':
      return <DropdownField question={question} value={value as string} onChange={onChange} />

    case 'dropdown-text':
      return <DropdownTextField question={question} value={value as string} onChange={onChange} />

    case 'checkbox-group':
      return <CheckboxGroupField question={question} value={(value as string[]) ?? []} onChange={onChange} />

    case 'file-upload':
      return <FileUploadField question={question} value={(value as File[]) ?? []} onChange={onChange} />

    case 'radio-file':
      return <RadioFileField question={question} value={value as string} onChange={onChange} />

    case 'signature':
      return <SignatureField question={question} value={value as string} onChange={onChange} />

    default:
      return null
  }
}

// ── Shared label wrapper ──────────────────────────────────────────
function FieldWrapper({ question, children }: { question: QuestionRow; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <label className="text-[13.5px] font-semibold text-[#E8F0FF] leading-snug">
          {question.field}
          {question.required && <span className="text-[#F87171] ml-1">*</span>}
        </label>
        <span className="shrink-0 text-[10px] font-mono text-[#5A6A8A] mt-0.5">
          {question.rowId}
        </span>
      </div>
      <p className="text-[12px] text-[#5A6A8A] leading-relaxed">{question.guidance}</p>
      {children}
    </div>
  )
}

const inputBase = cn(
  'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
  'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
  'border border-white/[0.12] outline-none transition-all',
  'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
)

// ── text ──────────────────────────────────────────────────────────
function TextField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  return (
    <FieldWrapper question={question}>
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={question.placeholder ?? 'Type your answer…'}
        className={inputBase}
      />
    </FieldWrapper>
  )
}

// ── textarea ──────────────────────────────────────────────────────
function TextAreaField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  return (
    <FieldWrapper question={question}>
      <textarea
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={question.placeholder ?? 'Type your answer…'}
        rows={3}
        className={cn(inputBase, 'resize-none leading-relaxed')}
      />
    </FieldWrapper>
  )
}

// ── radio ─────────────────────────────────────────────────────────
function RadioField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  return (
    <FieldWrapper question={question}>
      <div className="flex flex-wrap gap-2">
        {question.options?.map(opt => (
          <RadioPill
            key={opt.value}
            selected={value === opt.value}
            flagged={!!opt.triggersUpsell && value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </RadioPill>
        ))}
      </div>
    </FieldWrapper>
  )
}

// ── radio-text (radio + conditional detail field) ─────────────────
function RadioTextField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  const [detail, setDetail] = useState('')
  const showDetail = value && value !== 'unsure' && value !== 'no'

  return (
    <FieldWrapper question={question}>
      <div className="flex flex-wrap gap-2 mb-2">
        {question.options?.map(opt => (
          <RadioPill
            key={opt.value}
            selected={value === opt.value}
            flagged={!!opt.triggersUpsell && value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </RadioPill>
        ))}
      </div>
      {showDetail && (
        <input
          type="text"
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="Add details…"
          className={cn(inputBase, 'animate-[fadeIn_0.15s_ease-out]')}
        />
      )}
    </FieldWrapper>
  )
}

// ── dropdown ──────────────────────────────────────────────────────
function DropdownField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  return (
    <FieldWrapper question={question}>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className={cn(inputBase, 'cursor-pointer appearance-none')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%235A6A8A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '34px',
        }}
      >
        <option value="" disabled>Select…</option>
        {question.options?.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FieldWrapper>
  )
}

// ── dropdown-text (dropdown + free text address/details) ──────────
function DropdownTextField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  const [detail, setDetail] = useState('')
  return (
    <FieldWrapper question={question}>
      <div className="space-y-2">
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className={cn(inputBase, 'cursor-pointer appearance-none')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%235A6A8A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '34px',
          }}
        >
          <option value="" disabled>Select…</option>
          {question.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="Site address or additional detail…"
          className={inputBase}
        />
      </div>
    </FieldWrapper>
  )
}

// ── checkbox-group ────────────────────────────────────────────────
function CheckboxGroupField({ question, value, onChange }: { question: QuestionRow; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <FieldWrapper question={question}>
      <div className="flex flex-col gap-1.5">
        {question.options?.map(opt => {
          const checked = value.includes(opt.value)
          return (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-[8px] cursor-pointer transition-colors',
                checked ? 'bg-[rgba(19,91,236,0.07)] border border-[rgba(19,91,236,0.25)]' : 'border border-white/[0.08] hover:bg-white/[0.03]'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all',
                  checked ? 'bg-[#135BEC] border-[#135BEC]' : 'border-white/[0.24]'
                )}
              >
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#050A12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
              </span>
              <input type="checkbox" checked={checked} onChange={() => toggle(opt.value)} className="sr-only" />
              <span className="text-[13px] text-[#A8B8D8]">{opt.label}</span>
            </label>
          )
        })}
      </div>
    </FieldWrapper>
  )
}

// ── file-upload ───────────────────────────────────────────────────
function FileUploadField({ question, value, onChange }: { question: QuestionRow; value: File[]; onChange: (v: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    onChange([...value, ...Array.from(files)])
  }

  function removeFile(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <FieldWrapper question={question}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full flex flex-col items-center gap-2 py-6 rounded-[10px] border border-dashed transition-colors',
          'border-white/[0.16] hover:border-[#135BEC] hover:bg-[rgba(19,91,236,0.03)]'
        )}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5A6A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="text-[12.5px] text-[#A8B8D8]">Click to upload or drag files here</span>
        <span className="text-[11px] text-[#5A6A8A]">PDF, JPG, PNG, DWG — up to 25MB each</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {value.length > 0 && (
        <ul className="space-y-1.5 mt-2">
          {value.map((file, i) => (
            <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-white/[0.03] text-[12.5px] text-[#A8B8D8]">
              <span className="text-[#135BEC] shrink-0">📄</span>
              <span className="truncate flex-1">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-[#5A6A8A] hover:text-[#F87171] shrink-0">✕</button>
            </li>
          ))}
        </ul>
      )}
    </FieldWrapper>
  )
}

// ── radio-file (radio + conditional file upload) ───────────────────
function RadioFileField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const showUpload = value === 'yes'

  return (
    <FieldWrapper question={question}>
      <div className="flex flex-wrap gap-2 mb-2">
        {question.options?.map(opt => (
          <RadioPill
            key={opt.value}
            selected={value === opt.value}
            flagged={!!opt.triggersUpsell && value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </RadioPill>
        ))}
      </div>

      {showUpload && (
        <div className="animate-[fadeIn_0.15s_ease-out]">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] border border-dashed border-white/[0.16] hover:border-[#135BEC] text-[12px] text-[#A8B8D8] transition-colors"
          >
            📎 Upload supporting plan
          </button>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files ?? []))} />
          {files.length > 0 && (
            <p className="text-[11px] text-[#135BEC] mt-1.5">{files.length} file(s) attached</p>
          )}
        </div>
      )}
    </FieldWrapper>
  )
}

// ── signature ─────────────────────────────────────────────────────
function SignatureField({ question, value, onChange }: { question: QuestionRow; value: string; onChange: (v: string) => void }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <FieldWrapper question={question}>
      <label className="flex items-start gap-3 px-3.5 py-3 rounded-[10px] bg-white/[0.03] border border-white/[0.08] cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#135BEC] shrink-0"
        />
        <span className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
          I confirm the information provided is accurate to the best of my knowledge,
          that I have authority to act on this application, and I agree to the terms of service.
        </span>
      </label>

      {agreed && (
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your full name to sign"
          className={cn(inputBase, 'mt-2.5 font-display text-[16px] italic')}
        />
      )}
    </FieldWrapper>
  )
}

// ── Shared radio pill ──────────────────────────────────────────────
function RadioPill({
  children, selected, flagged, onClick,
}: { children: React.ReactNode; selected: boolean; flagged: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all',
        selected
          ? flagged
            ? 'bg-[rgba(245,158,11,0.12)] border-[#F59E0B] text-[#F59E0B]'
            : 'bg-[rgba(19,91,236,0.12)] border-[#135BEC] text-[#135BEC]'
          : 'bg-[#0F1525] border-white/[0.12] text-[#A8B8D8] hover:border-white/[0.24]'
      )}
    >
      {children}
    </button>
  )
}
