# Skills Credits

The eight Claude Code skills shipped in this repo are vendored from
[**addyosmani/agent-skills**](https://github.com/addyosmani/agent-skills) (MIT License).

They cover the generic engineering lifecycle — spec, plan, build, test,
debug, review, harden, ship — and are framework-agnostic. Drop your own
project-specific skills next to them.

## Bundled

| Skill | Purpose |
|---|---|
| `spec-driven-development` | Define what to build before writing code. |
| `planning-and-task-breakdown` | Decompose work into small, verifiable tasks. |
| `incremental-implementation` | Build thin vertical slices, verify each. |
| `test-driven-development` | Failing test first, then make it pass. |
| `debugging-and-error-recovery` | Reproduce → localize → fix → guard. |
| `code-review-and-quality` | Five-axis review before merge. |
| `security-and-hardening` | OWASP, input validation, least privilege. |
| `shipping-and-launch` | Pre-launch checklist, monitoring, rollback. |

## License

Original work © Addy Osmani, MIT licensed. See upstream repo for the full
license text. Modifications (if any) are also MIT.

## Updating

To pull the latest version of a skill:

```bash
gh api repos/addyosmani/agent-skills/contents/skills/<name>/SKILL.md \
  --jq '.content' | base64 -d > .claude/skills/<name>/SKILL.md
```

## Want more skills?

Don't reinvent the wheel — [**skills.sh**](https://skills.sh) is a community
registry of thousands of pre-built Claude Code skills, installable with a
single command:

```bash
npx skills add <owner>/<repo>
```
