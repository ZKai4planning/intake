'use client'

import { useCallback, useRef, useState } from 'react'
import { Info, Upload, Sparkles, RotateCcw, CheckCircle2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useEligibilityField, asStringValue, asArrayValue } from './EligibilityFormContext'
import { useAgentZ } from './AgentZContext'
import type { EligibilitySharedComponents, EligibilityOptionStyleOverride, MissingUploadTrigger } from './types'

/**
 * fields.tsx
 * ────────────
 * The shared "components" library the uploaded step-content files
 * expect (see types.ts's EligibilitySharedComponents). Every field
 * here reads/writes its own value via EligibilityFormContext, keyed
 * by its `label` (or `fieldKey` for DeclarationCheckbox) — matching
 * exactly how the step files call them, with no value/onChange wired
 * at the call site.
 *
 * "Ask Agent Z" hooks (consultTrigger, AgentActionButton,
 * onMissingTrigger) open the floating mock agent (AgentZWidget) with
 * context about the field that triggered them — see lib/agentZ.ts for
 * the templated-reply engine and its swap point for a real backend.
 */

const inputBase = cn(
  'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
  'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
  'border border-white/[0.12] outline-none transition-all',
  'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
)

function needsHelp(value: string): boolean {
  const v = value.toLowerCase()
  return v.includes('ask agent') || v.includes("don't know") || v.includes('unsure')
}

// ── FieldLabel ──────────────────────────────────────────────────────
const FieldLabel: EligibilitySharedComponents['FieldLabel'] = ({
  label,
  tooltip,
  questionNumber,
  inline,
  labelClassName,
  wrapperClassName,
}) => (
  <div className={cn(inline ? 'inline-flex items-center gap-1.5' : 'flex items-center gap-1.5', wrapperClassName)}>
    {typeof questionNumber === 'number' && (
      <span className="text-[10.5px] font-bold text-[#5A6A8A]">Q{questionNumber}.</span>
    )}
    <span className={cn('text-[13px] font-semibold text-[#E8F0FF]', labelClassName)}>{label}</span>
    {tooltip && (
      <span title={tooltip} className="cursor-help text-[#5A6A8A] hover:text-[#A8B8D8]">
        <Info className="h-3.5 w-3.5" />
      </span>
    )}
  </div>
)

// ── SectionHeading ───────────────────────────────────────────────────
const SectionHeading: EligibilitySharedComponents['SectionHeading'] = ({ children }) => (
  <h3 className="mb-4 mt-2 text-[13px] font-bold uppercase tracking-[0.06em] text-[#00D4FF] first:mt-0">
    {children}
  </h3>
)

// ── ConsultNote — shown under a field once its value signals "needs help" ──
function ConsultNote({ message, fieldLabel }: { message: string; fieldLabel?: string }) {
  const { openAgent } = useAgentZ()
  return (
    <div className="mt-1.5 flex items-start justify-between gap-2">
      <p className="flex items-start gap-1.5 text-[11.5px] text-[#A8B8D8]">
        <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-[#00D4FF]" />
        {message}
      </p>
      <button
        type="button"
        onClick={() => openAgent({ fieldLabel, openingMessage: fieldLabel ? `I need help with: ${fieldLabel}` : message })}
        className="shrink-0 text-[11px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff]"
      >
        Ask Agent Z →
      </button>
    </div>
  )
}

// ── Input ────────────────────────────────────────────────────────────
const Input: EligibilitySharedComponents['Input'] = ({
  label,
  tooltip,
  questionNumber,
  placeholder,
  fieldIdOverride,
  actionLabel,
  onAction,
  actionDisabled,
  actionMessage,
}) => {
  const { getValue, setValue } = useEligibilityField()
  const value = asStringValue(getValue(label))

  return (
    <div>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} wrapperClassName="mb-1.5" />
      <div className="flex gap-2">
        <input
          id={fieldIdOverride}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(label, e.target.value)}
          className={cn(inputBase, 'flex-1')}
        />
        {actionLabel && (
          <button
            type="button"
            onClick={() => onAction?.()}
            disabled={actionDisabled}
            className="shrink-0 rounded-[10px] border border-white/[0.12] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#A8B8D8] transition-colors hover:bg-white/[0.05] hover:text-[#E8F0FF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {actionMessage && <ConsultNote message={actionMessage} fieldLabel={label} />}
    </div>
  )
}

// ── PhoneNumberField ─────────────────────────────────────────────────
const PHONE_FIELD_KEY = 'Phone Number'
const PhoneNumberField: EligibilitySharedComponents['PhoneNumberField'] = ({ tooltip, questionNumber }) => {
  const { getValue, setValue } = useEligibilityField()
  const value = asStringValue(getValue(PHONE_FIELD_KEY))

  return (
    <div>
      <FieldLabel label={PHONE_FIELD_KEY} tooltip={tooltip} questionNumber={questionNumber} wrapperClassName="mb-1.5" />
      <input
        type="tel"
        value={value}
        placeholder="e.g. 07700 900123"
        onChange={e => setValue(PHONE_FIELD_KEY, e.target.value)}
        className={inputBase}
      />
    </div>
  )
}

// ── RadioGroupField ──────────────────────────────────────────────────
const RadioGroupField: EligibilitySharedComponents['RadioGroupField'] = ({
  label,
  tooltip,
  questionNumber,
  options,
  consultTrigger,
  className,
}) => {
  const { getValue, setValue } = useEligibilityField()
  const value = asStringValue(getValue(label))

  return (
    <div className={className}>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} wrapperClassName="mb-1.5" />
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = value === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => setValue(label, option)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                active
                  ? 'border-transparent bg-[#135BEC] text-white'
                  : 'border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      {consultTrigger && needsHelp(value) && <ConsultNote message={consultTrigger} fieldLabel={label} />}
    </div>
  )
}

