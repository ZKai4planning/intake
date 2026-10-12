// export interface ServiceFeature {
//   title: string
//   description?: string
// }

// export interface Service {
//   id: string
//   title: string
//   shortTitle: string
//   subtitle: string
//   image: string
//   description: string
//   features: ServiceFeature[]
//   label: string
//   cta: string
//   /** Inactive services show as locked/"Currently Unavailable" and aren't clickable yet. */
//   status: 'active' | 'inactive'
// }

// /**
//  * Rough actor guess for a service pick with no other signal available
//  * yet (no chat/intent answers to go on) — just enough to route a
//  * fresh project to a sane starting workspace. Refined later by
//  * whatever the person actually fills in.
//  */
// export function inferActorForService(serviceId: string): 'homeowner' | 'landlord' {
//   return serviceId === 'service-07' ? 'landlord' : 'homeowner'
// }

// /**
//  * SERVICES
//  * ─────────
//  * Full service catalogue for the expandable services panel on the
//  * homepage. Each service drills into a set of features a person can
//  * pick, mirroring how the underlying planning-goal catalogue is
//  * organised, but grouped by audience rather than by individual goal.
//  */
// export const SERVICES: Service[] = [
//   {
//     id: 'service-01',
//     title: 'Residential: Homeowners & Personal Life Projects',
//     shortTitle: 'Residential: Homeowners & landlords',
//     subtitle: 'Homeowners & personal life projects',
//     image:
//       'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'Concierge-driven planning advice focused on balancing personal priorities with project outcomes — personalised guidance through household planning applications.',
//     features: [
//       {
//         title: 'Non Material Amendment',
//         description:
//           'As a homeowner with an approved plan, I want to make a small change — like moving a window or adjusting a roof pitch — so the design better suits my needs without re-applying from scratch.',
//       },
//       {
//         title: 'Advertisement Consent',
//         description:
//           'As a homeowner running a home-based business, I want to erect a small sign outside my property so that customers can find me.',
//       },
//       {
//         title: 'Works to Trees (TPO & Conservation)',
//         description:
//           'As a homeowner with a protected tree in my garden, I want to prune or remove dangerous branches so my family and property are safe.',
//       },
//       {
//         title: 'Lawful Development Certificate (LDC)',
//         description:
//           'As a homeowner, I want legal confirmation that my existing extension or outbuilding is lawful so I am protected from enforcement action.',
//       },
//       {
//         title: 'Certificate of Lawfulness (Listed Building)',
//         description:
//           'As the owner of a listed property, I want to ensure my proposed repairs — e.g. replacing rotten timber — do not require listed building consent.',
//       },
//       {
//         title: 'Permission in Principle (PiP)',
//         description:
//           'As a homeowner with a large garden plot, I want initial approval to build a small number of homes so I can decide whether to proceed before investing in detailed designs.',
//       },
//       {
//         title: 'Householder Planning Consent',
//         description:
//           'As a homeowner, I want to build a modest extension — a rear kitchen/dining room — so my family has more living space.',
//       },
//       {
//         title: 'Prior Approval',
//         description:
//           'As a homeowner planning a larger extension under permitted development, I want to submit a prior approval request so the council can check impacts before I start.',
//       },
//       {
//         title: 'Approval / Discharge of Conditions',
//         description:
//           'As a homeowner who has obtained planning permission, I want to discharge my conditions — materials or landscaping — so I can begin building.',
//       },
//       {
//         title: 'Full Planning Consent',
//         description:
//           'As a homeowner wanting to build a new dwelling or substantially remodel my property, I want to apply for full planning permission so I can carry out my development legally.',
//       },
//       {
//         title: 'Outline Planning Consent',
//         description:
//           'As a homeowner with land to develop, I want to test whether building multiple houses might be acceptable before producing detailed plans.',
//       },
//       {
//         title: 'Reserved Matters Application',
//         description:
//           'As a homeowner who has outline approval, I want to submit detailed designs for appearance, layout and landscaping so construction can proceed.',
//       },
//     ],
//     label: 'Homeowners, landlords, self-builders',
//     cta: 'Select & Apply',
//     status: 'active',
//   },
//   {
//     id: 'service-02',
//     title: 'Commercial: Property Development & Planning',
//     shortTitle: 'Commercial Property Development & Planning',
//     subtitle: 'Property development & planning',
//     image:
//       'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'Strategic guidance for medium- and large-scale commercial schemes, with planning and phasing support end to end.',
//     features: [
//       { title: 'Commercial planning strategy', description: 'Guidance on positioning a scheme for approval before you commit to a design brief.' },
//       { title: 'Medium & large-scale scheme support', description: 'Hands-on support through the full application lifecycle for bigger developments.' },
//       { title: 'Development phasing advice', description: 'Sequencing advice so multi-phase schemes clear planning without unnecessary delay.' },
//       { title: 'Planning risk & feasibility assessment', description: 'An early read on constraints and likely objections before you spend on design.' },
//       { title: 'End-to-end commercial planning guidance', description: 'A single point of contact from initial feasibility through to decision.' },
//     ],
//     label: 'Commercial property developers',
//     cta: 'Select & Apply',
//     status: 'inactive',
//   },
//   {
//     id: 'service-03',
//     title: 'Small Business Strategy & Operations Improvement',
//     shortTitle: 'Small Business Strategy & Operations Improvement',
//     subtitle: 'Business planning & operations',
//     image:
//       'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'Business planning and operations improvement, technology and workflow optimisation, and strategic roadmapping for SMEs.',
//     features: [
//       { title: 'Business planning & strategy', description: 'A clear plan that ties day-to-day operations to a growth target.' },
//       { title: 'Operational improvement analysis', description: 'A structured look at where time and budget are leaking from the business.' },
//       { title: 'Technology & workflow optimisation', description: 'Practical recommendations for tools and processes that remove bottlenecks.' },
//       { title: 'Strategic roadmapping', description: 'A prioritised roadmap the whole team can work from.' },
//       { title: 'Ongoing SME advisory support', description: 'Continued advisory access as the business scales.' },
//     ],
//     label: 'SMEs (non-development)',
//     cta: 'Select & Apply',
//     status: 'inactive',
//   },
//   {
//     id: 'service-04',
//     title: 'Consultant Production & Compliance Support',
//     shortTitle: 'Consultant Production & Compliance Support',
//     subtitle: 'Drawing production & compliance',
//     image:
//       'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'Scalable drawing production, regulatory compliance checks, and QA reviews for consultants and architects.',
//     features: [
//       { title: 'Scalable drawing production', description: 'Overflow drawing capacity when in-house resource is stretched.' },
//       { title: 'Regulatory compliance checks', description: 'A second set of eyes on compliance before submission.' },
//       { title: 'Quality assurance (QA) reviews', description: 'Structured QA passes on drawing packages before they go out.' },
//       { title: 'Architectural & technical support', description: 'Technical backup for the parts of a scheme that need specialist input.' },
//       { title: 'Flexible production capacity', description: 'Scale support up or down as project load changes.' },
//     ],
//     label: 'Planning consultants & architects',
//     cta: 'Select & Apply',
//     status: 'inactive',
//   },
//   {
//     id: 'service-05',
//     title: 'In-House Construction Delivery',
//     shortTitle: 'In-House Construction Delivery',
//     subtitle: 'Design-and-build, post-consent',
//     image:
//       'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'Design-and-build services post-consent, with integrated planning and construction management.',
//     features: [
//       { title: 'Post-consent design & build', description: 'A single team carrying the project from decision notice to completion.' },
//       { title: 'Integrated planning & construction', description: 'Planning conditions and build programme managed together, not separately.' },
//       { title: 'Construction management support', description: 'On-site coordination so the build stays on programme.' },
//       { title: 'Programme & delivery coordination', description: 'A realistic programme with the trades and deliveries coordinated around it.' },
//       { title: 'Single-point delivery responsibility', description: 'One point of accountability from start to finish.' },
//     ],
//     label: 'Clients with consented projects',
//     cta: 'Select & Apply',
//     status: 'inactive',
//   },
//   {
//     id: 'service-06',
//     title: 'Tailored Project Management & Consultancy Marketplace',
//     shortTitle: 'Tailored Project Management & Consultancy Marketplace',
//     subtitle: 'Consultancy marketplace',
//     image:
//       'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'A curated marketplace of vetted consultants offering project and planning-related services.',
//     features: [
//       { title: 'Curated consultant marketplace', description: 'Vetted specialists matched to your project type.' },
//       { title: 'Task-based consultancy services', description: 'Book exactly the piece of work you need, not a full retainer.' },
//       { title: 'Flexible project management support', description: 'Bring in project management help for as long as the project needs it.' },
//       { title: 'Vetted professional network', description: 'Every consultant on the marketplace is checked before listing.' },
//       { title: 'Cross-discipline expertise access', description: 'Planning, design, and delivery expertise under one roof.' },
//     ],
//     label: 'All client types',
//     cta: 'Select & Apply',
//     status: 'inactive',
//   },
//   {
//     id: 'service-07',
//     title: 'Property Licensing Services',
//     shortTitle: 'Licensing Your Property',
//     subtitle: 'Licensing your property',
//     image:
//       'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
//     description:
//       'We provide complete assistance for property licensing, including documentation, registration, guidance, and legal compliance.',
//     features: [
//       { title: 'HMO Licensing', description: 'As a landlord letting to multiple tenants, I want to confirm whether my property needs an HMO licence and get the application right first time.' },
//       { title: 'Selective Licensing', description: 'As a landlord in a designated selective licensing area, I want to register my property and meet the council\u2019s conditions.' },
//       { title: 'Additional Licensing', description: 'As a landlord with a smaller HMO in an additional licensing area, I want to understand whether I need a licence and how to apply.' },
//       { title: 'Licence Renewal & Compliance', description: 'As a landlord with an existing licence, I want help renewing it and staying compliant with any condition changes.' },
//       { title: 'Documentation & Registration Support', description: 'As a landlord, I want help pulling together gas safety, EPC, fire safety, and other documents a licence application needs.' },
//       { title: 'Legal Compliance Review', description: 'As a landlord, I want a check that my property meets current licensing and housing standards before I apply.' },
//     ],
//     label: 'Property licensing services',
//     cta: 'Get Started',
//     status: 'active',
//   },
// ]


