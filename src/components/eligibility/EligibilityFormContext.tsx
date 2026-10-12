'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import type { EligibilityFormValue, EligibilityFormValues, EligibilityUpdateSection } from './types'

interface EligibilityFormContextValue {
  savedFormData: EligibilityFormValues
  /** Read a raw (possibly array) value by field label/key. */
  getValue: (key: string) => EligibilityFormValue
  /** Write a single field by label/key — merges into formData, same shape every step file already writes. */
  setValue: (key: string, value: EligibilityFormValue) => void
}

const EligibilityFormContext = createContext<EligibilityFormContextValue | null>(null)

/**
 * EligibilityFormProvider
 * ──────────────────────────
 * The uploaded step-content files call field components like
 * `<Input label="Applicant First Name" />` with no value/onChange —
 * the field itself is expected to read and write its own value using
 * the label as the storage key. This context is what makes that work:
 * it wraps the SAME savedFormData/updateSection the step files also
 * receive as explicit props, so both channels stay in sync.
 */
export function EligibilityFormProvider({
  savedFormData,
  updateSection,
  children,
}: {
  savedFormData: EligibilityFormValues
  updateSection: EligibilityUpdateSection
  children: React.ReactNode
}) {
  const getValue = useCallback((key: string) => savedFormData[key], [savedFormData])

  const setValue = useCallback(
    (key: string, value: EligibilityFormValue) => {
      updateSection('eligibility', { formData: { ...savedFormData, [key]: value } })
    },
    [savedFormData, updateSection]
  )

  const value = useMemo(() => ({ savedFormData, getValue, setValue }), [savedFormData, getValue, setValue])

  return <EligibilityFormContext.Provider value={value}>{children}</EligibilityFormContext.Provider>
}

export function useEligibilityField() {
  const ctx = useContext(EligibilityFormContext)
  if (!ctx) {
    throw new Error('Eligibility field components must be rendered inside <EligibilityFormProvider>')
  }
  return ctx
}

export function asStringValue(value: EligibilityFormValue): string {
  if (Array.isArray(value)) return value.join(', ')
  return value ?? ''
}

export function asArrayValue(value: EligibilityFormValue): string[] {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}
