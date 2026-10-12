// import type { IntentQuestion } from '@/types/intent'

// /**
//  * INTENT_QUESTIONS
//  * ──────────────────
//  * Sequence (2–3 questions, decided at runtime by resolveActor.getNextQuestionId):
//  *
//  *  1. "goal"          — always asked first. What are you trying to do with
//  *                        the property? Casts a WEAK/medium signal per actor
//  *                        (a goal alone rarely proves who someone is — an
//  *                        extension could be a homeowner's or a landlord's).
//  *
//  *  2. "relationship"  — always asked second. Your relationship to the
//  *                        property. This is the deciding signal in almost
//  *                        every case (e.g. "I live here" → homeowner,
//  *                        "I rent it out" → landlord).
//  *
//  *  3. "role"          — only asked when relationship = "client_work" (i.e.
//  *                        the person is acting on someone else's behalf) or
//  *                        when scores are still ambiguous after Q2. Splits
//  *                        consultant / architect / business agency.
//  *
//  * Every option's `signals` map is additive across the answered questions —
//  * see resolveActor.ts for how scores are combined and when confidence is
//  * high enough to stop asking.
//  */
// export const INTENT_QUESTIONS: IntentQuestion[] = [
//   {
//     id: 'goal',
//     prompt: 'What are you trying to do with the property?',
//     helper: 'This helps us ask the right follow-up questions — nothing here is final.',
//     options: [
//       {
//         value: 'improve',
//         label: 'Build, extend, or alter it',
//         emoji: '🏠',
//         signals: { homeowner: 0.5, landlord: 0.35, developer: 0.15 },
//       },
//       {
//         value: 'hmo',
//         label: 'Rent it out / manage tenants (HMO, licensing)',
//         emoji: '🔑',
//         signals: { landlord: 0.85, business: 0.35 },
//       },
//       {
//         value: 'develop',
//         label: 'Develop or check the potential of a site',
//         emoji: '🏗️',
//         signals: { developer: 0.85, business: 0.2 },
//       },
//       {
//         value: 'refusal',
//         label: 'Respond to a refusal or appeal',
//         emoji: '📋',
//         signals: { homeowner: 0.2, developer: 0.4, consultant: 0.3 },
//       },
//       {
//         value: 'client_check',
//         label: "I'm checking this for a client, not myself",
//         emoji: '💼',
//         signals: { consultant: 0.6, architect: 0.5, business: 0.3 },
//       },
//       {
//         value: 'unsure',
//         label: "Not sure yet — I'm just exploring",
//         emoji: '🔍',
//         signals: { homeowner: 0.3, landlord: 0.2, developer: 0.2 },
//       },
//     ],
//   },
//   {
//     id: 'relationship',
//     prompt: 'Which best describes your relationship to this property?',
//     helper: 'This is what actually determines the right questions and tools for you.',
//     options: [
//       {
//         value: 'live_in',
//         label: 'I own it and live here',
//         emoji: '🏠',
//         signals: { homeowner: 1.2 },
//       },
//       {
//         value: 'rent_out',
//         label: 'I own it and rent it out to tenants',
//         emoji: '🔑',
//         signals: { landlord: 1.2 },
//       },
//       {
//         value: 'developing',
//         label: "I'm developing it or plan to buy/build on it",
//         emoji: '🏗️',
//         signals: { developer: 1.2 },
//       },
//       {
//         value: 'client_work',
//         label: "I'm working on it for a client, not myself",
//         emoji: '💼',
//         signals: { consultant: 0.5, architect: 0.4, business: 0.3 },
//       },
//       {
//         value: 'multi_property',
//         label: 'This is part of a business managing multiple properties',
//         emoji: '🏢',
//         signals: { business: 1.2 },
//       },
//     ],
//   },
//   {
//     id: 'role',
//     prompt: 'Which best describes your role?',
//     helper: "Since you're working on this for someone else, we'll tailor the tools accordingly.",
//     options: [
//       {
//         value: 'planning_consultant',
//         label: "I'm a planning consultant or agent",
//         emoji: '📐',
//         signals: { consultant: 1 },
//       },
//       {
//         value: 'architect_designer',
//         label: "I'm an architect or designer",
//         emoji: '✏️',
//         signals: { architect: 1 },
//       },
//       {
//         value: 'agency_business',
//         label: 'I represent an agency, installer, or company',
//         emoji: '💼',
//         signals: { business: 1 },
//       },
//     ],
//   },
// ]

