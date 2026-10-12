// app/legal/_data/policies.ts

export type NoticeVariant = 'warning' | 'info' | 'success'

export interface PolicyNotice {
  type: 'notice'
  variant: NoticeVariant
  title: string
  body: string
}

export interface PolicyTable {
  type: 'table'
  headers: string[]
  rows: string[][]
}

export interface PolicyList {
  type: 'list'
  items: (string | { label: string; text: string })[]
}

export interface PolicyContact {
  type: 'contact'
  rows: { label: string; value: string; href?: string }[]
}

export interface PolicyParagraph {
  type: 'paragraph'
  text: string // supports <a href="...">text</a> via dangerouslySetInnerHTML
}

export type PolicyBlock =
  | PolicyParagraph
  | PolicyList
  | PolicyTable
  | PolicyNotice
  | PolicyContact
  | PolicySubsection

export interface PolicySubsection {
  type: 'subsection'
  id: string
  title: string
  content: PolicyBlock[]
}

export interface PolicySection {
  id: string
  num: string
  title: string
  content: PolicyBlock[]
}

export interface PolicyDoc {
  slug: string
  title: string
  eyebrow: string
  meta: string
  sections: PolicySection[]
}

// ─────────────────────────────────────────────
// PRIVACY POLICY
// ─────────────────────────────────────────────
const privacyPolicy: PolicyDoc = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  eyebrow: 'Legal',
  meta: 'Effective Date: [Insert Date] · Last Updated: [Insert Date]',
  sections: [
    {
      id: 's1', num: '01', title: 'Introduction',
      content: [
        { type: 'paragraph', text: 'AI4Planning ("Company," "we," "our," or "us") operates the website <a href="https://ai4planning.com">ai4planning.com</a> and provides AI-powered planning and analytics services, including the <strong>Zynapsys</strong> intelligent agent feature (collectively, the "Platform"). We are committed to protecting your privacy and ensuring the security of your personal data.' },
        { type: 'paragraph', text: 'This Privacy Policy describes how we collect, use, disclose, and protect information obtained from users ("you," "your") of our Platform.' },
      ],
    },
    {
      id: 's2', num: '02', title: 'Data Controller Information',
      content: [
        {
          type: 'contact',
          rows: [
            { label: 'Entity', value: 'AI4Planning' },
            { label: 'Website', value: 'ai4planning.com', href: 'https://ai4planning.com' },
            { label: 'Privacy', value: 'privacy@ai4planning.com', href: 'mailto:privacy@ai4planning.com' },
            { label: 'DPO', value: 'dpo@ai4planning.com', href: 'mailto:dpo@ai4planning.com' },
          ],
        },
      ],
    },
    {
      id: 's3', num: '03', title: 'Information We Collect',
      content: [
        {
          id: 's3-1', type: 'subsection', title: '3.1 Information You Provide Directly',
          content: [
            {
              type: 'list', items: [
                { label: 'Account Registration:', text: 'Full name, email, organisation name, job title, phone number' },
                { label: 'Authentication Credentials:', text: 'Encrypted passwords or SSO tokens' },
                { label: 'Project Content:', text: 'Planning documents, schedules, resource allocation data, budgets, project parameters' },
                { label: 'Zynapsys Interactions:', text: 'Queries, commands, prompts, and conversations with the AI agent' },
                { label: 'Payment Information:', text: 'Billing address and payment method (processed by PCI-compliant processors)' },
                { label: 'Communications:', text: 'Support tickets, feedback, survey responses, feature requests' },
              ],
            },
          ],
        } ,
        {
          id: 's3-2', type: 'subsection', title: '3.2 Information Collected Automatically',
          content: [
            {
              type: 'list', items: [
                { label: 'Log Data:', text: 'IP address, browser type, OS, referring URLs, access times' },
                { label: 'Usage Analytics:', text: 'Features accessed, agent commands, time spent, workflows used' },
                { label: 'Device Information:', text: 'Device type, screen resolution, language preferences' },
                { label: 'AI Processing Logs:', text: 'Prompt submissions, model responses, token usage, agent decision paths' },
              ],
            },
          ],
        } ,
        {
          id: 's3-3', type: 'subsection', title: '3.3 Information from Third-Party Sources',
          content: [
            {
              type: 'list', items: [
                { label: 'SSO Providers:', text: 'Google, Microsoft, or SAML identity providers' },
                { label: 'Integration Partners:', text: 'Third-party tools you authorise (Slack, Jira, Microsoft Teams, etc.)' },
                { label: 'Public Business Data:', text: 'Company information for enterprise verification' },
              ],
            },
          ],
        } ,
      ],
    },
    {
      id: 's4', num: '04', title: 'How We Use Your Information',
      content: [
        { type: 'paragraph', text: 'We process personal data under the following lawful bases:' },
        {
          type: 'table',
          headers: ['Processing Purpose', 'Legal Basis (GDPR)'],
          rows: [
            ['Providing and maintaining Platform services', 'Performance of Contract'],
            ['Enabling Zynapsys agent functionality', 'Performance of Contract'],
            ['AI model inference and response generation', 'Contract / Legitimate Interest'],
            ['Account management and authentication', 'Performance of Contract'],
            ['Billing, invoicing, and payment processing', 'Performance of Contract'],
            ['Customer support and issue resolution', 'Performance of Contract'],
            ['Platform optimisation and analytics', 'Legitimate Interest'],
            ['AI model improvement (aggregated/anonymised)', 'Legitimate Interest / Consent'],
            ['Security monitoring and threat detection', 'Legitimate Interest / Legal Obligation'],
            ['Marketing and product announcements', 'Consent / Legitimate Interest'],
            ['Legal compliance and dispute resolution', 'Legal Obligation'],
          ],
        },
      ],
    },
    {
      id: 's5', num: '05', title: 'Zynapsys Agent — Specific Data Processing',
      content: [
        {
          id: 's5-1', type: 'subsection', title: '5.1 Agent Functionality',
          content: [{ type: 'paragraph', text: 'Zynapsys processes user inputs, project data, and planning parameters to generate recommendations, schedules, risk assessments, and optimisation suggestions. The agent may maintain conversational context within a session to provide coherent assistance.' }],
        } ,
        {
          id: 's5-2', type: 'subsection', title: '5.2 Data Used by Zynapsys',
          content: [{ type: 'list', items: ['Project metadata and content you upload or create', 'Real-time platform data (schedules, resources, constraints)', 'User prompts and interaction history within a session'] }],
        } ,
        {
          id: 's5-3', type: 'subsection', title: '5.3 Agent Limitations',
          content: [{ type: 'list', items: ['Zynapsys operates within defined project boundaries', 'Outputs are advisory and subject to human review', 'The agent does not make autonomous binding decisions', 'Users retain full control over accepting, rejecting, or modifying agent outputs'] }],
        } ,
        {
          id: 's5-4', type: 'subsection', title: '5.4 Data Retention for Agent Interactions',
          content: [{
            type: 'list', items: [
              { label: 'Active session data:', text: 'Retained until session ends' },
              { label: 'Interaction logs:', text: 'Retained per the Data Retention Schedule' },
              { label: 'Generated outputs:', text: 'Stored with project data per retention schedule' },
            ],
          }],
        } ,
      ],
    },
    {
      id: 's6', num: '06', title: 'Use of Artificial Intelligence',
      content: [
        {
          id: 's6-1', type: 'subsection', title: '6.1 AI Models',
          content: [{ type: 'paragraph', text: 'We utilise large language models (LLMs) and machine learning algorithms to power our Platform, including Zynapsys. Data submitted to our Platform may be processed by these models.' }],
        } ,
        {
          id: 's6-2', type: 'subsection', title: '6.2 Human Review',
          content: [{ type: 'paragraph', text: 'A limited number of authorised AI4Planning personnel may review de-identified samples of model inputs/outputs for quality assurance, safety monitoring, and system improvement. All reviewers are bound by strict confidentiality obligations.' }],
        } ,
        {
          id: 's6-3', type: 'subsection', title: '6.3 Model Training',
          content: [{
            type: 'list', items: [
              { label: 'Default:', text: 'We do not use your project data to train our base AI models' },
              { label: 'Opt-in Improvement:', text: 'You may voluntarily allow use of anonymised data to improve model performance' },
              { label: 'Opt-out:', text: 'You maintain the right to decline participation in model improvement without impact on service quality' },
            ],
          }],
        } ,
      ],
    },
    {
      id: 's7', num: '07', title: 'Cookies & Tracking Technologies',
      content: [
        { type: 'paragraph', text: 'We use cookies and similar tracking technologies. For complete details, please see our <a href="/legal/cookie-policy">Cookie Policy</a>.' },
        {
          type: 'list', items: [
            { label: 'Strictly Necessary:', text: 'Session management, authentication, security' },
            { label: 'Performance:', text: 'Analytics, usage measurement' },
            { label: 'Functional:', text: 'User preferences, language settings' },
            { label: 'Targeting:', text: '(Only with explicit consent) Personalisation' },
          ],
        },
      ],
    },
    {
      id: 's8', num: '08', title: 'Data Sharing & Disclosure',
      content: [
        { type: 'notice', variant: 'success', title: 'We do not sell personal data.', body: 'We do not share personal data for third-party cross-context behavioural advertising.' },
        {
          type: 'table',
          headers: ['Recipient', 'Purpose', 'Safeguards'],
          rows: [
            ['Cloud Infrastructure (Digital Ocean)', 'Hosting and compute', 'Data Processing Agreement'],
            ['AI Model Providers', 'LLM inference (zero-retention API)', 'DPA, zero-data-retention clauses'],
            ['Payment Processors', 'Billing operations', 'PCI-DSS compliance'],
            ['Analytics Providers', 'Usage analytics', 'Anonymised data, DPA'],
            ['Integration Partners', 'Platform integrations (at your direction)', 'Your authorisation required'],
            ['Legal/Regulatory Authorities', 'Legal compliance', 'As required by law'],
            ['Successors in Interest', 'Merger, acquisition, restructuring', 'Contractual obligations'],
          ],
        },
      ],
    },
    {
      id: 's9', num: '09', title: 'Data Retention Schedule',
      content: [{
        type: 'table',
        headers: ['Data Category', 'Retention Period'],
        rows: [
          ['Active account data', 'Duration of account'],
          ['Closed account data', '90 days post-closure, then deletion'],
          ['Project data', 'Per customer contract (default: account term + 1 year)'],
          ['Zynapsys interaction logs', '1 year'],
          ['Payment and billing records', '7 years (legal/tax obligations)'],
          ['System logs and security events', '2 years'],
          ['Anonymised/aggregated data', 'Indefinitely'],
        ],
      }],
    },
    {
      id: 's10', num: '10', title: 'Data Security',
      content: [{
        type: 'list', items: [
          'Encryption in transit (TLS 1.3) and at rest (AES-256)',
          'Multi-factor authentication (MFA) support',
          'Role-based access controls (RBAC)',
          'Annual penetration testing and vulnerability assessments',
          'Security incident response plan',
          'Employee confidentiality training and background checks',
          'Business continuity and disaster recovery plans',
        ],
      }],
    },
    {
      id: 's11', num: '11', title: 'International Data Transfers',
      content: [
        { type: 'paragraph', text: 'AI4Planning operates globally. Personal data may be transferred to and processed in countries including the United States, European Economic Area, and India. We ensure adequate protection through:' },
        { type: 'list', items: ['EU Standard Contractual Clauses (SCCs)', 'UK International Data Transfer Agreements', 'Data Processing Agreements with all sub-processors', 'Technical measures (encryption, pseudonymisation)'] },
      ],
    },
    {
      id: 's12', num: '12', title: 'Your Data Protection Rights',
      content: [
        {
          type: 'table',
          headers: ['Right', 'Description'],
          rows: [
            ['Access', 'Request access to your personal data'],
            ['Rectification', 'Correct inaccurate or incomplete data'],
            ['Erasure', 'Request deletion ("Right to be Forgotten")'],
            ['Restriction', 'Limit processing of your data'],
            ['Portability', 'Receive data in machine-readable format'],
            ['Objection', 'Object to processing based on legitimate interest'],
            ['Automated Decisions', 'Human review of significant automated decisions'],
            ['Withdraw Consent', 'Withdraw previously given consent'],
            ['Complaint', 'Lodge complaint with supervisory authority'],
          ],
        },
        { type: 'paragraph', text: 'To exercise your rights, contact: <a href="mailto:privacy@ai4planning.com">privacy@ai4planning.com</a>' },
      ],
    },
    {
      id: 's13', num: '13', title: 'Region-Specific Provisions',
      content: [
        {
          id: 's13-1', type: 'subsection', title: '13.1 European Economic Area (GDPR)',
          content: [{ type: 'paragraph', text: 'AI4Planning complies with the EU General Data Protection Regulation and the UK GDPR. Our lawful bases for processing are detailed in Section 4.' }],
        } ,
        {
          id: 's13-2', type: 'subsection', title: '13.2 California (CCPA/CPRA)',
          content: [
            { type: 'list', items: ['Right to Know (categories and specific pieces of personal information)', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out of Sale/Sharing (Note: We do not sell data)', 'Right to Limit Use of Sensitive Personal Information', 'Non-discrimination for exercising rights'] },
            { type: 'paragraph', text: 'To exercise CCPA rights, email <a href="mailto:privacy@ai4planning.com">privacy@ai4planning.com</a> with subject line "CCPA Request".' },
          ],
        } ,
        {
          id: 's13-3', type: 'subsection', title: '13.3 India (DPDP Act 2023)',
          content: [{ type: 'paragraph', text: 'We comply with India\'s Digital Personal Data Protection Act, including notice and consent requirements, data fiduciary obligations, and grievance redressal mechanisms.' }],
        } ,
      ],
    },
    {
      id: 's14', num: '14', title: "Children's Privacy",
      content: [{ type: 'notice', variant: 'warning', title: 'Age Restriction.', body: 'The Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal data from minors.' }],
    },
    {
      id: 's15', num: '15', title: 'Changes to this Policy',
      content: [
        { type: 'paragraph', text: 'We will notify users of material changes via:' },
        { type: 'list', items: ['Email notification to account holders', 'In-platform banner notification', 'Updated "Last Updated" date on this page'] },
        { type: 'paragraph', text: 'Continued use after changes constitutes acceptance.' },
      ],
    },
    {
      id: 's16', num: '16', title: 'Contact Information',
      content: [{
        type: 'contact',
        rows: [
          { label: 'Website', value: 'ai4planning.com', href: 'https://ai4planning.com' },
          { label: 'Privacy', value: 'privacy@ai4planning.com', href: 'mailto:privacy@ai4planning.com' },
          { label: 'DPO', value: 'dpo@ai4planning.com', href: 'mailto:dpo@ai4planning.com' },
          { label: 'Grievance', value: 'grievance@ai4planning.com', href: 'mailto:grievance@ai4planning.com' },
        ],
      }],
    },
  ],
}

// ─────────────────────────────────────────────
// TERMS & CONDITIONS
// ─────────────────────────────────────────────
const termsAndConditions: PolicyDoc = {
  slug: 'terms-and-conditions',
  title: 'Terms & Conditions',
  eyebrow: 'Legal',
  meta: 'Last Updated: [Insert Date]',
  sections: [
    {
      id: 's1', num: '01', title: 'Introduction & Acceptance',
      content: [
        {
          id: 's1-1', type: 'subsection', title: '1.1 Agreement',
          content: [{ type: 'paragraph', text: 'These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "Customer," "you") and <strong>AI4Planning</strong> ("Company," "we," "us," "our"), governing your access to and use of the AI4Planning website (<a href="https://ai4planning.com">ai4planning.com</a>), platform, services, and the <strong>Zynapsys</strong> intelligent planning agent (collectively, the "Services").' }],
        } ,
        {
          id: 's1-2', type: 'subsection', title: '1.2 Acceptance',
          content: [{ type: 'paragraph', text: 'By accessing, registering for, or using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using the Services on behalf of an organisation, you represent that you have the authority to bind that organisation.' }],
        } ,
        {
          id: 's1-3', type: 'subsection', title: '1.3 Eligibility',
          content: [{ type: 'paragraph', text: 'You must be at least 18 years old to use the Services. By using the Services, you represent and warrant that you meet this requirement.' }],
        } ,
      ],
    },
    {
      id: 's2', num: '02', title: 'Definitions',
      content: [{
        type: 'table',
        headers: ['Term', 'Definition'],
        rows: [
          ['"Platform"', 'The AI4Planning SaaS platform at ai4planning.com'],
          ['"Zynapsys"', 'The AI-powered intelligent planning agent integrated within the Platform'],
          ['"User Content"', 'All data, documents, inputs, and materials uploaded or submitted by you'],
          ['"Outputs"', 'Results, recommendations, and content generated by the Platform/AI'],
          ['"Subscription Plan"', 'The service tier selected by you, including features, limits, and pricing'],
          ['"Confidential Information"', 'Non-public information designated as confidential'],
        ],
      }],
    },
    {
      id: 's3', num: '03', title: 'Account Registration & Security',
      content: [
        { id: 's3-1', type: 'subsection', title: '3.1 Account Creation', content: [{ type: 'paragraph', text: 'You must provide accurate, current, and complete information during registration. You are responsible for maintaining the accuracy of your account information.' }] } ,
        { id: 's3-2', type: 'subsection', title: '3.2 Account Security', content: [{ type: 'list', items: ['Maintaining the confidentiality of your login credentials', 'All activities that occur under your account', 'Notifying us immediately of any unauthorised access'] }] } ,
        { id: 's3-3', type: 'subsection', title: '3.3 Organisation Accounts', content: [{ type: 'paragraph', text: 'For enterprise accounts, administrators may control access, permissions, and data within the organisation\'s workspace. The organisation is responsible for internal access management.' }] } ,
      ],
    },
    {
      id: 's4', num: '04', title: 'Services & Features',
      content: [
        { id: 's4-1', type: 'subsection', title: '4.1 Core Services', content: [{ type: 'paragraph', text: 'The AI4Planning Platform provides AI-powered planning, scheduling, resource management, and analytics tools. The Zynapsys agent provides conversational planning assistance, recommendations, and task automation.' }] } ,
        { id: 's4-2', type: 'subsection', title: '4.2 Service Availability', content: [{ type: 'paragraph', text: 'We strive for 99.5% uptime (excluding scheduled maintenance). Service Level Agreements (SLAs) for enterprise customers are outlined in separate agreements.' }] } ,
        { id: 's4-3', type: 'subsection', title: '4.3 Modifications', content: [{ type: 'paragraph', text: 'We reserve the right to modify, enhance, or discontinue features with reasonable notice. Material changes will be communicated via email and in-platform notifications.' }] } ,
      ],
    },
    {
      id: 's5', num: '05', title: 'Zynapsys Agent Terms',
      content: [
        { id: 's5-1', type: 'subsection', title: '5.1 Agent Functionality', content: [{ type: 'paragraph', text: 'Zynapsys processes user prompts and project data, generates planning recommendations and optimisations, operates within parameters set by you, and provides conversational assistance.' }] } ,
        {
          id: 's5-2', type: 'subsection', title: '5.2 AI Limitations',
          content: [{
            type: 'list', items: [
              { label: 'AI is Not Infallible:', text: 'Outputs may contain errors, omissions, or inaccuracies' },
              { label: 'Human Oversight Required:', text: 'All critical planning decisions must be reviewed by qualified human professionals' },
              { label: 'Advisory Nature:', text: 'Agent recommendations are advisory and not binding' },
              { label: 'No Professional Advice:', text: 'The Platform does not replace professional planning, engineering, or legal judgment' },
              { label: 'Output Verification:', text: 'You are responsible for verifying all AI-generated outputs before implementation' },
            ],
          }],
        } ,
        {
          id: 's5-3', type: 'subsection', title: '5.3 Acceptable Use of Agent',
          content: [{ type: 'list', items: ['Use Zynapsys for automated decision-making with legal or similarly significant effects without human review', 'Circumvent agent safety mechanisms or content filters', 'Input malicious, harmful, or illegal content', 'Attempt to extract, reverse engineer, or manipulate the underlying AI models'] }],
        } ,
      ],
    },
    {
      id: 's6', num: '06', title: 'Acceptable Use',
      content: [
        {
          id: 's6-1', type: 'subsection', title: '6.1 Prohibited Conduct',
          content: [{ type: 'list', items: ['Violate applicable laws or regulations', 'Infringe intellectual property rights', 'Upload malicious code or content', 'Engage in unauthorised access or penetration testing', 'Overload or disrupt the Services', 'Resell or redistribute Services without authorisation', 'Use the Services for competitive analysis or to build competing products'] }],
        } ,
        { id: 's6-2', type: 'subsection', title: '6.2 User Content Warranties', content: [{ type: 'paragraph', text: 'You represent and warrant that you own or have necessary rights to all User Content, that User Content does not violate third-party rights, and that User Content complies with applicable laws.' }] } ,
      ],
    },
    {
      id: 's7', num: '07', title: 'Intellectual Property',
      content: [
        { id: 's7-1', type: 'subsection', title: '7.1 Our IP', content: [{ type: 'paragraph', text: 'AI4Planning owns all rights, title, and interest in the Platform (including Zynapsys), AI models, software code, algorithms, trademarks, logos, branding, and all documentation.' }] } ,
        { id: 's7-2', type: 'subsection', title: '7.2 Your IP', content: [{ type: 'paragraph', text: 'You retain all rights to your User Content. You grant us a limited, worldwide, non-exclusive licence to use, process, and store User Content solely to provide the Services.' }] } ,
        { id: 's7-3', type: 'subsection', title: '7.3 Outputs', content: [{ type: 'paragraph', text: 'Subject to your ownership of underlying User Content, you own the Outputs generated specifically for you through the Services.' }] } ,
        { id: 's7-4', type: 'subsection', title: '7.4 Feedback', content: [{ type: 'paragraph', text: 'Any feedback, suggestions, or improvements you provide may be used by us without restriction or compensation.' }] } ,
      ],
    },
    {
      id: 's8', num: '08', title: 'Payment Terms',
      content: [
        { id: 's8-1', type: 'subsection', title: '8.1 Fees', content: [{ type: 'paragraph', text: 'Fees are based on your selected Subscription Plan. All fees are in USD unless otherwise stated and are non-refundable except as required by law.' }] } ,
        { id: 's8-2', type: 'subsection', title: '8.2 Billing', content: [{ type: 'list', items: ['Subscription fees are billed in advance', 'Usage-based fees are billed in arrears', 'Payment is due upon receipt of invoice', 'Late payments may incur interest at 1.5% per month'] }] } ,
        { id: 's8-3', type: 'subsection', title: '8.3 Taxes', content: [{ type: 'paragraph', text: 'Fees are exclusive of applicable taxes. You are responsible for all sales, use, VAT, and similar taxes.' }] } ,
      ],
    },
    {
      id: 's9', num: '09', title: 'Confidentiality',
      content: [
        { id: 's9-1', type: 'subsection', title: '9.1 Confidential Information', content: [{ type: 'paragraph', text: 'Both parties agree to protect the other\'s Confidential Information using reasonable security measures and not to disclose it without consent, except as required by law.' }] } ,
        { id: 's9-2', type: 'subsection', title: '9.2 Exceptions', content: [{ type: 'paragraph', text: 'Confidential Information does not include information that is or becomes publicly available, was lawfully known prior to disclosure, is independently developed, or is required to be disclosed by law.' }] } ,
      ],
    },
    {
      id: 's10', num: '10', title: 'Data Protection',
      content: [{ type: 'paragraph', text: 'Processing of personal data is governed by our <a href="/legal/privacy-policy">Privacy Policy</a> and Data Processing Agreement (where applicable). By using the Services, you acknowledge and agree to such processing.' }],
    },
    {
      id: 's11', num: '11', title: 'Third-Party Services',
      content: [{ type: 'paragraph', text: 'The Platform may integrate with third-party services. We are not responsible for third-party services, and your use of them is subject to their respective terms.' }],
    },
    {
      id: 's12', num: '12', title: 'Disclaimers & Limitations',
      content: [
        { type: 'notice', variant: 'warning', title: 'Important — Please Read Carefully', body: 'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT AI-GENERATED OUTPUTS WILL BE ACCURATE, COMPLETE, RELIABLE, OR ERROR-FREE.' },
        { id: 's12-3', type: 'subsection', title: '12.3 Limitation of Liability', content: [{ type: 'paragraph', text: 'To the maximum extent permitted by law, AI4Planning shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our aggregate liability shall not exceed the fees paid by you in the 12 months preceding the claim.' }] } ,
      ],
    },
    {
      id: 's13', num: '13', title: 'Indemnification',
      content: [
        { type: 'paragraph', text: 'You agree to indemnify and hold harmless AI4Planning, its affiliates, officers, and employees from any claims, damages, or expenses arising from:' },
        { type: 'list', items: ['Your breach of these Terms', 'Your User Content', 'Your use of Services in violation of law', 'Your reliance on AI-generated Outputs without verification'] },
      ],
    },
    {
      id: 's14', num: '14', title: 'Termination',
      content: [
        { id: 's14-1', type: 'subsection', title: '14.1 By You', content: [{ type: 'paragraph', text: 'You may terminate by discontinuing use and cancelling your account. Prepaid fees are non-refundable unless otherwise stated.' }] } ,
        { id: 's14-2', type: 'subsection', title: '14.2 By Us', content: [{ type: 'paragraph', text: 'We may suspend or terminate your access for breach of these Terms, non-payment, illegal or harmful conduct, or upon 30 days\' notice for any reason.' }] } ,
        { id: 's14-3', type: 'subsection', title: '14.3 Effect of Termination', content: [{ type: 'paragraph', text: 'Upon termination, your account access ceases, your data will be handled per our retention policy, and accrued rights and obligations survive.' }] } ,
      ],
    },
    {
      id: 's15', num: '15', title: 'Governing Law & Disputes',
      content: [
        { id: 's15-1', type: 'subsection', title: '15.1 Governing Law', content: [{ type: 'paragraph', text: 'These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.' }] } ,
        { id: 's15-2', type: 'subsection', title: '15.2 Dispute Resolution', content: [{ type: 'paragraph', text: 'Disputes shall first be attempted to be resolved through good-faith negotiation. Unresolved disputes shall be settled through binding arbitration in [City, State/Country], except that either party may seek injunctive relief in court.' }] } ,
      ],
    },
    {
      id: 's16', num: '16', title: 'General Provisions',
      content: [{
        type: 'list', items: [
          { label: 'Entire Agreement:', text: 'These Terms constitute the entire agreement between the parties' },
          { label: 'Severability:', text: 'Invalid provisions are severed; the remainder remains enforceable' },
          { label: 'Waiver:', text: 'No waiver implies future waiver of the same right' },
          { label: 'Assignment:', text: 'You may not assign without consent; we may assign freely' },
          { label: 'Force Majeure:', text: 'No liability for events beyond reasonable control' },
          { label: 'Notices:', text: 'Electronic notices to your account email are deemed received' },
        ],
      }],
    },
    {
      id: 's17', num: '17', title: 'Contact',
      content: [{
        type: 'contact',
        rows: [
          { label: 'Website', value: 'ai4planning.com', href: 'https://ai4planning.com' },
          { label: 'Legal', value: 'legal@ai4planning.com', href: 'mailto:legal@ai4planning.com' },
          { label: 'Support', value: 'support@ai4planning.com', href: 'mailto:support@ai4planning.com' },
        ],
      }],
    },
  ],
}

// ─────────────────────────────────────────────
// COOKIE POLICY
// ─────────────────────────────────────────────
const cookiePolicy: PolicyDoc = {
  slug: 'cookie-policy',
  title: 'Cookie Policy',
  eyebrow: 'Legal',
  meta: 'Last Updated: [Insert Date]',
  sections: [
    {
      id: 's1', num: '01', title: 'Introduction',
      content: [{ type: 'paragraph', text: 'This Cookie Policy explains how <strong>AI4Planning</strong> uses cookies and similar tracking technologies on our website <a href="https://ai4planning.com">ai4planning.com</a> and associated platform. This policy should be read alongside our <a href="/legal/privacy-policy">Privacy Policy</a>.' }],
    },
    {
      id: 's2', num: '02', title: 'What Are Cookies?',
      content: [
        { type: 'paragraph', text: 'Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, provide functionality, and collect information about user behaviour.' },
        {
          type: 'list', items: [
            { label: 'First-party cookies:', text: 'Set directly by AI4Planning' },
            { label: 'Third-party cookies:', text: 'Set by our authorised service providers' },
            { label: 'Session cookies:', text: 'Temporary — deleted when the browser closes' },
            { label: 'Persistent cookies:', text: 'Remain for a set period or until manually deleted' },
          ],
        },
      ],
    },
    {
      id: 's3', num: '03', title: 'Cookie Categories We Use',
      content: [
        {
          id: 's3-1', type: 'subsection', title: '3.1 Strictly Necessary Cookies',
          content: [
            { type: 'paragraph', text: 'Essential for Platform operation — these cannot be disabled in our systems.' },
            { type: 'table', headers: ['Cookie Name', 'Provider', 'Purpose', 'Duration'], rows: [['__session', 'AI4Planning', 'User authentication session', 'Session'], ['csrf_token', 'AI4Planning', 'CSRF protection', 'Session'], ['auth_state', 'AI4Planning', 'Authentication state management', '24 hours'], ['cookie_consent', 'AI4Planning', 'Cookie preference storage', '12 months'], ['load_balancer', 'Cloud Provider', 'Traffic distribution', 'Session']] },
          ],
        } ,
        {
          id: 's3-2', type: 'subsection', title: '3.2 Performance Cookies',
          content: [
            { type: 'paragraph', text: 'These help us measure and improve Platform performance by collecting anonymous usage data.' },
            { type: 'table', headers: ['Cookie Name', 'Provider', 'Purpose', 'Duration'], rows: [['_ga', 'Google Analytics', 'User identification', '2 years'], ['_ga_*', 'Google Analytics', 'Session tracking', '2 years'], ['_gid', 'Google Analytics', 'User journey tracking', '24 hours'], ['ajs_anonymous_id', 'Segment', 'Anonymous user tracking', '1 year']] },
          ],
        } ,
        {
          id: 's3-3', type: 'subsection', title: '3.3 Functional Cookies',
          content: [
            { type: 'paragraph', text: 'These enable enhanced functionality and personalisation.' },
            { type: 'table', headers: ['Cookie Name', 'Provider', 'Purpose', 'Duration'], rows: [['preferred_lang', 'AI4Planning', 'Language preference', '12 months'], ['theme_pref', 'AI4Planning', 'UI theme preference', '12 months'], ['last_project', 'AI4Planning', 'Last accessed project', '30 days'], ['feature_dismissed', 'AI4Planning', 'Dismissed announcements', '6 months']] },
          ],
        } ,
        {
          id: 's3-4', type: 'subsection', title: '3.4 Targeting / Advertising Cookies',
          content: [
            { type: 'paragraph', text: 'We use these <strong>only with your explicit consent</strong>.' },
            { type: 'table', headers: ['Cookie Name', 'Provider', 'Purpose', 'Duration'], rows: [['_fbp', 'Facebook', 'Ad delivery and measurement', '3 months'], ['_linkedin_*', 'LinkedIn', 'Campaign analytics', '6 months'], ['__adroll', 'AdRoll', 'Retargeting', '13 months']] },
          ],
        } ,
      ],
    },
    {
      id: 's4', num: '04', title: 'Similar Technologies',
      content: [
        { id: 's4-1', type: 'subsection', title: '4.1 Web Beacons / Pixels', content: [{ type: 'paragraph', text: 'Small transparent images used to track email opens, page visits, and ad conversions.' }] } ,
        { id: 's4-2', type: 'subsection', title: '4.2 Local Storage', content: [{ type: 'paragraph', text: 'Browser storage for user preferences, draft content, and UI state. Unlike cookies, local storage data is not automatically transmitted with each request.' }] } ,
        { id: 's4-3', type: 'subsection', title: '4.3 Session Storage', content: [{ type: 'paragraph', text: 'Temporary browser storage cleared when the tab/browser closes, used for Zynapsys agent session context and in-progress form data.' }] } ,
      ],
    },
    {
      id: 's5', num: '05', title: 'Cookie Durations',
      content: [{ type: 'list', items: [{ label: 'Session cookies:', text: 'Deleted when browser closes' }, { label: 'Persistent cookies:', text: 'Maximum 24 months' }, { label: 'Consent cookies:', text: 'Maximum 12 months, then a re-consent prompt is shown' }] }],
    },
    {
      id: 's6', num: '06', title: 'Cookie Consent & Control',
      content: [
        { id: 's6-1', type: 'subsection', title: '6.1 Consent Mechanism', content: [{ type: 'paragraph', text: 'Upon first visit, we display a cookie consent banner allowing you to accept all cookies, reject non-essential cookies, or customise preferences by category.' }] } ,
        { id: 's6-2', type: 'subsection', title: '6.2 Withdrawing Consent', content: [{ type: 'list', items: [{ label: 'Platform Settings:', text: 'Navigate to Settings → Privacy → Cookie Preferences' }, { label: 'Browser Settings:', text: 'Configure your browser to block or delete cookies' }, { label: 'Footer Link:', text: 'Click "Cookie Settings" in the website footer' }] }] } ,
        { id: 's6-3', type: 'subsection', title: '6.3 Browser Controls', content: [{ type: 'list', items: [{ label: 'Chrome:', text: 'Settings → Privacy and Security → Cookies' }, { label: 'Firefox:', text: 'Options → Privacy & Security → Cookies' }, { label: 'Safari:', text: 'Preferences → Privacy → Cookies' }, { label: 'Edge:', text: 'Settings → Cookies and Site Permissions' }] }] } ,
        {
          id: 's6-4', type: 'subsection', title: '6.4 Opt-Out Links',
          content: [{ type: 'list', items: ['<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-Out</a>', '<a href="https://optout.networkadvertising.org" target="_blank" rel="noopener">Network Advertising Initiative</a>', '<a href="https://optout.aboutads.info" target="_blank" rel="noopener">Digital Advertising Alliance</a>'] }],
        } ,
      ],
    },
    {
      id: 's7', num: '07', title: 'Third-Party Cookies',
      content: [
        { type: 'paragraph', text: 'We use third-party services that may set cookies. These third parties are contractually obligated to handle data in accordance with data protection laws. Current providers include:' },
        { type: 'list', items: ['Google Analytics (performance analytics)', 'Stripe (payment processing — necessary)', 'Intercom (customer support — functional)', 'Segment (analytics infrastructure)'] },
      ],
    },
    {
      id: 's8', num: '08', title: 'Cookies & Personal Data',
      content: [
        { type: 'paragraph', text: 'Some cookies may collect data that qualifies as personal data. Where this occurs, our <a href="/legal/privacy-policy">Privacy Policy</a> applies. We do not use cookies to:' },
        { type: 'list', items: ['Store sensitive personal information directly', 'Track users across unrelated third-party websites without consent', 'Build user profiles for automated decision-making'] },
      ],
    },
    {
      id: 's9', num: '09', title: 'Do Not Track Signals',
      content: [{ type: 'paragraph', text: 'Currently, we do not respond to browser "Do Not Track" (DNT) signals due to the absence of an industry standard. We do respond to Global Privacy Control (GPC) signals where legally required.' }],
    },
    {
      id: 's10', num: '10', title: 'Cookies & the Zynapsys Agent',
      content: [{ type: 'notice', variant: 'info', title: 'Strictly Necessary.', body: 'Zynapsys agent functionality relies on session cookies and local storage to maintain conversation context and project state. These cannot be disabled without affecting agent functionality. The agent does not use any separate cookies beyond the Platform\'s standard set.' }],
    },
    {
      id: 's11', num: '11', title: 'Updates to this Policy',
      content: [{ type: 'paragraph', text: 'We may update this Cookie Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Material changes will be notified via the cookie banner.' }],
    },
    {
      id: 's12', num: '12', title: 'Contact',
      content: [{ type: 'contact', rows: [{ label: 'Email', value: 'privacy@ai4planning.com', href: 'mailto:privacy@ai4planning.com' }, { label: 'Website', value: 'ai4planning.com', href: 'https://ai4planning.com' }] }],
    },
  ],
}

// ─────────────────────────────────────────────
// DISCLAIMER
// ─────────────────────────────────────────────
const disclaimer: PolicyDoc = {
  slug: 'disclaimer',
  title: 'Disclaimer',
  eyebrow: 'Legal',
  meta: 'Last Updated: [Insert Date]',
  sections: [
    {
      id: 's1', num: '01', title: 'General Disclaimer',
      content: [{ type: 'paragraph', text: 'The information, tools, outputs, and materials provided by <strong>AI4Planning</strong> through its website (<a href="https://ai4planning.com">ai4planning.com</a>), platform, and the <strong>Zynapsys</strong> intelligent planning agent (collectively, the "Services") are provided for general informational and advisory purposes only.' }],
    },
    {
      id: 's2', num: '02', title: 'No Professional Advice',
      content: [
        { id: 's2-1', type: 'subsection', title: '2.1 Not Professional Services', content: [{ type: 'paragraph', text: 'The Services do not constitute professional planning, engineering, architectural, legal, financial, or any other licensed professional advice. Users should consult qualified professionals for specific project requirements.' }] } ,
        { id: 's2-2', type: 'subsection', title: '2.2 No Client Relationship', content: [{ type: 'paragraph', text: 'Use of the Services does not create a professional-client relationship between you and AI4Planning.' }] } ,
      ],
    },
    {
      id: 's3', num: '03', title: 'AI-Generated Content Disclaimer',
      content: [
        { type: 'notice', variant: 'warning', title: 'Important — AI Output Limitations', body: 'The Zynapsys agent and other AI features generate outputs using artificial intelligence and machine learning models. These outputs should not be solely relied upon for critical decisions.' },
        { id: 's3-1', type: 'subsection', title: '3.1 Nature of AI Outputs', content: [{ type: 'list', items: ['May contain errors, inaccuracies, or omissions', 'May not reflect current regulations, standards, or best practices', 'Are probabilistic in nature and may vary between queries', 'May produce inconsistent results'] }] } ,
        { id: 's3-2', type: 'subsection', title: '3.2 No Guarantee of Accuracy', content: [{ type: 'paragraph', text: 'AI4Planning makes no representations or warranties regarding the accuracy, completeness, reliability, or suitability of AI-generated outputs for any purpose. Outputs may be outdated, incorrect, or incomplete.' }] } ,
        { id: 's3-3', type: 'subsection', title: '3.3 User Responsibility', content: [{ type: 'list', items: ['Reviewing and verifying all AI-generated content', 'Validating outputs against current standards and regulations', 'Applying professional judgment to AI recommendations', 'Making final decisions based on AI outputs', 'Consequences resulting from reliance on unverified AI outputs'] }] } ,
      ],
    },
    {
      id: 's4', num: '04', title: 'Platform Limitations',
      content: [
        { id: 's4-1', type: 'subsection', title: '4.1 Availability', content: [{ type: 'paragraph', text: 'While we strive for high availability, the Services may experience interruptions, errors, or downtime. We do not guarantee uninterrupted or error-free operation.' }] } ,
        { id: 's4-2', type: 'subsection', title: '4.2 Technical Limitations', content: [{ type: 'list', items: ['Processing capacity constraints', 'Compatibility issues with certain browsers or devices', 'Integration limitations with third-party tools', 'Latency in AI response generation'] }] } ,
        { id: 's4-3', type: 'subsection', title: '4.3 Data Accuracy', content: [{ type: 'paragraph', text: 'AI4Planning does not warrant the accuracy of any data imported from third-party sources or integrations. Users are responsible for verifying source data.' }] } ,
      ],
    },
    {
      id: 's5', num: '05', title: 'Third-Party Content & Links',
      content: [
        { id: 's5-1', type: 'subsection', title: '5.1 External Links', content: [{ type: 'paragraph', text: 'The Platform may contain links to third-party websites or services. AI4Planning does not endorse and is not responsible for the content, accuracy, or practices of any third-party sites.' }] } ,
        { id: 's5-2', type: 'subsection', title: '5.2 Third-Party Integrations', content: [{ type: 'paragraph', text: 'Integrations with third-party tools (Slack, Jira, Microsoft Teams, etc.) are subject to the terms and availability of those services. AI4Planning is not liable for failures or data loss caused by third-party integrations.' }] } ,
      ],
    },
    {
      id: 's6', num: '06', title: 'No Warranty',
      content: [{ type: 'notice', variant: 'warning', title: 'As-Is Disclaimer', body: 'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR ERROR-FREE OPERATION.' }],
    },
    {
      id: 's7', num: '07', title: 'Limitation of Liability',
      content: [
        {
          id: 's7-1', type: 'subsection', title: '7.1 General Limitation',
          content: [
            { type: 'paragraph', text: 'To the maximum extent permitted by applicable law, AI4Planning, its affiliates, officers, directors, employees, agents, and licensors shall not be liable for any:' },
            { type: 'list', items: ['Direct damages exceeding the amount paid by you in the 12 months preceding the claim', 'Indirect, incidental, special, consequential, or punitive damages', 'Loss of profits, revenue, data, goodwill, or business opportunities', 'Damages resulting from reliance on AI-generated content', 'Project delays, cost overruns, or planning errors', 'Losses arising from third-party actions or integrations'] },
          ],
        } ,
        { id: 's7-2', type: 'subsection', title: '7.2 AI-Specific Limitation', content: [{ type: 'paragraph', text: 'AI4Planning specifically disclaims liability for decisions made based on Zynapsys agent recommendations without human verification, errors in AI-generated planning outputs, and consequences of implementing AI-suggested plans without review.' }] } ,
        { id: 's7-3', type: 'subsection', title: '7.3 Force Majeure', content: [{ type: 'paragraph', text: 'AI4Planning shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including acts of God, natural disasters, pandemics, war, terrorism, government actions, internet disruptions, or power failures.' }] } ,
      ],
    },
    {
      id: 's8', num: '08', title: 'Compliance & Regulatory Disclaimer',
      content: [
        { id: 's8-1', type: 'subsection', title: '8.1 No Regulatory Certification', content: [{ type: 'paragraph', text: 'Unless explicitly stated, the Services are not certified by any regulatory body for compliance with specific industry standards or regulations.' }] } ,
        { id: 's8-2', type: 'subsection', title: '8.2 User Compliance Responsibility', content: [{ type: 'paragraph', text: 'Users are solely responsible for ensuring their use of the Services complies with applicable laws and regulations, industry-specific standards, professional licensing obligations, and contractual obligations to their clients.' }] } ,
        { id: 's8-3', type: 'subsection', title: '8.3 Data Protection', content: [{ type: 'paragraph', text: 'While we implement security measures as described in our <a href="/legal/privacy-policy">Privacy Policy</a>, users are responsible for determining the suitability of these measures for their specific compliance requirements.' }] } ,
      ],
    },
    {
      id: 's9', num: '09', title: 'Intellectual Property Disclaimer',
      content: [
        { id: 's9-1', type: 'subsection', title: '9.1 No Licence Granted', content: [{ type: 'paragraph', text: 'Nothing in the Services or this Disclaimer grants you any right, title, or interest in AI4Planning\'s intellectual property beyond the limited usage rights in our Terms and Conditions.' }] } ,
        { id: 's9-2', type: 'subsection', title: '9.2 User Content', content: [{ type: 'paragraph', text: 'AI4Planning disclaims ownership of User Content but is not responsible for verifying ownership or rights to content uploaded by users.' }] } ,
      ],
    },
    {
      id: 's10', num: '10', title: 'Financial & Business Disclaimer',
      content: [
        { id: 's10-1', type: 'subsection', title: '10.1 No Financial Advice', content: [{ type: 'paragraph', text: 'The Services do not provide financial, investment, or tax advice. Planning outputs that involve financial projections or budgets are estimates only.' }] } ,
        { id: 's10-2', type: 'subsection', title: '10.2 Business Decisions', content: [{ type: 'paragraph', text: 'Any business decisions made using the Services are at your own risk. AI4Planning is not responsible for business outcomes, profitability, or project success.' }] } ,
      ],
    },
    {
      id: 's11', num: '11', title: 'Testimonials & Case Studies',
      content: [{ type: 'paragraph', text: 'Testimonials and case studies displayed on our website represent individual experiences and results. They are not guarantees of similar outcomes for all users.' }],
    },
    {
      id: 's12', num: '12', title: 'Changes to this Disclaimer',
      content: [{ type: 'paragraph', text: 'We reserve the right to update this Disclaimer at any time. Changes are effective upon posting. Continued use of the Services after changes constitutes acceptance of the updated Disclaimer.' }],
    },
    {
      id: 's13', num: '13', title: 'Severability',
      content: [{ type: 'paragraph', text: 'If any provision of this Disclaimer is found to be unenforceable or invalid, the remaining provisions shall remain in full force and effect.' }],
    },
    {
      id: 's14', num: '14', title: 'Acknowledgment',
      content: [{ type: 'notice', variant: 'success', title: 'Acknowledgment', body: 'By using the AI4Planning Platform and the Zynapsys Agent, you acknowledge that you have read, understood, and agree to this Disclaimer.' }],
    },
    {
      id: 's15', num: '15', title: 'Contact',
      content: [{ type: 'contact', rows: [{ label: 'Email', value: 'legal@ai4planning.com', href: 'mailto:legal@ai4planning.com' }, { label: 'Website', value: 'ai4planning.com', href: 'https://ai4planning.com' }] }],
    },
  ],
}

// ─────────────────────────────────────────────
// GDPR COMPLIANCE
// ─────────────────────────────────────────────
const gdprCompliance: PolicyDoc = {
  slug: 'gdpr-compliance',
  title: 'GDPR Compliance',
  eyebrow: 'Legal',
  meta: 'Document Version: 1.0 · Effective Date: [Insert Date]',
  sections: [
    {
      id: 's1', num: '01', title: 'Scope & Commitment',
      content: [
        { type: 'paragraph', text: 'AI4Planning is fully committed to compliance with the <strong>EU General Data Protection Regulation (GDPR) 2016/679</strong> and the <strong>UK GDPR</strong> as it applies to our processing of personal data of individuals in the EEA and the United Kingdom.' },
        { type: 'paragraph', text: 'This document outlines our GDPR compliance framework, including policies, procedures, and controls implemented across the AI4Planning Platform, including the Zynapsys intelligent planning agent.' },
      ],
    },
    {
      id: 's2', num: '02', title: 'Controller & Processor Roles',
      content: [
        {
          id: 's2-1', type: 'subsection', title: '2.1 Controller Role',
          content: [{ type: 'list', items: ['Collecting and managing user account information', 'Processing user data for platform operations', 'Determining purposes and means of processing for service delivery', 'Sending marketing communications (with consent)', 'Analysing platform usage and performance'] }],
        } ,
        {
          id: 's2-2', type: 'subsection', title: '2.2 Processor Role',
          content: [{ type: 'list', items: ['Processing customer project data, documents, and planning content', 'Executing Zynapsys agent operations on customer data', 'Storing customer-uploaded content', 'Facilitating integrations with customer-authorised third-party services'] }],
        } ,
      ],
    },
    {
      id: 's3', num: '03', title: 'Lawful Bases for Processing',
      content: [
        {
          type: 'table',
          headers: ['Lawful Basis', 'Application'],
          rows: [
            ['Article 6(1)(a) — Consent', 'Marketing communications, optional cookies, model improvement opt-in'],
            ['Article 6(1)(b) — Contract', 'Service delivery, account management, agent functionality, billing'],
            ['Article 6(1)(c) — Legal Obligation', 'Tax records, regulatory compliance, law enforcement responses'],
            ['Article 6(1)(f) — Legitimate Interest', 'Security, analytics, product improvement (balanced against rights)'],
          ],
        },
        { type: 'notice', variant: 'info', title: 'Special Category Data (Article 9).', body: 'We do not intentionally process special category data. Users are instructed not to submit such data to the Platform.' },
      ],
    },
    {
      id: 's4', num: '04', title: 'Data Subject Rights Implementation',
      content: [
        {
          type: 'table',
          headers: ['Right', 'Implementation', 'Response Time'],
          rows: [
            ['Access (Art. 15)', 'Self-service dashboard export + manual request form', 'Within 30 days'],
            ['Rectification (Art. 16)', 'Account settings update + support ticket', 'Within 30 days'],
            ['Erasure (Art. 17)', 'Account deletion + support request', 'Within 30 days'],
            ['Restriction (Art. 18)', 'Account flagging + processing limits', 'Within 30 days'],
            ['Portability (Art. 20)', 'Structured data export (JSON/CSV)', 'Within 30 days'],
            ['Objection (Art. 21)', 'Opt-out mechanisms + case review', 'Within 30 days'],
            ['Automated Decisions (Art. 22)', 'Human review request for significant decisions', 'Within 30 days'],
          ],
        },
        {
          id: 's4-req', type: 'subsection', title: 'Request Process',
          content: [{ type: 'list', items: ['Submit request to privacy@ai4planning.com', 'Identity verification required (government ID or account authentication)', 'Processing within 30 calendar days (extensions notified with reasons)', 'No fee for first request; reasonable fees for manifestly unfounded requests'] }],
        } ,
      ],
    },
    {
      id: 's5', num: '05', title: 'Data Protection by Design & by Default',
      content: [
        {
          id: 's5-1', type: 'subsection', title: '5.1 Technical Measures',
          content: [{ type: 'list', items: [{ label: 'Data Minimisation:', text: 'Only necessary data fields collected' }, { label: 'Pseudonymisation:', text: 'Personal identifiers separated from analytical data where possible' }, { label: 'Encryption:', text: 'AES-256 at rest, TLS 1.3 in transit' }, { label: 'Access Controls:', text: 'Role-based, least-privilege principle' }, { label: 'Audit Logging:', text: 'All data access and modification events logged' }] }],
        } ,
        {
          id: 's5-2', type: 'subsection', title: '5.2 Organisational Measures',
          content: [{ type: 'list', items: ['Privacy impact assessments for new features', 'Default privacy-protective settings', 'Regular privacy training for all employees', 'Privacy review in product development lifecycle'] }],
        } ,
        {
          id: 's5-3', type: 'subsection', title: '5.3 Zynapsys Agent Design',
          content: [{ type: 'list', items: ['Agent processes only data within authorised project scope', 'Session data isolated per user', 'No cross-project data leakage in model responses', 'Data minimisation in agent context windows'] }],
        } ,
      ],
    },
    {
      id: 's6', num: '06', title: 'Data Protection Impact Assessments',
      content: [
        { type: 'paragraph', text: 'A DPIA is conducted for:' },
        { type: 'list', items: ['Launch of Zynapsys agent processing', 'Implementation of new AI/ML models', 'Large-scale processing of user data', 'Systematic evaluation of personal aspects (profiling)', 'Processing involving new technologies', 'Cross-border data transfers to new jurisdictions'] },
        { type: 'paragraph', text: 'DPIAs are reviewed annually and updated upon significant changes.' },
      ],
    },
    {
      id: 's7', num: '07', title: 'Data Processing Agreements',
      content: [
        { type: 'paragraph', text: 'We execute GDPR-compliant Data Processing Agreements (DPA) with all cloud infrastructure providers, AI model inference providers, analytics and monitoring services, and customer organisations.' },
        { type: 'paragraph', text: 'Our standard DPA includes Article 28 required clauses, sub-processor authorisation mechanisms, data subject rights assistance, breach notification obligations, data return/deletion upon termination, and audit rights.' },
      ],
    },
    {
      id: 's8', num: '08', title: 'Data Breach Notification',
      content: [
        {
          id: 's8-1', type: 'subsection', title: '8.1 Internal Response',
          content: [{ type: 'list', items: ['Detection and assessment (within 24 hours)', 'Containment and mitigation', 'Investigation and documentation', 'Remediation and prevention'] }],
        } ,
        {
          id: 's8-2', type: 'subsection', title: '8.2 Notification Obligations',
          content: [{ type: 'list', items: [{ label: 'To Supervisory Authority:', text: 'Within 72 hours of becoming aware (if risk to individuals)' }, { label: 'To Affected Data Subjects:', text: 'Without undue delay (if high risk)' }, { label: 'To Controller Customers:', text: 'Within 48 hours (for processor breaches)' }, { label: 'Notification Content:', text: 'Nature, categories, likely consequences, measures taken, contact point' }] }],
        } ,
      ],
    },
    {
      id: 's9', num: '09', title: 'Data Protection Officer',
      content: [
        { type: 'contact', rows: [{ label: 'DPO Email', value: 'dpo@ai4planning.com', href: 'mailto:dpo@ai4planning.com' }] },
        { type: 'paragraph', text: 'The DPO is involved in all data protection matters, DPIA consultations, regulatory communications, and policy development and review.' },
      ],
    },
    {
      id: 's10', num: '10', title: 'Sub-Processor Management',
      content: [
        { type: 'paragraph', text: 'Current sub-processors (maintained at <a href="https://ai4planning.com/sub-processors">ai4planning.com/sub-processors</a>):' },
        { type: 'table', headers: ['Sub-Processor', 'Service', 'Location', 'Safeguards'], rows: [['Digital Ocean', 'Cloud Infrastructure', 'Global', 'SCCs, DPA'], ['Mistral', 'AI Model Inference', 'USA', 'Zero-data retention DPA'], ['Revolut', 'Payment Processing', 'Global', 'PCI-DSS, SCCs'], ['Datadog', 'Monitoring', 'USA', 'SCCs, DPA'], ['SendGrid', 'Email Communications', 'USA', 'SCCs, DPA']] },
        { type: 'paragraph', text: 'Changes to sub-processors are communicated 30 days in advance with objection rights.' },
      ],
    },
    {
      id: 's11', num: '11', title: 'International Data Transfers',
      content: [
        { id: 's11-1', type: 'subsection', title: '11.1 Transfer Mechanisms', content: [{ type: 'list', items: ['EU Standard Contractual Clauses (2021/914)', 'UK International Data Transfer Agreement', 'Technical Supplementary Measures: end-to-end encryption, tokenisation'] }] } ,
        { id: 's11-2', type: 'subsection', title: '11.2 Transfer Impact Assessments', content: [{ type: 'paragraph', text: 'We conduct Transfer Impact Assessments for all third-country transfers, evaluating local law protections, government access risks, technical and contractual safeguards, and enforceability of rights.' }] } ,
      ],
    },
    {
      id: 's12', num: '12', title: 'Records of Processing Activities (Art. 30)',
      content: [
        { type: 'paragraph', text: 'We maintain comprehensive Records of Processing Activities including:' },
        { type: 'list', items: ['Controller and DPO contact details', 'Processing purposes', 'Data subject and data categories', 'Recipient categories', 'Transfer details and retention periods', 'Security measures'] },
        { type: 'paragraph', text: 'These records are available to supervisory authorities upon request.' },
      ],
    },
    {
      id: 's13', num: '13', title: 'Employee Training',
      content: [{ type: 'list', items: ['GDPR awareness training at onboarding', 'Annual refresher training', 'Role-specific training for data handlers', 'Incident response drills'] }],
    },
    {
      id: 's14', num: '14', title: 'Consent Management',
      content: [
        { type: 'paragraph', text: 'Where consent is the lawful basis, we ensure it is:' },
        { type: 'list', items: [{ label: 'Freely Given:', text: 'No service degradation for refusal' }, { label: 'Specific:', text: 'Granular consent options provided' }, { label: 'Informed:', text: 'Clear, plain-language explanations' }, { label: 'Unambiguous:', text: 'Affirmative opt-in (no pre-ticked boxes)' }, { label: 'Withdrawable:', text: 'Easily accessible withdrawal mechanism' }] },
        { type: 'paragraph', text: 'Consent records are maintained with timestamps and collection methods.' },
      ],
    },
    {
      id: 's15', num: '15', title: 'Automated Decision-Making (Art. 22)',
      content: [
        { type: 'notice', variant: 'info', title: 'Advisory Only.', body: 'Zynapsys provides AI-generated planning recommendations. Agent outputs are advisory, not binding — human review is required for critical planning decisions.' },
        { type: 'list', items: ['Users may request human intervention for any automated output', 'The platform does not engage in solely automated decisions producing legal or similarly significant effects without human oversight'] },
      ],
    },
    {
      id: 's16', num: '16', title: 'Compliance Oversight',
      content: [{ type: 'list', items: ['Annual GDPR compliance audit', 'Quarterly policy reviews', 'Continuous monitoring and improvement', 'External audit engagement as needed'] }],
    },
    {
      id: 's17', num: '17', title: 'Contact & Complaints',
      content: [
        { type: 'contact', rows: [{ label: 'DPO', value: 'dpo@ai4planning.com', href: 'mailto:dpo@ai4planning.com' }, { label: 'EU Rep', value: 'eu-rep@ai4planning.com', href: 'mailto:eu-rep@ai4planning.com' }, { label: 'UK Rep', value: 'uk-rep@ai4planning.com', href: 'mailto:uk-rep@ai4planning.com' }] },
        { type: 'paragraph', text: 'Data subjects may lodge complaints with their local supervisory authority. Lead supervisory authority: [Designated EU DPA].' },
      ],
    },
  ],
}

// ─────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────
export const POLICIES: Record<string, PolicyDoc> = {
  'privacy-policy':     privacyPolicy,
  'terms-and-conditions': termsAndConditions,
  'cookie-policy':      cookiePolicy,
  'disclaimer':         disclaimer,
  'gdpr-compliance':    gdprCompliance,
}

export const POLICY_SLUGS = Object.keys(POLICIES)

export const FOOTER_LINKS = [
  { slug: 'privacy-policy',      label: 'Privacy Policy' },
  { slug: 'terms-and-conditions', label: 'Terms & Conditions' },
  { slug: 'cookie-policy',       label: 'Cookie Policy' },
  { slug: 'disclaimer',          label: 'Disclaimer' },
  { slug: 'gdpr-compliance',     label: 'GDPR Compliance' },
]