// ── SelectField ──────────────────────────────────────────────────────
const SelectField: EligibilitySharedComponents['SelectField'] = ({
  label,
  tooltip,
  questionNumber,
  options,
  consultTrigger,
}) => {
  const { getValue, setValue } = useEligibilityField()
  const value = asStringValue(getValue(label))

  return (
    <div>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} wrapperClassName="mb-1.5" />
      <select value={value} onChange={e => setValue(label, e.target.value)} className={cn(inputBase, 'cursor-pointer')}>
        <option value="" disabled>
          Select…
        </option>
        {options.map(option => (
          <option key={option} value={option} className="bg-[#141C30]">
            {option}
          </option>
        ))}
      </select>
      {consultTrigger && needsHelp(value) && <ConsultNote message={consultTrigger} fieldLabel={label} />}
    </div>
  )
}

// ── CheckboxGroup ────────────────────────────────────────────────────
const CheckboxGroup: EligibilitySharedComponents['CheckboxGroup'] = ({
  label,
  tooltip,
  questionNumber,
  options,
  consultTrigger,
  optionStyleOverrides,
  className,
}) => {
  const { getValue, setValue } = useEligibilityField()
  const selected = asArrayValue(getValue(label))

  function toggle(option: string) {
    const next = selected.includes(option) ? selected.filter(o => o !== option) : [...selected, option]
    setValue(label, next)
  }

  const flaggedForHelp = selected.some(needsHelp)

  return (
    <div className={className}>
      <FieldLabel label={label} tooltip={tooltip} questionNumber={questionNumber} wrapperClassName="mb-1.5" />
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected.includes(option)
          const override: EligibilityOptionStyleOverride = optionStyleOverrides?.[option] ?? {}
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                override.centerLabel && 'justify-center',
                active
                  ? 'border-transparent bg-[#135BEC] text-white'
                  : override.hideIndicator
                    ? 'border-dashed border-white/[0.18] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
                    : 'border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
              )}
            >
              {!override.hideIndicator && active && <CheckCircle2 className="h-3.5 w-3.5" />}
              {option}
            </button>
          )
        })}
      </div>
      {consultTrigger && flaggedForHelp && <ConsultNote message={consultTrigger} fieldLabel={label} />}
    </div>
  )
}

// ── AgentActionButton ────────────────────────────────────────────────
const AgentActionButton: EligibilitySharedComponents['AgentActionButton'] = ({
  label,
  onClick,
  disabled,
  className,
  agentFieldLabel,
  agentMessage,
}) => {
  const { openAgent } = useAgentZ()
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        openAgent({ fieldLabel: agentFieldLabel, openingMessage: agentMessage ?? `I need help with: ${agentFieldLabel ?? label}` })
      }}
      disabled={disabled}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/[0.08] px-3 py-1.5 text-[11.5px] font-semibold text-[#00D4FF] transition-colors hover:bg-[#00D4FF]/[0.14] disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </button>
  )
}

