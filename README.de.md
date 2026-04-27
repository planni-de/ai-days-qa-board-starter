# Q&A Board · Starter

> Die leere Leinwand, die ihr während des AI-Days-2026-Talks in zwölf Minuten habt vollwerden sehen.

Das hier ist das **Starter**-Repo. Fast kein Code. Nur eine `PLAN.md`, acht Claude-Code-Skills und eine `package.json`.

Der Sinn des Live-Demos: CTO klont, öffnet Claude Code, und ein laufendes Q&A Board landet in zehn Minuten auf Vercel — getrieben von den Skills, nicht von Autocomplete.

## Was hier drin ist

```
.
├── PLAN.md                  die Spec — was gebaut wird, die Constraints, das Schema
├── .claude/skills/          acht generische Engineering-Skills (von addyosmani/agent-skills)
├── package.json             leer, nur Name + dev-deps placeholder
├── .env.example             jede Env-Var, die die App brauchen wird
└── README.md                diese Datei
```

## Was NICHT drin ist

Alles andere. Kein `app/`, keine API-Routes, kein DB-Code, keine UI-Komponenten. Das ist der Punkt.

## Demo selber laufen lassen

```bash
git clone https://github.com/planni-de/ai-days-qa-board-starter
cd ai-days-qa-board-starter
claude  # Claude Code im Verzeichnis öffnen
> Lies PLAN.md und die .claude/skills/. Bau das Q&A Board.
```

Dann zuschauen. Der Agent liest `PLAN.md`, nimmt sich `spec-driven-development` für eine kleine Spec, zerlegt mit `planning-and-task-breakdown` in Tasks, baut inkrementell, schreibt Tests zuerst, härtet die Auth, deployt.

Du brauchst:

- Node.js 20+
- pnpm
- Vercel CLI (`pnpm i -g vercel`)
- Vercel-Account mit Postgres + Upstash Redis (der Agent führt durch)
- AI-Gateway-Key für das Clustering

## Mobile-first

Das Publikum ist am Handy. Lies die Mobile-first-Checkliste in `PLAN.md`, bevor du „fertig" sagst.

## Lizenz

MIT. Skills unter `.claude/skills/` kommen aus [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT). Siehe `.claude/skills/CREDITS.md`.

Mehr Skills? [skills.sh](https://skills.sh) hat tausende, ein Befehl genügt.
