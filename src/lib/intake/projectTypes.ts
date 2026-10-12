/**
 * projectTypes.ts
 * ─────────────────
 * Data behind cards 4 ("What are you planning?") and 5 ("Tell us more").
 *
 * Card 5 is data-driven: the person's category (+ the "type of work" chip
 * they pick inside card 5) selects a QuestionSet, so the same renderer asks
 * the right questions for a rear extension, a loft conversion, an
 * outbuilding, an HMO conversion, and so on. To add or change questions
 * edit the sets below — no component changes needed.
 *
 * Answer formats (all stored as strings in IntakeMore.answers):
 *   single / select / yesno → the option value ('yes' | 'no' | 'unsure' …)
 *   number                  → "4.5", or "unknown" when "I don't know yet"
 *   dimensions              → "4.0x3.0"  (length x width, metres)
 *   text / textarea         → the text
 */

export type CategoryId =
  | 'extend'
  | 'convert'
  | 'build'
  | 'use'
  | 'exterior'
  | 'access'
  | 'trees'
  | 'existing'
  | 'unsure'

export type CategoryIcon =
  | 'expand'
  | 'layers'
  | 'hammer'
  | 'repeat'
  | 'door'
  | 'car'
  | 'tree'
  | 'history'
  | 'help'

export interface Subtype {
  id: string
  label: string
}

