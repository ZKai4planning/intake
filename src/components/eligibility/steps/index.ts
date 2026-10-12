import { ApplicantPropertyStepContent } from './ApplicantPropertyStepContent'
import { SiteConstraintsStepContent } from './SiteConstraintsStepContent'
import { WorksMaterialsStepContent } from './WorksMaterialsStepContent'
import { UtilitiesConsentsStepContent } from './UtilitiesConsentsStepContent'
import { DeclarationsStepContent } from './DeclarationsStepContent'
import type { EligibilityStepContentProps } from '../types'

export interface EligibilityStep {
  id: string
  title: string
  description: string
  Component: React.ComponentType<EligibilityStepContentProps>
}

export const ELIGIBILITY_STEPS: EligibilityStep[] = [
  {
    id: 'applicant-property',
    title: 'Applicant & Property',
    description: 'Who you are, the site address, and ownership status.',
    Component: ApplicantPropertyStepContent,
  },
  {
    id: 'site-constraints',
    title: 'Site Constraints',
    description: 'Heritage, access, trees and flood risk.',
    Component: SiteConstraintsStepContent,
  },
  {
    id: 'works-materials',
    title: 'Works & Materials',
    description: 'Dimensions, materials, and supporting drawings.',
    Component: WorksMaterialsStepContent,
  },
  {
    id: 'utilities-consents',
    title: 'Utilities & Consents',
    description: 'Safety compliance, utilities, and additional consents.',
    Component: UtilitiesConsentsStepContent,
  },
  {
    id: 'declarations',
    title: 'Declarations',
    description: 'Review, declarations, and signature.',
    Component: DeclarationsStepContent,
  },
]