export interface ServiceFeature {
  title: string
  description?: string
}

export interface Service {
  id: string
  title: string
  shortTitle: string
  subtitle: string
  image: string
  description: string
  features: ServiceFeature[]
  label: string
  cta: string
  /** Inactive services show as locked/"Currently Unavailable" and aren't clickable yet. */
  status: 'active' | 'inactive'
}

/**
 * Rough actor guess for a service pick with no other signal available
 * yet (no chat/intent answers to go on) — just enough to route a
 * fresh project to a sane starting workspace. Refined later by
 * whatever the person actually fills in.
 */
export function inferActorForService(serviceId: string): 'homeowner' | 'landlord' {
  return serviceId === 'service-07' ? 'landlord' : 'homeowner'
}

/**
 * SERVICES
 * ─────────
 * Full service catalogue for the expandable services panel on the
 * homepage. Each service drills into a set of features a person can
 * pick, mirroring how the underlying planning-goal catalogue is
 * organised, but grouped by audience rather than by individual goal.
 */
export const SERVICES: Service[] = [
  {
    id: 'service-01',
    title: 'Residential: Homeowners & Personal Life Projects',
    shortTitle: 'Residential: Homeowners & landlords',
    subtitle: 'Homeowners & personal life projects',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description:
      'Concierge-driven planning advice focused on balancing personal priorities with project outcomes — personalised guidance through household planning applications.',
    features: [
      {
        title: 'Non Material Amendment',
        description:
          'As a homeowner with an approved plan, I want to make a small change — like moving a window or adjusting a roof pitch — so the design better suits my needs without re-applying from scratch.',
      },
      {
        title: 'Advertisement Consent',
        description:
          'As a homeowner running a home-based business, I want to erect a small sign outside my property so that customers can find me.',
      },
      {
        title: 'Works to Trees (TPO & Conservation)',
        description:
          'As a homeowner with a protected tree in my garden, I want to prune or remove dangerous branches so my family and property are safe.',
      },
      {
        title: 'Lawful Development Certificate (LDC)',
        description:
          'As a homeowner, I want legal confirmation that my existing extension or outbuilding is lawful so I am protected from enforcement action.',
      },
      {
        title: 'Certificate of Lawfulness (Listed Building)',
        description:
          'As the owner of a listed property, I want to ensure my proposed repairs — e.g. replacing rotten timber — do not require listed building consent.',
      },
      {
        title: 'Permission in Principle (PiP)',
        description:
          'As a homeowner with a large garden plot, I want initial approval to build a small number of homes so I can decide whether to proceed before investing in detailed designs.',
      },
      {
        title: 'Householder Planning Consent',
        description:
          'As a homeowner, I want to build a modest extension — a rear kitchen/dining room — so my family has more living space.',
      },
      {
        title: 'Prior Approval',
        description:
          'As a homeowner planning a larger extension under permitted development, I want to submit a prior approval request so the council can check impacts before I start.',
      },
      {
        title: 'Approval / Discharge of Conditions',
        description:
          'As a homeowner who has obtained planning permission, I want to discharge my conditions — materials or landscaping — so I can begin building.',
      },
      {
        title: 'Full Planning Consent',
        description:
          'As a homeowner wanting to build a new dwelling or substantially remodel my property, I want to apply for full planning permission so I can carry out my development legally.',
      },
      {
        title: 'Outline Planning Consent',
        description:
          'As a homeowner with land to develop, I want to test whether building multiple houses might be acceptable before producing detailed plans.',
      },
      {
        title: 'Reserved Matters Application',
        description:
          'As a homeowner who has outline approval, I want to submit detailed designs for appearance, layout and landscaping so construction can proceed.',
      },
    ],
    label: 'Homeowners, landlords, self-builders',
    cta: 'Select & Apply',
    status: 'active',
  },
   {
    id: 'service-05',
    title: 'In-House Construction Delivery',
    shortTitle: 'In-House Construction Delivery',
    subtitle: 'Design-and-build, post-consent',
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
    description:
      'Design-and-build services post-consent, with integrated planning and construction management.',
    features: [
      { title: 'Post-consent design & build', description: 'A single team carrying the project from decision notice to completion.' },
      { title: 'Integrated planning & construction', description: 'Planning conditions and build programme managed together, not separately.' },
      { title: 'Construction management support', description: 'On-site coordination so the build stays on programme.' },
      { title: 'Programme & delivery coordination', description: 'A realistic programme with the trades and deliveries coordinated around it.' },
      { title: 'Single-point delivery responsibility', description: 'One point of accountability from start to finish.' },
    ],
    label: 'Clients with consented projects',
    cta: 'Select & Apply',
    status: 'active',
  },
  {
    id: 'service-07',
    title: 'Property Licensing Services',
    shortTitle: 'Licensing Your Property',
    subtitle: 'Licensing your property',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    description:
      'We provide complete assistance for property licensing, including documentation, registration, guidance, and legal compliance.',
    features: [
      { title: 'HMO Licensing', description: 'As a landlord letting to multiple tenants, I want to confirm whether my property needs an HMO licence and get the application right first time.' },
      { title: 'Selective Licensing', description: 'As a landlord in a designated selective licensing area, I want to register my property and meet the council\u2019s conditions.' },
      { title: 'Additional Licensing', description: 'As a landlord with a smaller HMO in an additional licensing area, I want to understand whether I need a licence and how to apply.' },
      { title: 'Licence Renewal & Compliance', description: 'As a landlord with an existing licence, I want help renewing it and staying compliant with any condition changes.' },
      { title: 'Documentation & Registration Support', description: 'As a landlord, I want help pulling together gas safety, EPC, fire safety, and other documents a licence application needs.' },
      { title: 'Legal Compliance Review', description: 'As a landlord, I want a check that my property meets current licensing and housing standards before I apply.' },
    ],
    label: 'Property licensing services',
    cta: 'Get Started',
    status: 'active',
  },
  {
    id: 'service-03',
    title: 'Small Business Strategy & Operations Improvement',
    shortTitle: 'Small Business Strategy & Operations Improvement',
    subtitle: 'Business planning & operations',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    description:
      'Business planning and operations improvement, technology and workflow optimisation, and strategic roadmapping for SMEs.',
    features: [
      { title: 'Business planning & strategy', description: 'A clear plan that ties day-to-day operations to a growth target.' },
      { title: 'Operational improvement analysis', description: 'A structured look at where time and budget are leaking from the business.' },
      { title: 'Technology & workflow optimisation', description: 'Practical recommendations for tools and processes that remove bottlenecks.' },
      { title: 'Strategic roadmapping', description: 'A prioritised roadmap the whole team can work from.' },
      { title: 'Ongoing SME advisory support', description: 'Continued advisory access as the business scales.' },
    ],
    label: 'SMEs (non-development)',
    cta: 'Select & Apply',
    status: 'active',
  },
  {
    id: 'service-04',
    title: 'Planning Consultant  & Compliance Support',
    shortTitle: 'Planning Consultant & Compliance Support',
    subtitle: 'Drawing production & compliance',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    description:
      'Scalable drawing production, regulatory compliance checks, and QA reviews for consultants and architects.',
    features: [
      { title: 'Scalable drawing production', description: 'Overflow drawing capacity when in-house resource is stretched.' },
      { title: 'Regulatory compliance checks', description: 'A second set of eyes on compliance before submission.' },
      { title: 'Quality assurance (QA) reviews', description: 'Structured QA passes on drawing packages before they go out.' },
      { title: 'Architectural & technical support', description: 'Technical backup for the parts of a scheme that need specialist input.' },
      { title: 'Flexible production capacity', description: 'Scale support up or down as project load changes.' },
    ],
    label: 'Planning consultants & architects',
    cta: 'Select & Apply',
    status: 'active',
  },
 
]
