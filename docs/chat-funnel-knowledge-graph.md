# Chat Funnel — Architecture Notes & Known Pitfalls

This doc exists because the same *shape* of bug kept recurring in the
LLM chat funnel (`/api/chat/ask` → `useReportChatFlow.ts` →
`ReportChatFlow.tsx`): a new piece of resolved information (postcode,
then property type, then generic slots) got wired into **one** call
site and silently forgotten in another. This isn't a list of things
that were fixed — it's the *rule* each fix encodes, so the next
change follows it by default instead of reintroducing the same bug
under a new name.

See `chat-funnel-diagram.mermaid` for how the pieces below connect.
See `chat-funnelling-test-plan.xlsx` → **Known Gaps** sheet for the
tracked issue history (G-1, etc.) — this doc is "why", that sheet is
"what and when".

---

## Core principle: one funnel point per direction

There are exactly two directions data moves in this system, and each
has exactly one place responsible for it:

| Direction | Single funnel point | Rule |
|---|---|---|
| Server → client (a turn resolves something) | `applyResolvedAnswer()` in `useReportChatFlow.ts` | Every caller of `generateAnswerRemote()` passes its result through this — nobody destructures `resolvedPostcode`/`resolvedSlots` themselves. |
| New resolvable field defined | `questionSlots.ts` | Adding a slot here is the *only* step. The tool schema, its validation, and the stepper's own question all read from this one array. |

**If you're about to write `if (someResolvedField) doSomething()` in a
second place**, that's the smell. Route it through `applyResolvedAnswer`
instead, even if it feels like a one-line shortcut in the moment — the
property-type bug was exactly this shortcut, taken twice.

---

## Pitfall log (the pattern behind each fix, not just the fix)

### 1. A new resolved field added to one call site, not both
**What happened:** `resolvedPropertyType` was destructured in the
initial-query effect but not in `sendFollowUp` — so anything said
after the first message was silently dropped.
**Rule:** never destructure `RemoteAnswerResult` fields at more than
one call site. Any new field goes into `applyResolvedAnswer` and
nowhere else.

### 2. A field existed on the client with no server implementation
**What happened:** `resolvedPropertyType` was fully wired up
client-side — types, destructuring, ref merging — while the server
route never actually resolved or returned it. The field was
permanently `undefined` and nothing ever surfaced an error, because
`undefined` is a perfectly valid "nothing resolved this turn" state.
**Rule:** when adding a resolvable field, trace it server → client in
one sitting and sanity-check with a real conversation, not just a
type-checks-so-it-must-work read-through. A field that's always
`undefined` looks identical to a field that's just rarely triggered.

### 3. One-off tool per slot (property type had its own tool, its own
handler, its own prompt paragraph)
**What happened:** every new slot needed a new `TOOLS` entry, a new
handler function, and new prose in `chatSkill.ts` — three places to
remember per slot, forever.
**Rule:** slots are resolved through one generic `resolve_answer(slotId,
value)` tool, built from `QUESTION_SLOTS`. Adding a slot to
`questionSlots.ts` makes it resolvable from free chat automatically.
The only slot with its own dedicated tool is `postcode`
(`lookup_council`), because that one needs a live external lookup, not
just a value read off the text — that's a genuine exception, not a
precedent for adding more one-off tools.

### 4. A guard that was too coarse (`reportLaunchedRef`)
**What happened:** `handleResolvedSlots` blocked on
`reportLaunchedRef.current` — "has the stepper ever launched" — which
also blocked it for the rest of the session, including later
paid-tier follow-up chat where it should have kept working.
**Rule:** name guards after the *actual* race they prevent, not the
broadest condition that happens to prevent it too. The real race here
was "don't mutate `answersRef` while the user is mid-answer to the
currently displayed question" — so the guard is now
`activeQuestionRef.current`, which is `null` outside of that narrow
window. When you add a new guard, ask: what's the smallest window
where this actually matters? — and guard exactly that, not "ever
since X happened."

### 5. `Partial<Record<K, V>>` silently allows `undefined` values
**What happened:** `TierAnswers = Record<string, string>`.
`Partial<TierAnswers>` doesn't just make keys optional the way it
does for named interface properties — for an index-signature type it
widens every *value* to `V | undefined`, i.e.
`{ [x: string]: string | undefined }`. That's not assignable back to
`TierAnswers`, and the error only surfaces at the spread/assignment
site, far from the `Partial<...>` that caused it.
**Rule:** never wrap an index-signature type (`Record<string, V>`) in
`Partial<...>` to mean "a subset of these keys." Use `Record<string, V>`
directly — a plain object with only the keys you have already *is* a
valid subset; you don't need `Partial` to express that, and using it
introduces `undefined` into every value's type for no benefit.

---

## Checklist: adding a new question slot (e.g. "ownership", "budget")

1. Add the slot to `questionSlots.ts` — `id`, `prompt`, `options` (or
   omit `options` for free text). This alone makes it:
   - resolvable from free chat via `resolve_answer` (route.ts)
   - askable by the structured stepper (questionEngine.ts)
2. Nothing else. Do not add a new tool, a new handler function, a new
   `chatSkill.ts` paragraph, or a new field on `RemoteAnswerResult`.
3. Test it the way the manual test plan does: state the answer in
   free text mid-conversation (not just via the tap UI) and confirm
   the stepper doesn't re-ask it. That's the actual regression this
   whole system exists to prevent — test the free-text path, not just
   the tap-through path.

## Checklist: before merging any change to this pipeline

- [ ] Did I add a new field to `RemoteAnswerResult`? → it must be
      handled inside `applyResolvedAnswer`, nowhere else.
- [ ] Did I add a new `Record<string, V>`-shaped type and need a
      "subset of it" type? → use `Record<string, V>`, not
      `Partial<Record<string, V>>`.
- [ ] Did I add a new guard (`xRef.current` check)? → write down, in a
      comment, the exact race it prevents — if you can't state it in
      one sentence, the guard is probably broader than it needs to be.
- [ ] Did I run the free-text path, not just the tap-through path, for
      whatever I changed?