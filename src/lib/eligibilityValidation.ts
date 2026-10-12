// import type { EligibilityFormValues } from '@/components/eligibility/types'

// /**
//  * eligibilityValidation.ts
//  * ───────────────────────────
//  * Deliberately narrow: most fields in this form are conditionally
//  * shown (an entire address block disappears if "same as site
//  * address" is Yes; HMO/tree/flood sections only render for certain
//  * subservices — see eligibilityRelevance.ts). Requiring a field that
//  * might not even be on screen would block Continue for the wrong
//  * reason, so this only covers fields that are ALWAYS present:
//  * core applicant identity, and the declarations/signature that
//  * Submit should genuinely depend on.
//  *
//  * Extend REQUIRED_FIELDS_BY_STEP if more always-present fields need
//  * enforcing later — anything conditionally rendered should stay out
//  * of this list unless it's paired with the visibility check that
//  * shows it.
//  */

// export const REQUIRED_FIELDS_BY_STEP: Record<string, string[]> = {
//   'applicant-property': ['Applicant First Name', 'Applicant Last Name', 'Email Address'],
//   declarations: [
//     'declaration_0',
//     'declaration_1',
//     'declaration_2',
//     'declaration_3',
//     'declaration_4',
//     'Full Name of Signatory',
//     'Digital Signature',
//   ],
// }

// const FRIENDLY_LABELS: Record<string, string> = {
//   declaration_0: 'Declaration 1 (accuracy)',
//   declaration_1: 'Declaration 2 (ownership / authority)',
//   declaration_2: 'Declaration 3 (private rights)',
//   declaration_3: 'Declaration 4 (consent to publish)',
//   declaration_4: 'Declaration 5 (fees)',
//   'Digital Signature': 'Signature',
// }

// /** Returns friendly names of any required-and-missing fields for a step — empty array means the step is valid. */
// export function getMissingRequiredFields(stepId: string, formData: EligibilityFormValues): string[] {
//   const required = REQUIRED_FIELDS_BY_STEP[stepId]
//   if (!required) return []

//   return required
//     .filter(key => {
//       const value = formData[key]
//       if (Array.isArray(value)) return value.length === 0
//       return !value || !value.trim()
//     })
//     .map(key => FRIENDLY_LABELS[key] ?? key)
// }


import type { EligibilityFormValues } from '@/components/eligibility/types'

/**
 * eligibilityValidation.ts
 * ───────────────────────────
 * Deliberately narrow: most fields in this form are conditionally
 * shown (an entire address block disappears if "same as site
 * address" is Yes; HMO/tree/flood sections only render for certain
 * subservices — see eligibilityRelevance.ts). Requiring a field that
 * might not even be on screen would block Continue for the wrong
 * reason, so this only covers fields that are ALWAYS present:
 * core applicant identity, and the declarations/signature that
 * Submit should genuinely depend on.
 *
 * Extend REQUIRED_FIELDS_BY_STEP if more always-present fields need
 * enforcing later — anything conditionally rendered should stay out
 * of this list unless it's paired with the visibility check that
 * shows it.
 */

export const REQUIRED_FIELDS_BY_STEP: Record<string, string[]> = {
  'applicant-property': ['Applicant First Name', 'Applicant Last Name', 'Email Address', 'Phone Number'],
  declarations: [
    'declaration_0',
    'declaration_1',
    'declaration_2',
    'declaration_3',
    'declaration_4',
    'Full Name of Signatory',
    'Digital Signature',
  ],
}

const FRIENDLY_LABELS: Record<string, string> = {
  declaration_0: 'Declaration 1 (accuracy)',
  declaration_1: 'Declaration 2 (ownership / authority)',
  declaration_2: 'Declaration 3 (private rights)',
  declaration_3: 'Declaration 4 (consent to publish)',
  declaration_4: 'Declaration 5 (fees)',
  'Digital Signature': 'Signature',
}

/** Returns friendly names of any required-and-missing fields for a step — empty array means the step is valid. */
export function getMissingRequiredFields(stepId: string, formData: EligibilityFormValues): string[] {
  const required = REQUIRED_FIELDS_BY_STEP[stepId]
  if (!required) return []

  return required
    .filter(key => {
      const value = formData[key]
      if (Array.isArray(value)) return value.length === 0
      return !value || !value.trim()
    })
    .map(key => FRIENDLY_LABELS[key] ?? key)
}