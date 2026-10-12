# AI4Planning — Next.js Frontend

AI-powered UK planning permission advisor. Dark-mode, goal-led interface.

## Quick start (local)

```bash
# 1 — Install dependencies
npm install

# 2 — Copy env file (already done — edit if needed)
# .env.local is included with defaults for local dev

# 3 — Run dev server
npm run dev

# 4 — Open browser
# http://localhost:3000
```

## Project structure

```
ai4planning/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout + metadata
│   │   ├── page.tsx                # Homepage (Navbar + HeroSection)
│   │   ├── not-found.tsx           # Global 404
│   │   └── check/[goalId]/
│   │       └── page.tsx            # Placeholder — Phase 2 question engine
│   │
│   ├── components/
│   │   ├── ui/                     # Primitive components (no shadcn)
│   │   │   ├── Button.tsx          # Polymorphic button (button | a)
│   │   │   ├── Logo.tsx            # Brand logo with icon
│   │   │   ├── SearchBar.tsx       # AI search input (API-ready)
│   │   │   ├── Badge.tsx           # Tag / pill
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                 # Page-level layout components
│   │   │   ├── Navbar.tsx          # Sticky nav (client — scroll + mobile)
│   │   │   ├── NavDesktop.tsx      # Desktop horizontal links
│   │   │   ├── NavMobile.tsx       # Mobile full-screen drawer
│   │   │   └── index.ts
│   │   │
│   │   └── home/                   # Homepage-specific sections
│   │       ├── HeroSection.tsx     # Full hero composer (client)
│   │       ├── HeroEyebrow.tsx     # Animated pill label
│   │       ├── HeroHeadline.tsx    # H1
│   │       ├── HeroTrustBar.tsx    # 4-item proof strip
│   │       ├── GoalCard.tsx        # Homeowner grid card
│   │       ├── GoalStrip.tsx       # Professional row
│   │       └── index.ts
│   │
│   ├── hooks/
│   │   ├── useSearch.ts            # Search state + keyword classifier
│   │   └── useNavbar.ts            # Scroll + mobile menu state
│   │
│   ├── lib/
│   │   ├── cn.ts                   # Tailwind class merger
│   │   └── goals.ts                # Goal catalogue + search keywords
│   │
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces
│   │
│   └── styles/
│       └── globals.css             # Tailwind base + CSS variables
│
├── public/                         # Static assets
├── tailwind.config.ts              # Full design token system
├── next.config.js                  # API proxy + image domains
├── tsconfig.json
└── package.json
```

## Design tokens

All colours live in `tailwind.config.ts` and as CSS variables in `globals.css`.

| Token | Value | Usage |
|---|---|---|
| `--accent` / `bg-[#135BEC]` | Brand blue | Primary CTA, active states, prices |
| `--cyan` / `bg-[#00D4FF]` | Cyan | Secondary tags, booking |
| `--bg` / `bg-[#0A0E1A]` | Deep navy | Page background |
| `--bg2` / `bg-[#0F1525]` | Card surface | Cards, strips |
| `--ink` / `text-[#E8F0FF]` | Soft white | Primary text |

## API integration points

Every component that will eventually call an API has a comment block marking the swap point.

| Hook / Component | API endpoint (when ready) |
|---|---|
| `useSearch.ts` | `POST /api/search/classify` |
| `goals.ts` | `GET /api/goals` |
| `Navbar.tsx` | `GET /api/auth/me` (swap CTAs for UserMenu) |
| `check/[goalId]/page.tsx` | Full question engine (Phase 2) |

## Scripts

```bash
npm run dev          # Dev server with hot reload
npm run build        # Production build
npm run start        # Run production build
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
```

## Phase 2 — what to build next

1. `/check/[goalId]` — multi-step question engine per flow archetype
2. `/api/search/classify` — LLM-powered goal classifier
3. Auth — `/login` and `/signup` pages with goal preservation
4. Address capture + UPRN lookup (GetAddress.io)
5. Free snapshot report generation (RPT-001)
6. Payment + paid report (RPT-002, Stripe)
