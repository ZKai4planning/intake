/**
 * cookie-consent.types.ts
 * ────────────────────────
 * Shared types for the cookie consent system.
 */

export type ConsentCategory = 'necessary' | 'preferences' | 'statistics' | 'marketing'

export interface CategoryMeta {
  id:          ConsentCategory
  label:       string
  count:       number
  description: string
  required:    boolean
}

export interface ConsentState {
  necessary:   boolean   // always true, read-only
  preferences: boolean
  statistics:  boolean
  marketing:   boolean
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id:          'necessary',
    label:       'Strictly necessary',
    count:       46,
    description: 'Strictly necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.',
    required:    true,
  },
  {
    id:          'preferences',
    label:       'Preferences',
    count:       22,
    description: 'Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.',
    required:    false,
  },
  {
    id:          'statistics',
    label:       'Statistics',
    count:       47,
    description: 'Statistic cookies help website owners understand how visitors interact with websites by collecting and reporting information anonymously.',
    required:    false,
  },
  {
    id:          'marketing',
    label:       'Marketing',
    count:       31,
    description: 'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and therefore more valuable for publishers and third-party advertisers.',
    required:    false,
  },
]

export const DEFAULT_CONSENT: ConsentState = {
  necessary:   true,
  preferences: false,
  statistics:  false,
  marketing:   false,
}

export const FULL_CONSENT: ConsentState = {
  necessary:   true,
  preferences: true,
  statistics:  true,
  marketing:   true,
}