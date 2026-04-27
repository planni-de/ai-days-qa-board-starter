# Q&A Board · PLAN

A live audience Q&A board for an event. Mobile-first. People scan a QR, submit questions on their phone, upvote others, the organizer answers from a separate admin view.

This is the **build spec**. The 8 skills in `.claude/skills/` drive *how* the build happens (TDD, security, incremental). This file drives *what*.

## What we're building

- **Submission page** (`/`): scan, type, submit. No account, no friction.
- **Board** (`/board`): list of questions, sortable by upvotes, anyone can upvote (rate-limited per IP).
- **Admin** (`/admin`): password-protected. Mark answered, pin, delete spam.
- **AI clustering**: similar questions grouped, fewer duplicates on screen.

## Constraints (non-negotiable)

- **Mobile-first.** Audience is on phones, screens 360–430px wide.
  - Tap targets ≥ 44px.
  - No hover-only states.
  - Sticky submit input on `/board` so the form is always reachable.
  - Single-column layout below 640px. Two-column desktop only.
- **Anonymous submissions allowed.** Optional name field.
- **Rate limit by IP**: 5 submissions/minute, 30 upvotes/minute.
- **Admin auth (optional)**: if `ADMIN_PASSWORD` is set in env, `/admin/*` is gated by Basic Auth and shows pin/answered/delete actions. If unset, no admin route is exposed and the board is read-only after submission.
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
- `POST /api/cluster` — cron-only, runs clustering on un-clustered questions.

## Build order (the 10-minute demo)

**Work on the `live` branch.** Vercel is wired so every push to `live` triggers a production deploy on the default `.vercel.app` URL — the audience sees it appear in real time. `main` stays clean as the starter for cloners.

```bash
git checkout -b live   # first time
# ...code...
git push -u origin live
```

Then:

1. Schema + migration (`lib/db/migrate.sql`)
2. Zod schemas (`lib/schemas.ts`) — `QuestionInput`, `Question`
3. POST `/api/questions` with rate limit + Zod
4. Mobile-first submission form (`/`)
5. GET `/api/questions` + Board UI with sticky form
6. Vote endpoint + optimistic UI
7. Admin Basic Auth + minimal UI (only if `ADMIN_PASSWORD` is set)
8. AI clustering job (only if `AI_GATEWAY_API_KEY` is set)
9. Push to `live` → Vercel deploys → URL is shown
10. QR / verbal: audience hits the deployed URL

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