// export function getIntentQuestion(id: string): IntentQuestion | undefined {
//   return INTENT_QUESTIONS.find(q => q.id === id)
// }

// import type { IntentQuestion } from '@/types/intent'

// /**
//  * INTENT_QUESTIONS
//  * ──────────────────
//  * Sequence (2–3 questions, decided at runtime by resolveActor.getNextQuestionId):
//  *
//  *  1. "goal"          — always asked first. What are you trying to do with
//  *                        the property? Casts a WEAK/medium signal per actor
//  *                        (a goal alone rarely proves who someone is — an
//  *                        extension could be a homeowner's or a landlord's).
//  *
//  *  2. "relationship"  — always asked second. Your relationship to the
//  *                        property. This is the deciding signal in almost
//  *                        every case (e.g. "I live here" → homeowner,
//  *                        "I rent it out" → landlord).
//  *
//  *  3. "role"          — only asked when relationship = "client_work" (i.e.
//  *                        the person is acting on someone else's behalf), or
//  *                        the goal itself was "checking this for a client".
//  *                        Splits consultant / architect / business agency.
//  *                        It is intentionally NEVER triggered by a generic
//  *                        "still ambiguous" fallback — its options are all
//  *                        professional, so forcing it on someone who already
//  *                        answered an ownership relationship (live_in /
//  *                        rent_out / developing / multi_property) would have
//  *                        no correct answer and could corrupt their result.
//  *
//  * Every option's `signals` map is additive across the answered questions —
//  * see resolveActor.ts for how scores are combined and when confidence is
//  * high enough to stop asking.
//  */
// export const INTENT_QUESTIONS: IntentQuestion[] = [
//   {
//     id: 'goal',
//     prompt: 'What are you trying to do with the property?',
//     helper: 'This helps us ask the right follow-up questions — nothing here is final.',
//     options: [
//       {
//         value: 'improve',
//         label: 'Build, extend, or alter it',
//         emoji: '🏠',
//         signals: { homeowner: 0.5, landlord: 0.35, developer: 0.15 },
//       },
//       {
//         value: 'hmo',
//         label: 'Rent it out / manage tenants (HMO, licensing)',
//         emoji: '🔑',
//         signals: { landlord: 0.85, business: 0.35 },
//       },
//       {
//         value: 'develop',
//         label: 'Develop or check the potential of a site',
//         emoji: '🏗️',
//         signals: { developer: 0.85, business: 0.2 },
//       },
//       {
//         value: 'refusal',
//         label: 'Respond to a refusal or appeal',
//         emoji: '📋',
//         signals: { homeowner: 0.2, developer: 0.4, consultant: 0.3 },
//       },
//       {
//         value: 'client_check',
//         label: "I'm checking this for a client, not myself",
//         emoji: '💼',
//         signals: { consultant: 0.6, architect: 0.5, business: 0.3 },
//       },
//       {
//         value: 'unsure',
//         label: "Not sure yet — I'm just exploring",
//         emoji: '🔍',
//         signals: { homeowner: 0.3, landlord: 0.2, developer: 0.2 },
//       },
//     ],
//   },
//   {
//     id: 'relationship',
//     prompt: 'Which best describes your relationship to this property?',
//     helper: 'This is what actually determines the right questions and tools for you.',
//     options: [
//       {
//         value: 'live_in',
//         label: 'I own it and live here',
//         emoji: '🏠',
//         signals: { homeowner: 1.2 },
//       },
//       {
//         value: 'rent_out',
//         label: 'I own it and rent it out to tenants',
//         emoji: '🔑',
//         signals: { landlord: 1.2 },
//       },
//       {
//         value: 'developing',
//         label: "I'm developing it or plan to buy/build on it",
//         emoji: '🏗️',
//         signals: { developer: 1.2 },
//       },
//       {
//         value: 'client_work',
//         label: "I'm working on it for a client, not myself",
//         emoji: '💼',
//         signals: { consultant: 0.5, architect: 0.4, business: 0.3 },
//       },
//       {
//         value: 'multi_property',
//         label: 'This is part of a business managing multiple properties',
//         emoji: '🏢',
//         signals: { business: 1.2 },
//       },
//     ],
//   },
//   {
//     id: 'role',
//     prompt: 'Which best describes your role?',
//     helper: "Since you're working on this for someone else, we'll tailor the tools accordingly.",
//     options: [
//       {
//         value: 'planning_consultant',
//         label: "I'm a planning consultant or agent",
//         emoji: '📐',
//         signals: { consultant: 1 },
//       },
//       {
//         value: 'architect_designer',
//         label: "I'm an architect or designer",
//         emoji: '✏️',
//         signals: { architect: 1 },
//       },
//       {
//         value: 'agency_business',
//         label: 'I represent an agency, installer, or company',
//         emoji: '💼',
//         signals: { business: 1 },
//       },
//       {
//         value: 'not_listed',
//         label: "None of these — it's actually my own property",
//         emoji: '↩️',
//         // Deliberately no signals: this exists purely as an escape hatch
//         // so ending up on this question (e.g. via a misclick on
//         // "relationship") can never force a professional label onto
//         // someone who owns the property themselves. Picking it just
//         // finalizes using whatever the goal/relationship answers
//         // already resolved to, instead of skewing the score.
//         signals: {},
//       },
//     ],
//   },
// ]