export interface Category {
  id: CategoryId
  label: string
  /** Small grey line under the label, e.g. "(windows, doors, etc.)". */
  note?: string
  icon: CategoryIcon
  /**
   * Optional photo for the tile, e.g. '/intake/extend.jpg' (put files in
   * /public/intake). Falls back to the icon tile when not set.
   */
  image?: string
  /** Heading for the "type of work" chips on card 5. */
  subtypeLabel?: string
  subtypes: Subtype[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'extend',
    image: '/intake/extend.jpg',
    label: 'Extend a property',
    icon: 'expand',
    subtypeLabel: 'What are you extending?',
    subtypes: [
      { id: 'rear', label: 'Rear extension' },
      { id: 'side', label: 'Side extension' },
      { id: 'wrap', label: 'Wraparound extension' },
      { id: 'porch', label: 'Front porch' },
      { id: 'storey', label: 'Extra storey' },
    ],
  },
  {
    id: 'convert',
    image: '/intake/convert.jpg',
    label: 'Convert or alter part of a property',
    icon: 'layers',
    subtypeLabel: 'What are you converting?',
    subtypes: [
      { id: 'loft', label: 'Loft conversion' },
      { id: 'garage', label: 'Garage conversion' },
      { id: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'build',
    image: '/intake/build.jpg',
    label: 'Build something new',
    icon: 'hammer',
    subtypeLabel: 'What are you building?',
    subtypes: [
      { id: 'outbuilding', label: 'Outbuilding / garden room' },
      { id: 'dwelling', label: 'New home' },
      { id: 'garage', label: 'Garage or carport' },
    ],
  },
  {
    id: 'use',
    image: '/intake/use.jpg',
    label: 'Change how the property is used',
    icon: 'repeat',
    subtypeLabel: 'What will it change to?',
    subtypes: [
      { id: 'hmo', label: 'HMO (house in multiple occupation)' },
      { id: 'flats', label: 'Split into flats' },
      { id: 'commercial', label: 'Commercial to residential' },
      { id: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'exterior',
    image: '/intake/exterior.jpg',
    label: 'Alter the exterior',
    note: '(windows, doors, etc.)',
    icon: 'door',
    subtypeLabel: 'What are you altering?',
    subtypes: [
      { id: 'windows', label: 'Windows or doors' },
      { id: 'roof', label: 'Re-roofing' },
      { id: 'walls', label: 'Cladding, render or painting' },
      { id: 'solar', label: 'Solar panels' },
      { id: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'access',
    image: '/intake/access.jpg',
    label: 'Access, parking or boundary works',
    icon: 'car',
    subtypeLabel: 'What works are you planning?',
    subtypes: [
      { id: 'driveway', label: 'Driveway / hardstanding' },
      { id: 'kerb', label: 'Dropped kerb / new access' },
      { id: 'fence', label: 'Fence, wall or gate' },
      { id: 'ev', label: 'EV charge point' },
    ],
  },
  {
    id: 'trees',
    image: '/intake/trees.jpg',
    label: 'Works to trees or landscape',
    icon: 'tree',
    subtypeLabel: 'What kind of work?',
    subtypes: [
      { id: 'works', label: 'Tree pruning or removal' },
      { id: 'landscape', label: 'Landscaping, levels or decking' },
      { id: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'existing',
    image: '/intake/existing.jpg',
    label: 'Something already built or changed',
    icon: 'history',
    subtypeLabel: 'What was built or changed?',
    subtypes: [
      { id: 'extension', label: 'Extension' },
      { id: 'outbuilding', label: 'Outbuilding' },
      { id: 'roof', label: 'Loft or roof work' },
      { id: 'use', label: 'Change of use' },
      { id: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'unsure',
    label: "I'm not sure",
    note: '(please describe)',
    icon: 'help',
    subtypes: [],
  },
]

export function getCategory(id: CategoryId | null | undefined): Category | null {
  return CATEGORIES.find(c => c.id === id) ?? null
}

export function getSubtype(categoryId: CategoryId | null | undefined, subtypeId: string | null | undefined): Subtype | null {
  return getCategory(categoryId)?.subtypes.find(s => s.id === subtypeId) ?? null
}

// ── Questions ─────────────────────────────────────────────────────────

export type Answers = Record<string, string>

export type QuestionType = 'single' | 'yesno' | 'number' | 'dimensions' | 'select' | 'text' | 'textarea'

export interface Option {
  value: string
  label: string
}

export interface Question {
  id: string
  label: string
  /** Short form used in the summary, e.g. "Depth". */
  short: string
  type: QuestionType
  options?: Option[]
  unit?: string
  placeholder?: string
  /** number: show an "I don't know yet" checkbox. */
  allowUnknown?: boolean
  /** yesno: drop the "I'm not sure" option. */
  twoWay?: boolean
  optional?: boolean
  showIf?: (answers: Answers) => boolean
}

export interface QuestionSet {
  /** Heading shown beside the "Your selection" thumbnail on card 5. */
  title: string
  questions: Question[]
}

const yesno = (id: string, label: string, short: string, extra: Partial<Question> = {}): Question => ({
  id, label, short, type: 'yesno', ...extra,
})
const metres = (id: string, label: string, short: string, extra: Partial<Question> = {}): Question => ({
  id, label, short, type: 'number', unit: 'metres', allowUnknown: true, ...extra,
})
const single = (id: string, label: string, short: string, options: Option[], extra: Partial<Question> = {}): Question => ({
  id, label, short, type: 'single', options, ...extra,
})
const textarea = (id: string, label: string, short: string, placeholder: string, extra: Partial<Question> = {}): Question => ({
  id, label, short, type: 'textarea', placeholder, ...extra,
})

const STOREYS: Option[] = [
  { value: 'single', label: 'Single storey' },
  { value: 'two', label: 'Two or more storeys' },
]

/** Ids are prefixed per set so answers never leak between "type of work" chips. */
const heritage = (prefix: string) =>
  yesno(`${prefix}.heritage`, 'Is the property listed or in a conservation area?', 'Listed / conservation area')

/** Keyed `${categoryId}.${subtypeId}`, or just `${categoryId}` when a category has no subtypes. */
const SETS: Record<string, QuestionSet> = {
  // ── Extend ──────────────────────────────────────────────────────────
  'extend.rear': {
    title: 'Rear extension',
    questions: [
      single('rear.storeys', 'How many storeys will the extension have?', 'Storeys', STOREYS),
      metres('rear.depth', 'How far will it extend from the original rear wall?', 'Depth'),
      metres('rear.height', 'How high will it be (approx.)?', 'Height'),
      yesno('rear.boundary', 'Will any part be within 2 metres of your boundary?', 'Within 2 m of boundary'),
      yesno('rear.existing', 'Will it connect to an existing extension?', 'Joins existing extension'),
    ],
  },
  'extend.side': {
    title: 'Side extension',
    questions: [
      single('side.storeys', 'How many storeys will the extension have?', 'Storeys', STOREYS),
      metres('side.width', 'How wide will it be (out from the side wall)?', 'Width'),
      metres('side.height', 'How high will it be (approx.)?', 'Height'),
      yesno('side.boundary', 'Will any part be within 2 metres of your boundary?', 'Within 2 m of boundary'),
      yesno('side.highway', 'Will the side of the extension face a road?', 'Faces a road'),
    ],
  },
  'extend.wrap': {
    title: 'Wraparound extension',
    questions: [
      metres('wrap.depth', 'How far will it extend from the original rear wall?', 'Rear depth'),
      metres('wrap.width', 'How wide will the side part be?', 'Side width'),
      metres('wrap.height', 'How high will it be (approx.)?', 'Height'),
      yesno('wrap.boundary', 'Will any part be within 2 metres of your boundary?', 'Within 2 m of boundary'),
    ],
  },
  'extend.porch': {
    title: 'Front porch',
    questions: [
      metres('porch.projection', 'How far will it stick out from the front wall?', 'Projection'),
      metres('porch.height', 'How high will it be (approx.)?', 'Height'),
      yesno('porch.road', 'Will any part be within 2 metres of a boundary next to a road?', 'Within 2 m of road boundary'),
    ],
  },
  'extend.storey': {
    title: 'Extra storey',
    questions: [
      single('storey.count', 'How many extra storeys?', 'Extra storeys', [
        { value: 'one', label: 'One extra storey' },
        { value: 'two', label: 'Two extra storeys' },
      ]),
      metres('storey.height', 'How much taller will the building be (approx.)?', 'Added height'),
      yesno('storey.attached', 'Is the house semi-detached or terraced?', 'Semi-detached / terraced'),
    ],
  },

  // ── Convert / alter ─────────────────────────────────────────────────
  'convert.loft': {
    title: 'Loft conversion',
    questions: [
      single('loft.type', 'What type of loft conversion are you planning?', 'Loft type', [
        { value: 'rear', label: 'Rear dormer' },
        { value: 'side', label: 'Side dormer' },
        { value: 'rooflights', label: 'Roof lights only' },
        { value: 'other', label: 'Other' },
      ]),
      yesno('loft.height', 'Will the roof height be increased?', 'Roof height increased'),
      yesno('loft.highway', 'Will the work face a highway?', 'Faces a highway'),
      {
        id: 'loft.volume',
        label: 'Do you know the additional roof volume?',
        short: 'Added roof volume',
        type: 'number',
        unit: 'm³',
        allowUnknown: true,
      },
    ],
  },
  'convert.garage': {
    title: 'Garage conversion',
    questions: [
      single('garage.attached', 'Is the garage attached to the house or separate?', 'Garage', [
        { value: 'attached', label: 'Attached to the house' },
        { value: 'detached', label: 'Separate building' },
      ]),
      yesno('garage.external', 'Will the outside of the building change (doors, windows, walls)?', 'External changes'),
      yesno('garage.parking', 'Will it remove your off-street parking?', 'Loses off-street parking'),
    ],
  },
  'convert.other': {
    title: 'Conversion or alteration',
    questions: [
      textarea('convert.describe', 'Briefly describe what you would like to convert or alter', 'Description', 'e.g. Turn the basement into a flat…'),
    ],
  },

  // ── Build new ───────────────────────────────────────────────────────
  'build.outbuilding': {
    title: 'Outbuilding / Garden room',
    questions: [
      single('out.use', 'What will it be used for?', 'Use', [
        { value: 'office', label: 'Home office' },
        { value: 'gym', label: 'Gym' },
        { value: 'annexe', label: 'Annexe' },
        { value: 'storage', label: 'Storage' },
        { value: 'other', label: 'Other' },
      ]),
      { id: 'out.size', label: 'Approximate size (length x width)?', short: 'Size', type: 'dimensions', unit: 'metres' },
      metres('out.eaves', 'Height to eaves?', 'Eaves height'),
      yesno('out.boundary', 'Will it be within 2 metres of a boundary?', 'Within 2 m of boundary'),
    ],
  },
  'build.dwelling': {
    title: 'New home',
    questions: [
      { id: 'home.count', label: 'How many homes will you build?', short: 'Homes', type: 'number', unit: 'homes' },
      single('home.site', 'What is on the site now?', 'Site now', [
        { value: 'garden', label: 'Garden or spare land' },
        { value: 'replace', label: 'A building to be replaced' },
        { value: 'vacant', label: 'A vacant plot' },
        { value: 'other', label: 'Something else' },
      ]),
      yesno('home.access', 'Will it need a new vehicle access onto a road?', 'New vehicle access'),
    ],
  },
  'build.garage': {
    title: 'Garage or carport',
    questions: [
      { id: 'gar.size', label: 'Approximate size (length x width)?', short: 'Size', type: 'dimensions', unit: 'metres' },
      single('gar.attached', 'Will it be attached to the house?', 'Attached', [
        { value: 'attached', label: 'Attached to the house' },
        { value: 'detached', label: 'Separate building' },
      ]),
      yesno('gar.boundary', 'Will it be within 2 metres of a boundary?', 'Within 2 m of boundary'),
    ],
  },

  // ── Change of use ──────────────────────────────────────────────────
  'use.hmo': {
    title: 'Change of Use',
    questions: [
      { id: 'hmo.people', label: 'How many people will live at the property?', short: 'People', type: 'number', unit: 'people' },
      { id: 'hmo.bedrooms', label: 'How many bedrooms will there be?', short: 'Bedrooms', type: 'number', unit: 'bedrooms' },
      yesno('hmo.single', 'Is it currently a single dwelling?', 'Currently a single dwelling'),
      yesno('hmo.already', 'Is it already being used as an HMO?', 'Already an HMO'),
    ],
  },
  'use.flats': {
    title: 'Split into flats',
    questions: [
      { id: 'flats.count', label: 'How many flats will there be?', short: 'Flats', type: 'number', unit: 'flats' },
      yesno('flats.single', 'Is it currently a single dwelling?', 'Currently a single dwelling'),
      yesno('flats.parking', 'Is there room for off-street parking?', 'Off-street parking'),
    ],
  },
  'use.commercial': {
    title: 'Commercial to residential',
    questions: [
      {
        id: 'com.current', label: 'What is the building used for now?', short: 'Current use', type: 'select',
        options: [
          { value: 'shop', label: 'Shop' },
          { value: 'office', label: 'Office' },
          { value: 'food', label: 'Pub, cafe or restaurant' },
          { value: 'industrial', label: 'Warehouse or industrial' },
          { value: 'other', label: 'Something else' },
        ],
      },
      { id: 'com.homes', label: 'How many homes will it become?', short: 'Homes', type: 'number', unit: 'homes' },
      yesno('com.vacant', 'Is the building empty at the moment?', 'Currently empty'),
    ],
  },
  'use.other': {
    title: 'Change of use',
    questions: [
      textarea('use.describe', 'What is it used for now, and what will it be used for?', 'Description', 'e.g. Shop on the ground floor becoming a café…'),
    ],
  },

  // ── Exterior ───────────────────────────────────────────────────────
  'exterior.windows': {
    title: 'Windows or doors',
    questions: [
      heritage('win'),
      yesno('win.match', 'Will the new ones match the existing materials?', 'Matching materials'),
      yesno('win.highway', 'Will the changes face a road or highway?', 'Faces a road'),
    ],
  },
  'exterior.roof': {
    title: 'Re-roofing',
    questions: [
      heritage('roofing'),
      yesno('roofing.match', 'Will the new roof covering match the existing one?', 'Matching materials'),
      yesno('roof.shape', 'Will the shape or height of the roof change?', 'Roof shape / height changes'),
    ],
  },
  'exterior.walls': {
    title: 'Cladding, render or painting',
    questions: [
      heritage('walls'),
      yesno('walls.match', 'Will the new finish match the existing materials?', 'Matching materials'),
      yesno('walls.highway', 'Will the changes face a road or highway?', 'Faces a road'),
    ],
  },
  'exterior.solar': {
    title: 'Solar panels',
    questions: [
      single('solar.mount', 'Where will they go?', 'Mounting', [
        { value: 'roof', label: 'On the roof' },
        { value: 'ground', label: 'In the garden / ground' },
      ]),
      heritage('solar'),
      yesno('solar.higher', 'Will any part be higher than the highest part of the roof?', 'Higher than the roof'),
    ],
  },
  'exterior.other': {
    title: 'Exterior alteration',
    questions: [
      textarea('exterior.describe', 'Briefly describe the changes to the outside of the property', 'Description', 'e.g. Replace the front door and add a canopy…'),
    ],
  },

  // ── Access, parking, boundary ──────────────────────────────────────
  'access.driveway': {
    title: 'Driveway / hardstanding',
    questions: [
      yesno('drive.front', 'Is it in your front garden?', 'Front garden'),
      { id: 'drive.area', label: 'What is the approximate area?', short: 'Area', type: 'number', unit: 'm²', allowUnknown: true },
      yesno('drive.porous', 'Will it use porous (permeable) materials?', 'Porous materials'),
    ],
  },
  'access.kerb': {
    title: 'Dropped kerb / new access',
    questions: [
      single('kerb.road', 'What kind of road will the access join?', 'Road type', [
        { value: 'classified', label: 'A, B or C road' },
        { value: 'unclassified', label: 'Unclassified road' },
        { value: 'unsure', label: "I'm not sure" },
      ]),
      yesno('kerb.existing', 'Is there already a vehicle access here?', 'Existing access'),
    ],
  },
  'access.fence': {
    title: 'Fence, wall or gate',
    questions: [
      metres('fence.height', 'How high will it be?', 'Height'),
      yesno('fence.road', 'Is it next to a road or public footpath?', 'Next to a road / footpath'),
      yesno('fence.replace', 'Will it replace an existing one?', 'Replaces existing'),
    ],
  },
  'access.ev': {
    title: 'EV charge point',
    questions: [
      single('ev.where', 'What type of charge point?', 'Type', [
        { value: 'wall', label: 'Wall-mounted' },
        { value: 'post', label: 'Free-standing post' },
      ]),
      yesno('ev.road', 'Will it be next to a road?', 'Next to a road'),
    ],
  },

  // ── Trees / landscape ──────────────────────────────────────────────
  'trees.works': {
    title: 'Tree pruning or removal',
    questions: [
      single('tree.work', 'What do you want to do?', 'Work', [
        { value: 'prune', label: 'Prune' },
        { value: 'fell', label: 'Remove' },
        { value: 'unsure', label: "I'm not sure" },
      ]),
      yesno('tree.tpo', 'Is the tree protected by a Tree Preservation Order?', 'Has a TPO'),
      yesno('tree.conservation', 'Is the tree in a conservation area?', 'In a conservation area'),
      yesno('tree.dangerous', 'Is the tree dead or dangerous?', 'Dead or dangerous'),
    ],
  },
  'trees.landscape': {
    title: 'Landscaping, levels or decking',
    questions: [
      single('land.type', 'What are you planning?', 'Work', [
        { value: 'decking', label: 'Decking' },
        { value: 'raised', label: 'Raised patio / levels' },
        { value: 'retaining', label: 'Retaining wall' },
        { value: 'other', label: 'Other' },
      ]),
      metres('land.height', 'How high above the ground will it be?', 'Height'),
      yesno('land.boundary', 'Will any part be within 2 metres of a boundary?', 'Within 2 m of boundary'),
    ],
  },
  'trees.other': {
    title: 'Landscape works',
    questions: [
      textarea('trees.describe', 'Briefly describe the works to the trees or landscape', 'Description', 'e.g. Remove a hedge and re-lay the front garden…'),
    ],
  },

  // ── Already built ──────────────────────────────────────────────────
  existing: {
    title: 'Already built or changed',
    questions: [
      {
        id: 'done.when', label: 'When was the work finished?', short: 'Finished', type: 'select',
        options: [
          { value: 'lt4', label: 'Less than 4 years ago' },
          { value: '4to10', label: '4 to 10 years ago' },
          { value: 'gt10', label: 'More than 10 years ago' },
          { value: 'unsure', label: "I'm not sure" },
        ],
      },
      yesno('done.permission', 'Did it have planning permission at the time?', 'Had permission'),
      textarea('done.describe', 'Briefly describe what was built or changed', 'Description', 'e.g. A single-storey rear extension built in 2016…'),
    ],
  },

  // ── Not sure ───────────────────────────────────────────────────────
  unsure: {
    title: 'Tell us a little more',
    questions: [
      single('unsure.part', 'Which part of the property is affected?', 'Part of property', [
        { value: 'front', label: 'Front' },
        { value: 'side', label: 'Side' },
        { value: 'rear', label: 'Rear' },
        { value: 'roof', label: 'Roof or loft' },
        { value: 'garden', label: 'Garden / outbuilding' },
        { value: 'inside', label: 'Inside only' },
        { value: 'unsure', label: "I'm not sure" },
      ]),
      yesno('unsure.bigger', 'Will it make the building bigger?', 'Makes it bigger'),
      yesno('unsure.use', 'Will it change how the property is used?', 'Changes use'),
    ],
  },
}

/** Example 5 in the design — shown instead of the sets above when the person already knows their route. */
export const ROUTE_SET: QuestionSet = {
  title: 'I know my planning route',
  questions: [
    {
      id: 'route.which', label: 'Select your planning route', short: 'Planning route', type: 'select',
      options: [
        { value: 'hhp', label: 'Householder planning permission (HHP)' },
        { value: 'pd', label: 'Permitted development (PD)' },
        { value: 'ldc', label: 'Lawful Development Certificate (LDC)' },
        { value: 'prior', label: 'Prior approval' },
        { value: 'full', label: 'Full planning permission' },
        { value: 'lbc', label: 'Listed building consent' },
        { value: 'other', label: 'Other' },
      ],
    },
    single(
      'route.seek',
      'What are you seeking to establish as lawful?',
      'Seeking to establish',
      [
        { value: 'proposed', label: 'Proposed development (future works)' },
        { value: 'existing', label: 'Existing development / use (already built)' },
      ],
      { showIf: a => a['route.which'] === 'ldc' },
    ),
    textarea('route.describe', 'Briefly describe your proposal', 'Proposal', 'e.g. I want to confirm that the existing rear extension is lawful development.'),
  ],
}

// ── Lookups & helpers ─────────────────────────────────────────────────

export function getQuestionSet(
  categoryId: CategoryId | null,
  subtypeId: string | null,
  routeKnown: 'yes' | 'no',
): QuestionSet | null {
  if (routeKnown === 'yes') return ROUTE_SET
  if (!categoryId) return null
  if (SETS[`${categoryId}.${subtypeId}`]) return SETS[`${categoryId}.${subtypeId}`]
  return SETS[categoryId] ?? null
}

/** Default "type of work" for a category (first one), or null if it has none. */
export function defaultSubtypeId(categoryId: CategoryId | null): string | null {
  return getCategory(categoryId)?.subtypes[0]?.id ?? null
}

export function visibleQuestions(set: QuestionSet | null, answers: Answers): Question[] {
  if (!set) return []
  return set.questions.filter(q => !q.showIf || q.showIf(answers))
}

export function parseNumber(raw: string | undefined): number | null {
  if (!raw || raw === 'unknown') return null
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function parseDimensions(raw: string | undefined): { length: string; width: string } {
  const [length = '', width = ''] = (raw ?? '').split('x')
  return { length, width }
}

export function isAnswered(q: Question, answers: Answers): boolean {
  const v = answers[q.id]
  if (q.optional) return true
  if (v === undefined || v === '') return false
  switch (q.type) {
    case 'number': {
      if (v === 'unknown') return !!q.allowUnknown
      const n = parseNumber(v)
      return n !== null && n > 0 && n <= 10000
    }
    case 'dimensions': {
      const { length, width } = parseDimensions(v)
      const l = parseNumber(length)
      const w = parseNumber(width)
      return l !== null && l > 0 && w !== null && w > 0
    }
    case 'text':
    case 'textarea':
      return v.trim().length >= 3
    default:
      return true
  }
}

export function firstUnanswered(questions: Question[], answers: Answers): Question | null {
  return questions.find(q => !isAnswered(q, answers)) ?? null
}

export function formatAnswer(q: Question, answers: Answers): string {
  const v = answers[q.id]
  if (v === undefined || v === '') return '—'
  switch (q.type) {
    case 'yesno':
      return v === 'yes' ? 'Yes' : v === 'no' ? 'No' : "I'm not sure"
    case 'single':
    case 'select':
      return q.options?.find(o => o.value === v)?.label ?? v
    case 'number':
      return v === 'unknown' ? 'Not known yet' : `${v}${q.unit ? ` ${q.unit}` : ''}`
    case 'dimensions': {
      const { length, width } = parseDimensions(v)
      return `${length} × ${width}${q.unit === 'metres' ? ' m' : ''}`
    }
    default:
      return v
  }
}

export interface ProjectSummary {
  /** "Extend a property" */
  category: string
  /** "Rear extension" (or null) */
  subtype: string | null
  /** One line per answered question. */
  lines: { label: string; value: string }[]
}

export function summariseProject(
  categoryId: CategoryId | null,
  describe: string,
  routeKnown: 'yes' | 'no',
  subtypeId: string | null,
  answers: Answers,
): ProjectSummary {
  const category = getCategory(categoryId)
  const subtype = getSubtype(categoryId, subtypeId)
  const set = getQuestionSet(categoryId, subtypeId, routeKnown)
  const lines = visibleQuestions(set, answers)
    .filter(q => answers[q.id] !== undefined && answers[q.id] !== '')
    .map(q => ({ label: q.short, value: formatAnswer(q, answers) }))

  if (categoryId === 'unsure' && describe.trim()) {
    lines.unshift({ label: 'Your description', value: describe.trim() })
  }

  return {
    category: category?.label ?? 'Project',
    subtype: subtype?.label ?? null,
    lines,
  }
}