// ── FileUploadArea ───────────────────────────────────────────────────
function missingTriggerMessage(trigger: MissingUploadTrigger): string {
  return typeof trigger === 'string' ? trigger : trigger.message
}
function missingTriggerDecision(trigger: MissingUploadTrigger) {
  return typeof trigger === 'string' ? undefined : trigger.decision
}

const FileUploadArea: EligibilitySharedComponents['FileUploadArea'] = ({ label, accept, multiple, hint, onMissingTrigger }) => {
  const { getValue, setValue } = useEligibilityField()
  const { openAgent } = useAgentZ()
  const files = asArrayValue(getValue(label))
  const inputRef = useRef<HTMLInputElement>(null)
  const decisionKey = `${label} — Need help?`
  const decision = asStringValue(getValue(decisionKey))

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const names = Array.from(fileList).map(f => f.name)
    setValue(label, multiple ? [...files, ...names] : names.slice(0, 1))
  }

  function removeFile(name: string) {
    setValue(label, files.filter(f => f !== name))
  }

  const missingBlock = onMissingTrigger && files.length === 0
  const trigger = onMissingTrigger

  return (
    <div>
      <FieldLabel label={label} wrapperClassName="mb-1.5" />
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-white/[0.18] bg-[#141C30] px-4 py-6 text-center transition-colors hover:border-[#135BEC]/50"
      >
        <Upload className="h-4 w-4 text-[#5A6A8A]" />
        <p className="text-[12px] text-[#A8B8D8]">Click to upload{hint ? ` — ${hint}` : ''}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map(name => (
            <li key={name} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#A8B8D8]">
              <span className="truncate">{name}</span>
              <button type="button" onClick={() => removeFile(name)} className="shrink-0 text-[#5A6A8A] hover:text-[#E8F0FF]">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {missingBlock && trigger && (
        <div className="mt-2 rounded-[10px] border border-amber-400/20 bg-amber-500/[0.06] px-3.5 py-3">
          <p className="text-[12px] text-[#A8B8D8]">{missingTriggerMessage(trigger)}</p>
          {missingTriggerDecision(trigger) && !decision && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11.5px] text-[#5A6A8A]">{missingTriggerDecision(trigger)!.prompt}</span>
              <button
                type="button"
                onClick={() => {
                  setValue(decisionKey, 'Yes')
                  openAgent({
                    fieldLabel: label,
                    openingMessage: `I need help with: ${missingTriggerDecision(trigger)?.fieldLabel ?? label}`,
                  })
                }}
                className="rounded-full bg-[#135BEC] px-3 py-1 text-[11px] font-semibold text-white"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setValue(decisionKey, 'No')}
                className="rounded-full border border-white/[0.12] px-3 py-1 text-[11px] font-semibold text-[#A8B8D8]"
              >
                No
              </button>
            </div>
          )}
          {decision && missingTriggerDecision(trigger) && (
            <ConsultNote
              fieldLabel={label}
              message={
                decision === 'Yes'
                  ? missingTriggerDecision(trigger)!.yesMessage ?? "Noted — we'll follow up on this."
                  : missingTriggerDecision(trigger)!.noMessage ?? 'Noted.'
              }
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── StructuredFileUploadArea ─────────────────────────────────────────
const StructuredFileUploadArea: EligibilitySharedComponents['StructuredFileUploadArea'] = ({
  label,
  accept,
  hint,
  slotLabels,
  showDescriptionInput = true,
  minSlots,
  allowAddMore,
  descriptionPlaceholder,
  onMissingTrigger,
}) => {
  const { getValue, setValue } = useEligibilityField()
  const [extraSlots, setExtraSlots] = useState(0)

  const baseSlots = slotLabels && slotLabels.length > 0 ? slotLabels : []
  const genericCount = Math.max((minSlots ?? 0) - baseSlots.length, 0) + extraSlots
  const slots = [...baseSlots, ...Array.from({ length: genericCount }, (_, i) => `Item ${baseSlots.length + i + 1}`)]

  const anyUploaded = slots.some(slot => asStringValue(getValue(`${label} — ${slot}`)))

  function handleSlotFile(slot: string, fileList: FileList | null) {
    const name = fileList?.[0]?.name
    if (name) setValue(`${label} — ${slot}`, name)
  }

  return (
    <div>
      <FieldLabel label={label} wrapperClassName="mb-1.5" />
      {hint && <p className="mb-2 text-[11.5px] text-[#5A6A8A]">{hint}</p>}

      <div className="space-y-2">
        {slots.map(slot => {
          const fileName = asStringValue(getValue(`${label} — ${slot}`))
          const descKey = `${label} — ${slot} — Description`
          return (
            <div key={slot} className="rounded-[10px] border border-white/[0.10] bg-[#141C30] px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-[#A8B8D8]">{slot}</span>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/[0.12] px-3 py-1 text-[11.5px] font-semibold text-[#A8B8D8] hover:bg-white/[0.05]">
                  <Upload className="h-3 w-3" />
                  {fileName ? 'Replace' : 'Upload'}
                  <input type="file" accept={accept} className="hidden" onChange={e => handleSlotFile(slot, e.target.files)} />
                </label>
              </div>
              {fileName && <p className="mt-1.5 truncate text-[11.5px] text-emerald-300">{fileName}</p>}
              {showDescriptionInput && (
                <input
                  type="text"
                  value={asStringValue(getValue(descKey))}
                  onChange={e => setValue(descKey, e.target.value)}
                  placeholder={descriptionPlaceholder ?? 'Description (optional)'}
                  className="mt-2 w-full rounded-lg border border-white/[0.10] bg-transparent px-2.5 py-1.5 text-[11.5px] text-[#E8F0FF] placeholder:text-[#5A6A8A] outline-none focus:border-[#135BEC]"
                />
              )}
            </div>
          )
        })}
      </div>

      {allowAddMore && (
        <button
          type="button"
          onClick={() => setExtraSlots(n => n + 1)}
          className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another
        </button>
      )}

      {onMissingTrigger && !anyUploaded && (
        <p className="mt-2 text-[11.5px] text-[#A8B8D8]">{missingTriggerMessage(onMissingTrigger)}</p>
      )}
    </div>
  )
}

// ── DeclarationCheckbox ──────────────────────────────────────────────
const DeclarationCheckbox: EligibilitySharedComponents['DeclarationCheckbox'] = ({ label, fieldKey }) => {
  const { getValue, setValue } = useEligibilityField()
  const checked = asStringValue(getValue(fieldKey)) === 'Yes'

  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => setValue(fieldKey, e.target.checked ? 'Yes' : '')}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#135BEC]"
      />
      <span className="text-[12.5px] leading-relaxed text-[#A8B8D8]">{label}</span>
    </label>
  )
}

// ── SignaturePad ─────────────────────────────────────────────────────
const SignaturePad: EligibilitySharedComponents['SignaturePad'] = ({ label, strokeWidth = 2 }) => {
  const { getValue, setValue } = useEligibilityField()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasSignature = !!asStringValue(getValue(label))

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d') ?? null, [])

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true
    const ctx = getCtx()
    if (!ctx) return
    const { x, y } = pointerPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = getCtx()
    if (!ctx) return
    const { x, y } = pointerPos(e)
    ctx.strokeStyle = '#E8F0FF'
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function handlePointerUp() {
    if (!drawingRef.current) return
    drawingRef.current = false
    const dataUrl = canvasRef.current?.toDataURL('image/png')
    if (dataUrl) setValue(label, dataUrl)
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setValue(label, '')
  }

  return (
    <div>
      <FieldLabel label={label} wrapperClassName="mb-1.5" />
      <canvas
        ref={canvasRef}
        width={400}
        height={140}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-[10px] border border-white/[0.12] bg-[#141C30]"
      />
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[11px] text-[#5A6A8A]">{hasSignature ? 'Signature captured' : 'Draw your signature above'}</span>
        <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#A8B8D8] hover:text-[#E8F0FF]">
          <RotateCcw className="h-3 w-3" />
          Clear
        </button>
      </div>
    </div>
  )
}

export const eligibilityComponents: EligibilitySharedComponents = {
  SectionHeading,
  Input,
  PhoneNumberField,
  RadioGroupField,
  SelectField,
  FieldLabel,
  AgentActionButton,
  FileUploadArea,
  StructuredFileUploadArea,
  CheckboxGroup,
  DeclarationCheckbox,
  SignaturePad,
}
