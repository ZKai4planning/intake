# Project Intake chat — patch

Drop the contents of this zip over your project (same paths). No new npm packages.

## What changed
| Area | Files |
|---|---|
| Homepage | `components/home/HeroActorSelect.tsx` — homeowner card CTA is now **Get started** → `/start` |
| Intake chat (new) | `app/(landingpage)/start/page.tsx`, `components/intake/**`, `lib/intake/**` |
| Property lookup (new) | `app/api/property/{search,confirm,media}/route.ts`, `lib/server/property/**` |
| Login / OTP | `LoginContent.tsx` (prefills + shows the entered email), `VerifyEmailContent.tsx` (saves name/mobile on sign-up), `dashboard/new/intent/page.tsx` (turns intake into a draft project) |
| Env | `.env.local.example` — `PLANNING_ENGINE_URL`, `PLANNING_ENGINE_API_KEY`, `PLANNING_ENGINE_MOCK` |

## Flow
Homepage "Get started" → `/start`: Welcome → Your details → Property (address search, street view / aerial) →
What are you planning? → Tell us more (questions change per project type) → **Email me a code** →
`/verify-email` (OTP, email already filled) → `/dashboard/new/intent?intake=1` → prefilled draft project.
Answers are kept in localStorage (`intake_draft_v1`), so refresh / resume works.

## Property data (street view + aerial)
Set `PLANNING_ENGINE_URL` to the Express engine from `patch6-plots-heights-epc`. The Next routes proxy it
(keys never reach the browser). With no URL set, built-in **demo data** is used (postcode `E6 2AA` only).

## Easy tweaks
- `lib/intake/config.ts` → `WELCOME_NEEDS_CLICK = true` adds the "Start my project" button on the Welcome card.
- `lib/intake/projectTypes.ts` → all categories, "type of work" chips and questions (data only).
  Add `image: '/intake/extend.jpg'` to a category to show a photo on its tile instead of the icon.