// export function getIntentQuestion(id: string): IntentQuestion | undefined {
//   return INTENT_QUESTIONS.find(q => q.id === id)
// }


// import type { IntentQuestion } from '@/types/intent'

// /**
//  * INTENT_QUESTIONS
//  * ──────────────────
//  * Sequence (2–3 questions, decided at runtime by resolveActor.getNextQuestionId):
//  *
//  *  1. "goal"          — always asked first. What are you trying to do with
//  *                        the property? Casts a WEAK/medium signal per actor
//  *                        (a goal alone rarely proves who someone is — an
//  *                        extension could be a homeowner's or a landlord's).
//  *
//  *  2. "relationship"  — always asked second. Your relationship to the
//  *                        property. This is the deciding signal in almost
//  *                        every case (e.g. "I live here" → homeowner,
//  *                        "I rent it out" → landlord).
//  *
//  *  3. "role"          — only asked when relationship = "client_work" (i.e.
//  *                        the person is acting on someone else's behalf) or
//  *                        when scores are still ambiguous after Q2. Splits
//  *                        consultant / architect / business agency.
//  *
//  * Every option's `signals` map is additive across the answered questions —
//  * see resolveActor.ts for how scores are combined and when confidence is
//  * high enough to stop asking.
//  */
// export const INTENT_QUESTIONS: IntentQuestion[] = [
//   {
//     id: 'goal',
//     prompt: 'What are you trying to do with the property?',
//     helper: 'This helps us ask the right follow-up questions — nothing here is final.',
//     options: [
//       {
//         value: 'improve',
//         label: 'Build, extend, or alter it',
//         emoji: '🏠',
//         signals: { homeowner: 0.5, landlord: 0.35, developer: 0.15 },
//       },
//       {
//         value: 'hmo',
//         label: 'Rent it out / manage tenants (HMO, licensing)',
//         emoji: '🔑',
//         signals: { landlord: 0.85, business: 0.35 },
//       },
//       {
//         value: 'develop',
//         label: 'Develop or check the potential of a site',
//         emoji: '🏗️',
//         signals: { developer: 0.85, business: 0.2 },
//       },
//       {
//         value: 'refusal',
//         label: 'Respond to a refusal or appeal',
//         emoji: '📋',
//         signals: { homeowner: 0.2, developer: 0.4, consultant: 0.3 },
//       },
//       {
//         value: 'client_check',
//         label: "I'm checking this for a client, not myself",
//         emoji: '💼',
//         signals: { consultant: 0.6, architect: 0.5, business: 0.3 },
//       },
//       {
//         value: 'unsure',
//         label: "Not sure yet — I'm just exploring",
//         emoji: '🔍',
//         signals: { homeowner: 0.3, landlord: 0.2, developer: 0.2 },
//       },
//     ],
//   },
//   {
//     id: 'relationship',
//     prompt: 'Which best describes your relationship to this property?',
//     helper: 'This is what actually determines the right questions and tools for you.',
//     options: [
//       {
//         value: 'live_in',
//         label: 'I own it and live here',
//         emoji: '🏠',
//         signals: { homeowner: 1.2 },
//       },
//       {
//         value: 'rent_out',
//         label: 'I own it and rent it out to tenants',
//         emoji: '🔑',
//         signals: { landlord: 1.2 },
//       },
//       {
//         value: 'developing',
//         label: "I'm developing it or plan to buy/build on it",
//         emoji: '🏗️',
//         signals: { developer: 1.2 },
//       },
//       {
//         value: 'client_work',
//         label: "I'm working on it for a client, not myself",
//         emoji: '💼',
//         signals: { consultant: 0.5, architect: 0.4, business: 0.3 },
//       },
//       {
//         value: 'multi_property',
//         label: 'This is part of a business managing multiple properties',
//         emoji: '🏢',
//         signals: { business: 1.2 },
//       },
//     ],
//   },
//   {
//     id: 'role',
//     prompt: 'Which best describes your role?',
//     helper: "Since you're working on this for someone else, we'll tailor the tools accordingly.",
//     options: [
//       {
//         value: 'planning_consultant',
//         label: "I'm a planning consultant or agent",
//         emoji: '📐',
//         signals: { consultant: 1 },
//       },
//       {
//         value: 'architect_designer',
//         label: "I'm an architect or designer",
//         emoji: '✏️',
//         signals: { architect: 1 },
//       },
//       {
//         value: 'agency_business',
//         label: 'I represent an agency, installer, or company',
//         emoji: '💼',
//         signals: { business: 1 },
//       },
//     ],
//   },
// ]

