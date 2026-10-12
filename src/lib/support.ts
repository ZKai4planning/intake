/**
 * support.ts
 * ────────────
 * Content + search for the dashboard "Get Help" page
 * (/dashboard/support). Deliberately plain data + a tiny matcher — no
 * search service required. If the person's question doesn't match
 * anything here well enough, the page falls back to the in-app
 * assistant (AgentAssistantWidget) instead of leaving them stuck.
 */

export interface HelpArticle {
  id:       string
  category: string
  question: string
  answer:   string
  /** Extra words worth matching on that don't appear verbatim in question/answer. */
  keywords?: string[]
}

export const HELP_CATEGORIES = [
  'Getting started',
  'Reports & pricing',
  'Account & security',
  'Planning advice',
] as const

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'start-project',
    category: 'Getting started',
    question: 'How do I start a new project?',
    answer:
      'From your dashboard, select "New project" (or ask the assistant to "start a new project"). You\'ll enter an address, answer a few quick questions, and get a free eligibility snapshot straight away.',
    keywords: ['new', 'create', 'begin', 'address'],
  },
  {
    id: 'edit-project',
    category: 'Getting started',
    question: 'Can I edit or update a project after I\'ve started it?',
    answer:
      'Yes — open the project from your dashboard and continue where you left off. Answers you\'ve already given are saved automatically, so you won\'t need to redo anything.',
    keywords: ['change', 'update', 'resume', 'continue'],
  },
  {
    id: 'formal-advice',
    category: 'Planning advice',
    question: 'Is this a substitute for formal planning advice?',
    answer:
      'No. Your result is an eligibility snapshot to help you understand your options quickly — it isn\'t formal planning advice and doesn\'t replace a decision from your local planning authority. For anything with real risk attached, we\'ll point you to a vetted consultant.',
    keywords: ['formal', 'legal', 'official', 'guarantee'],
  },
  {
    id: 'accuracy',
    category: 'Planning advice',
    question: 'How accurate is the check?',
    answer:
      'We check your exact address against real constraint data — conservation area boundaries, listed building status, Article 4 directions, flood risk, and your council\'s Local Plan policy. Designations do change, so we always recommend a final check with your council before submitting.',
    keywords: ['reliable', 'correct', 'trust', 'constraint', 'council'],
  },
  {
    id: 'submit-application',
    category: 'Planning advice',
    question: 'Do you submit the planning application for me?',
    answer:
      'Our guided tools help you prepare everything you need — document checklists, drafts, and supporting statements — and you can submit yourself. If you\'d rather hand it off entirely, you can book a consultant to manage the submission for you.',
    keywords: ['apply', 'submission', 'council portal'],
  },
  {
    id: 'coverage',
    category: 'Planning advice',
    question: 'Do you cover the whole of the UK?',
    answer:
      'Coverage depends on the local authority — we check against your specific council\'s published data. If a designation looks out of date for your area, let us know via Get Help and we\'ll look into it.',
    keywords: ['scotland', 'wales', 'england', 'ireland', 'area', 'coverage'],
  },
  {
    id: 'cost',
    category: 'Reports & pricing',
    question: 'What does it cost?',
    answer:
      'Your first eligibility snapshot is free. What you need after that depends on your situation — a homeowner checking one extension needs very little, while a developer or consultant managing many sites gets a workspace built for that scale.',
    keywords: ['price', 'pricing', 'free', 'fee', 'cost'],
  },
  {
    id: 'report-tiers',
    category: 'Reports & pricing',
    question: 'What\'s the difference between the report tiers?',
    answer:
      'The free Quick Planning Snapshot gives you a likely route and obvious constraints. The Planning Eligibility Report (£29) adds a fuller location check and next steps. The Planning Potential / Risk Report (£79) goes deeper with a document checklist and a recommended package. A Consultant Planning Assessment adds a professional review on top.',
    keywords: ['tier', 'upgrade', 'plan', 'package', 'snapshot', 'eligibility', 'risk report'],
  },
  {
    id: 'download-report',
    category: 'Reports & pricing',
    question: 'How do I download my report?',
    answer:
      'Go to Reports in your dashboard and select Download on any completed report. Downloads are tied to your account, so make sure you\'re signed in with the same email you used to generate it.',
    keywords: ['pdf', 'export', 'save'],
  },
  {
    id: 'refund',
    category: 'Reports & pricing',
    question: 'Can I get a refund on a paid report?',
    answer:
      'If a paid report couldn\'t be generated because of an error on our end, contact us via the assistant below with your project reference and we\'ll sort it out. Reports that generated successfully aren\'t refundable, since the constraint check has already been run against your address.',
    keywords: ['refund', 'money back', 'cancel payment'],
  },
  {
    id: 'data-security',
    category: 'Account & security',
    question: 'Is my address and project data secure?',
    answer:
      'Yes — your projects and answers are tied to your account and never shared with third parties without your consent. Property and constraint data comes from publicly available planning sources.',
    keywords: ['privacy', 'gdpr', 'secure', 'safe'],
  },
  {
    id: 'change-email',
    category: 'Account & security',
    question: 'Can I change the email address on my account?',
    answer:
      'Head to your Profile page in the dashboard to update your name and photo. For an email address change, reach out via the assistant below so we can verify it\'s really you first.',
    keywords: ['email', 'update account'],
  },
  {
    id: 'mfa',
    category: 'Account & security',
    question: 'How do I turn on two-factor authentication (MFA)?',
    answer:
      'From your Profile page, open the Security section and follow the MFA setup steps. You\'ll need a verified phone number first if you haven\'t already added one.',
    keywords: ['2fa', 'two-factor', 'security code', 'phone'],
  },
  {
    id: 'delete-account',
    category: 'Account & security',
    question: 'How do I delete my account?',
    answer:
      'Go to Profile → Delete account. This permanently removes your projects, reports, and personal data — it can\'t be undone, so download anything you want to keep first.',
    keywords: ['remove account', 'close account'],
  },
]

const norm = (s: string) => s.toLowerCase().trim()

/**
 * Very small relevance search: scores each article by how many of the
 * query's significant words (3+ letters) appear in its question,
 * answer, or keyword list. Good enough for a help-article set this
 * size without pulling in a search dependency — swap for a real
 * search index if HELP_ARTICLES grows a lot.
 */
export function searchHelpArticles(query: string): HelpArticle[] {
  const q = norm(query)
  if (!q) return HELP_ARTICLES

  const terms = q.split(/\s+/).filter(w => w.length >= 3)
  if (terms.length === 0) return HELP_ARTICLES

  const scored = HELP_ARTICLES.map(article => {
    const haystack = norm(
      [article.question, article.answer, ...(article.keywords ?? [])].join(' ')
    )
    const score = terms.reduce((sum, term) => (haystack.includes(term) ? sum + 1 : sum), 0)
    return { article, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.article)
}
