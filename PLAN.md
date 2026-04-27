# Q&A Board · PLAN

A live audience Q&A board for an event. Mobile-first. People scan a QR, submit questions on their phone, upvote others, the organizer answers from a separate admin view.

This is the **build spec**. The 8 skills in `.claude/skills/` drive *how* the build happens (TDD, security, incremental). This file drives *what*.

## What we're building

- **Submission page** (`/`): scan, type, submit. No account, no friction.
- **Board** (`/board`): list of questions, sortable by upvotes, anyone can upvote (rate-limited per IP).
- **Admin** (`/admin`): password-protected. Mark answered, pin, delete spam. Plus two helpers: a **Seed** button that inserts ten realistic demo questions (so the board isn't empty if no one submits), and a **Clear-all** button to wipe questions+clusters between events. Each cluster card is an **accordion**: clicking it expands inline to show only the questions in that cluster (with a chevron rotating, `aria-expanded` set, `aria-controls` linking the panel). Only one cluster expanded at a time. The flat "Letzte Fragen" list stays below for chronological view.
- **AI clustering**: similar questions grouped, fewer duplicates on screen.
- **Theme toggle**: a small floating button (top-right, ≥44px tap target) that flips between light and dark. Default is OS preference (`prefers-color-scheme`). Choice persists in `localStorage` under key `qa-theme`. Apply theme via `<html data-theme="light|dark">` and read it in an inline `<script>` placed in `<head>` *before* paint to avoid a flash of wrong theme.
- **Brand mark**: planni logo fixed top-left, links to https://planni.de (opens in new tab). Two PNG variants are already in `public/`: `planni-logo-dark.png` (for dark theme) and `planni-logo-light.png` (for light theme). Swap them with the same `data-theme` / `prefers-color-scheme` rules used for the palette.
- **Animated background**: two large blurred radial-gradient orbs in primary colors (`#0071e3` and `#5856d6`), drifting slowly via CSS `@keyframes` (~22s and ~28s, alternate). They sit behind the content (`z-index: -1`), are pinned with `position: fixed`, and respect `prefers-reduced-motion: reduce` (animation disabled). Lighter opacity in light mode.
- **Footer**: `Mit Grüßen vom planni-Team.` — *planni-Team* is a link to https://planni.de.

## Constraints (non-negotiable)

- **Mobile-first.** Audience is on phones, screens 360–430px wide.
  - Tap targets ≥ 44px.
  - No hover-only states.
  - Sticky submit input on `/board` so the form is always reachable.
  - Single-column layout below 640px. Two-column desktop only.
- **Light + dark theme.** Both fully styled. Toggle button visible on every page.
- **Anonymous submissions allowed.** Optional name field.
- **Rate limit by IP**: 5 submissions/minute, 30 upvotes/minute.
- **Admin auth (optional)**: if `ADMIN_PASSWORD` is set in env, `/admin/*` is gated by Basic Auth and shows pin/answered/delete actions plus the Seed and Clear-all buttons. If unset, no admin route is exposed and the board is read-only after submission.
- **AI clustering (optional)**: similar questions grouped via Vercel AI Gateway (`anthropic/claude-haiku-4-5`). On Vercel, OIDC auth is automatic — no API key needed. If you want to run clustering locally too, set `AI_GATEWAY_API_KEY`. If you skip clustering altogether, questions render flat ordered by upvotes — still fine for short events.
- One Postgres DB (Vercel Postgres). One Redis (Upstash) for rate limit. Both required.
- Deploy: 1-click Vercel.

## Stack

- Next.js 16 App Router, Server Components by default
- Tailwind CSS, utility-first, no design system
- `@vercel/postgres` for DB
- `@upstash/redis` + `@upstash/ratelimit` for limits
- AI clustering via Vercel AI Gateway (`anthropic/claude-haiku-4-5`)
- Vitest for unit + API, Playwright for one mobile-viewport e2e

## Schema

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL CHECK (length(text) BETWEEN 5 AND 500),
  author TEXT,
  cluster_id UUID REFERENCES clusters(id),
  upvotes INT DEFAULT 0,
  answered BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX questions_pinned_upvotes ON questions (pinned DESC, upvotes DESC, created_at DESC);
```

## API surface

- `POST /api/questions` — body: `{ text, author? }`. Zod validate, rate limit, insert, return `{ id }`.
- `GET /api/questions?answered=false` — return list ordered by pinned/upvotes/created.
- `POST /api/questions/:id/vote` — rate limit, increment upvotes.
- `POST /api/admin/questions/:id` — Basic Auth, body `{ answered?, pinned? }`.
- `DELETE /api/admin/questions/:id` — Basic Auth, soft-delete (set deleted_at).
- `POST /api/admin/seed` — Basic Auth. Inserts the ten demo questions below if the table is empty (or always, your call).
- `POST /api/admin/clear` — Basic Auth. Truncates `questions` + `clusters`. Use between rehearsal and the live talk.
- `POST /api/cluster` — cron-only, runs clustering on un-clustered questions.

## Demo seed questions (German, talk-relevant)

```ts
const SEED = [
  { body: 'Wie testet ihr Skills, bevor ihr sie produktiv nutzt?', authorName: 'Lukas' },
  { body: 'Was kostet euch Claude pro Monat im Schnitt?', authorName: null },
  { body: 'Wie reviewt ihr zehn PRs am Tag, die von Agenten kommen?', authorName: 'Sandra' },
  { body: 'Wann braucht es eine Skill statt eines Agents?', authorName: null },
  { body: 'Welche Skill würdet ihr in einem Team von fünf Devs zuerst schreiben?', authorName: 'Marc' },
  { body: 'Wie verhindert ihr, dass Agenten schneller Schrott bauen?', authorName: null },
  { body: 'Funktioniert das auch mit Cursor statt Claude Code?', authorName: 'Anja' },
  { body: 'Wie handhabt ihr die Sicherheit von API-Keys in Skills?', authorName: null },
  { body: 'Was war euer schlimmster Bug, den ein Agent verursacht hat?', authorName: 'Tobi' },
  { body: 'Wie überzeugt ihr das Management, dass das wirklich Output bringt?', authorName: null },
]
```

## Build order (the 10-minute demo)

**Work on the `live` branch.** Every push to `live` triggers a production deploy. Don't verify the URL — push and trust the deploy. The fallback covers any failure invisibly.

### Speed rules (non-negotiable, this is a 10-min live demo)

> **These rules override every skill in `.claude/skills/`.** TDD, security audits, code review, and any other skill default that says "always" or "never" yields to the rules below for this build. The skills exist for normal work — this is a live demo where discipline beats completeness. If a skill activates and disagrees with a rule here, the rule here wins. Do not negotiate, do not split the difference.

- **DO NOT debug deployment.** Push and move on. Don't run `vercel inspect`, don't curl the URL, don't check `vercel ls`, don't try to set aliases, don't touch deployment protection settings. The infra is the human's responsibility — if Vercel breaks, the human swaps to a fallback you don't need to know about. Your job ends at `git push`.
- **Skip tests entirely.** No vitest, no playwright, no test files. Zod parse errors at the boundary are enough. The `test-driven-development` skill does not apply to this build.
- **Skip AI clustering** in the build. Just `cluster_id` column nullable, no `/api/cluster` route. Clusters can come post-talk.
- **Don't verify URLs after push.** The deploy is async. Don't curl, don't open tabs, don't check headers. Move to the next slice.
- **Don't run `next build` or `tsc` to check.** Push and let Vercel build. If Vercel fails, you'll see it in the next prompt cycle — fix then.
- **Don't add `vercel.json`** unless absolutely needed. Defaults work.
- **No `npm install` decisions** — package.json deps are listed below, copy verbatim.
- **No alias / domain / DNS work.** Pre-wired by the human.

### Order

1. `package.json` + `tsconfig.json` + `next.config.mjs` + `app/globals.css` (with theme + orbs CSS) — copy from this PLAN section "Boilerplate".
2. `npm install` (one shot, in background while you write code).
3. `lib/schemas.ts` (Zod) + `lib/db.ts` (auto-migrate on first call).
4. `app/layout.tsx` + `<ThemeToggle>` + `<BrandMark>` components.
5. `app/page.tsx` (submission form) + `app/api/questions/route.ts` (POST/GET with Zod).
6. **First push to `live`.** Vercel deploys. Audience sees something at `<project>.vercel.app`.
7. `app/board/page.tsx` (board with sticky form, polling every 5s, optimistic vote).
8. `app/api/questions/[id]/vote/route.ts` (vote endpoint).
9. **Second push.**
10. Admin Basic Auth (`middleware.ts` + `app/admin/page.tsx`) with Seed and Clear-all buttons. Cluster accordion *if you have time*.
11. **Final push.**

If you hit T+8m and the first deploy isn't live, drop step 10 entirely.

## Out of scope (intentionally)

- Login / user accounts
- Email notifications
- WebSocket / SSE — polling every 5s is fine
- Multi-event support
- Themes / customization
- Analytics

## Mobile-first checklist (verify before deploy)

- [ ] iPhone SE (375px) — submission form fits without scroll
- [ ] Tap targets ≥ 44×44px (vote button, admin actions)
- [ ] Submit input sticks to bottom on `/board`
- [ ] No horizontal scroll at any breakpoint
- [ ] Lighthouse Mobile Performance ≥ 90
- [ ] Tested in Safari iOS (real device or BrowserStack)