// export function getIntentQuestion(id: string): IntentQuestion | undefined {
//   return INTENT_QUESTIONS.find(q => q.id === id)
// }

import type { IntentQuestion } from '@/types/intent'

/**
 * INTENT_QUESTIONS
 * ──────────────────
 * Sequence (2–3 questions, decided at runtime by resolveActor.getNextQuestionId):
 *
 *  1. "goal"          — always asked first. What are you trying to do with
 *                        the property? Casts a WEAK/medium signal per actor
 *                        (a goal alone rarely proves who someone is — an
 *                        extension could be a homeowner's or a landlord's).
 *
 *  2. "relationship"  — always asked second. Your relationship to the
 *                        property. This is the deciding signal in almost
 *                        every case (e.g. "I live here" → homeowner,
 *                        "I rent it out" → landlord).
 *
 *  3. "role"          — only asked when relationship = "client_work" (i.e.
 *                        the person is acting on someone else's behalf), or
 *                        the goal itself was "checking this for a client".
 *                        Splits consultant / architect / business agency.
 *                        It is intentionally NEVER triggered by a generic
 *                        "still ambiguous" fallback — its options are all
 *                        professional, so forcing it on someone who already
 *                        answered an ownership relationship (live_in /
 *                        rent_out / developing / multi_property) would have
 *                        no correct answer and could corrupt their result.
 *
 *  4. "subrole"       — only asked when businessSubRoleNeeded() says so
 *                        (role = "agency_business" OR the resolved actor
 *                        is Business — see resolveActor.ts). Pure metadata:
 *                        every option casts NO actor signal, since by this
 *                        point the actor is already decided — it just tells
 *                        the Business workspace which detailed-question
 *                        module (Q-004) to load first.
 *
 * Every option's `signals` map is additive across the answered questions —
 * see resolveActor.ts for how scores are combined and when confidence is
 * high enough to stop asking.
 */
