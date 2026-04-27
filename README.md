# Q&A Board · Starter

> The empty canvas you saw filled in twelve minutes during the AI Days 2026 talk.

This is the **starter** repo. Almost no code. Just a `PLAN.md`, eight Claude Code skills, and a `package.json`.

The talk demo's whole point: a CTO clones this, opens Claude Code, and a working Q&A board ships to Vercel in ten minutes — driven by the skills, not by autocomplete.

## What's in here

```
.
├── PLAN.md                  the spec — what to build, the constraints, the schema
├── .claude/skills/          eight generic engineering skills (vendored from addyosmani/agent-skills)
├── package.json             empty, just name + dev deps placeholder
├── .env.example             every env var the app will need
└── README.md                this file
```

## What's NOT in here (yet)

Everything else. No `app/`, no API routes, no DB code, no UI components. That's the point.

## How to run the demo yourself

```bash
git clone https://github.com/planni-de/ai-days-qa-board-starter
cd ai-days-qa-board-starter
claude  # open Claude Code in this dir
> Read PLAN.md and the .claude/skills/. Build the Q&A Board.
```

Then watch. The agent reads `PLAN.md`, picks up the `spec-driven-development` skill to write a small spec, breaks the work into tasks via `planning-and-task-breakdown`, builds incrementally, writes tests first, hardens auth, and deploys.

You will need:

- Node.js 20+
- pnpm
- Vercel CLI (`pnpm i -g vercel`)
- A Vercel account with Postgres + Upstash Redis provisioned (the agent will guide)
- An AI Gateway key for the clustering job

## Mobile-first

The audience is on phones. Read `PLAN.md` § Mobile-first checklist before claiming done.

## License

MIT. Skills under `.claude/skills/` come from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT). See `.claude/skills/CREDITS.md`.

Need more skills? [skills.sh](https://skills.sh) has thousands. One command, installed.