export const INTENT_QUESTIONS: IntentQuestion[] = [
  {
    id: 'goal',
    prompt: 'What are you trying to do with the property?',
    helper: 'This helps us ask the right follow-up questions — nothing here is final.',
    options: [
      {
        value: 'improve',
        label: 'Build, extend, or alter it',
        emoji: '🏠',
        signals: { homeowner: 0.5, landlord: 0.35, developer: 0.15 },
      },
      {
        value: 'hmo',
        label: 'Rent it out / manage tenants (HMO, licensing)',
        emoji: '🔑',
        signals: { landlord: 0.85, business: 0.35 },
      },
      {
        value: 'develop',
        label: 'Develop or check the potential of a site',
        emoji: '🏗️',
        signals: { developer: 0.85, business: 0.2 },
      },
      {
        value: 'refusal',
        label: 'Respond to a refusal or appeal',
        emoji: '📋',
        signals: { homeowner: 0.2, developer: 0.4, consultant: 0.3 },
      },
      {
        value: 'client_check',
        label: "I'm checking this for a client, not myself",
        emoji: '💼',
        signals: { consultant: 0.6, architect: 0.5, business: 0.3 },
      },
      {
        value: 'unsure',
        label: "Not sure yet — I'm just exploring",
        emoji: '🔍',
        signals: { homeowner: 0.3, landlord: 0.2, developer: 0.2 },
      },
    ],
  },
  {
    id: 'relationship',
    prompt: 'Which best describes your relationship to this property?',
    helper: 'This is what actually determines the right questions and tools for you.',
    options: [
      {
        value: 'live_in',
        label: 'I own it and live here',
        emoji: '🏠',
        signals: { homeowner: 1.2 },
      },
      {
        value: 'rent_out',
        label: 'I own it and rent it out to tenants',
        emoji: '🔑',
        signals: { landlord: 1.2 },
      },
      {
        value: 'developing',
        label: "I'm developing it or plan to buy/build on it",
        emoji: '🏗️',
        signals: { developer: 1.2 },
      },
      {
        value: 'client_work',
        label: "I'm working on it for a client, not myself",
        emoji: '💼',
        signals: { consultant: 0.5, architect: 0.4, business: 0.3 },
      },
      {
        value: 'multi_property',
        label: 'This is part of a business managing multiple properties',
        emoji: '🏢',
        signals: { business: 1.2 },
      },
    ],
  },
  {
    id: 'role',
    prompt: 'Which best describes your role?',
    helper: "Since you're working on this for someone else, we'll tailor the tools accordingly.",
    options: [
      {
        value: 'planning_consultant',
        label: "I'm a planning consultant or agent",
        emoji: '📐',
        signals: { consultant: 1 },
      },
      {
        value: 'architect_designer',
        label: "I'm an architect or designer",
        emoji: '✏️',
        signals: { architect: 1 },
      },
      {
        value: 'agency_business',
        label: 'I represent an agency, installer, or company',
        emoji: '💼',
        signals: { business: 1 },
      },
      {
        value: 'not_listed',
        label: "None of these — it's actually my own property",
        emoji: '↩️',
        // Deliberately no signals: this exists purely as an escape hatch
        // so ending up on this question (e.g. via a misclick on
        // "relationship") can never force a professional label onto
        // someone who owns the property themselves. Picking it just
        // finalizes using whatever the goal/relationship answers
        // already resolved to, instead of skewing the score.
        signals: {},
      },
    ],
  },
  {
    id: 'subrole',
    prompt: 'What type of business is it?',
    helper: "We'll tailor which checks and documents show up first.",
    options: [
      {
        value: 'estate_letting_agency',
        label: 'Estate or letting agency',
        emoji: '🏘️',
        signals: {},
      },
      {
        value: 'construction_contractor',
        label: 'Construction or contracting firm',
        emoji: '👷',
        signals: {},
      },
      {
        value: 'installer_tradesperson',
        label: 'Installer or tradesperson (e.g. windows, HMO fit-out)',
        emoji: '🔧',
        signals: {},
      },
      {
        value: 'surveying_planning_firm',
        label: 'Surveying or planning consultancy',
        emoji: '📏',
        signals: {},
      },
      {
        value: 'property_investment_firm',
        label: 'Property investment or portfolio management',
        emoji: '📈',
        signals: {},
      },
      {
        value: 'other_business',
        label: 'Something else',
        emoji: '➕',
        signals: {},
      },
    ],
  },
]

export function getIntentQuestion(id: string): IntentQuestion | undefined {
  return INTENT_QUESTIONS.find(q => q.id === id)
}