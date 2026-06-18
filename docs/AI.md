---
purpose: "Documents the project's AI-assisted authoring posture, which skills and agents are active, and the contracts agents must follow."
scope: 'AI tooling posture only — contributor workflow in CONTRIBUTING, coding conventions in CONVENTIONS.'
audience: 'Agents bootstrapping or acting on this project (primary); maintainers auditing agent-generated changes (secondary).'
summary: 'Claude Code + cit-developer skill family is the authoring toolset; boards opt-out is intentional; active skills listed with scope; agent-facing contracts define what requires human review before merging.'
---

# AI

## Authoring posture

This project is authored with **Claude Code** using the **cit-developer** skill family (`code-docs`, `code-review`, `simplify`). Skills load via a symlink/junction workaround at `~/.claude/references` and `~/.claude/scripts`; the marketplace plugin toggle (`cit-developer@cit-plugins`) is disabled in favor of this direct path.

**Boards opt-out** — work is tracked in `TODO.md`, not in a `boards/` tree. The BOARDS canon topic is opted out (see [DOCUMENTATION.md](DOCUMENTATION.md)).

## Active skills

| Skill         | Scope                                                              |
| ------------- | ------------------------------------------------------------------ |
| `code-docs`   | Documentation audits and authoring (Roots / Trunk / Branches tree) |
| `code-review` | Correctness and convention review of diffs                         |
| `simplify`    | Reuse, simplification, and efficiency cleanup passes               |

`dev-app`, `dev-feature`, `dev-fix` are **not in use** against this project. Framework feature work uses direct implementation rather than the `dev-*` scaffolding flow.

## Agent-facing contracts

**Read before writing** — agents must read the current state of any file before editing it. The `## Cross-references` and `## Industry References` footers are load-bearing; do not remove them.

**Canon and blueprint compliance** — new Branches must use the 4-prop frontmatter (`purpose`, `scope`, `audience`, `summary`) and stay within the token budget documented in `CLAUDE.md § Documentation budget`.

**Do not modify without human review:**

- `pnpm-workspace.yaml` catalog versions — version pins carry explicit rationale; see [DEPENDENCIES.md](DEPENDENCIES.md)
- `apps/*/public/staticwebapp.config.json` CSP headers — security policy change; see [SECURITY.md](SECURITY.md)
- `.github/workflows/azure-static-web-apps.yml` — pipeline change; see [PIPELINE.md](PIPELINE.md)
- `packages/core/src/plugin.ts` plugin chain order — load-bearing; order changes break the markdown pipeline (see [ARCHITECTURE.md](ARCHITECTURE.md) § Plugin chain)

**Require human review before merging:**

- Any change to `createApp` or `frameworkPlugin` signatures (consumer-facing API)
- New markdown-it plugin additions (plugin order is load-bearing)
- Changes to the `__FRAMEWORK_MERMAID__` define gate or `shims.d.ts` declarations

## AI inventory

| Vendor    | Model                 | Use                                               | Access path     |
| --------- | --------------------- | ------------------------------------------------- | --------------- |
| Anthropic | claude-sonnet-4-6[1m] | Authoring and review (cit-developer skill family) | Claude Code CLI |

Update this table when the active model version changes.

## Disclosure stance

No special AI-assistance disclosure policy beyond corporate baseline. `Co-Authored-By` commit trailers, where added by the tooling, serve as the existing audit trail. No PR-template checkbox or mandatory declaration is required.

## Comprehension requirement

Every AI-assisted or agent-produced line must be defensible in review with line-level reasoning. "The model suggested it" is not a valid response to "why is this here?" — the contributor is responsible for every line regardless of how it was drafted.

## Encumbered-output remediation

If AI-produced output is later found to carry provenance or license issues:

1. Revert the commit(s) containing the encumbered content.
2. Clean-room re-author the affected section without AI assistance.
3. Issue a consumer advisory if the encumbered content was in a shipped artifact.
4. Conduct a brief postmortem to prevent recurrence.

## Embargo fence

Security-disclosure drafts, unreleased advisory text, and other embargoed material must not enter hosted AI assistants. See [SECURITY.md](SECURITY.md) for the embargo boundary definition.

## Agent autonomy

Agents operating on this project are read-only with respect to git operations. Agents may not push to remote, merge pull requests, create or delete branches, tag releases, or publish packages without explicit human approval. The human runs all git-write commands. This policy is enforced by convention (per root `CLAUDE.md`).

The shipped artifact (`packages/core`) embeds no AI components; AI is used at authoring time only.

## Industry References

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — the CLI tool used for AI-assisted authoring.
- [Anthropic — Responsible AI](https://www.anthropic.com/responsible-development-policy) — development policy underlying the toolchain.

_External URLs verified 2026-06-04._

## Cross-references

- [CONTRIBUTING.md](CONTRIBUTING.md) — human contributor workflow and pre-PR gate.
- [DOCUMENTATION.md](DOCUMENTATION.md) — doc tree shape, Branch inventory, opted-out topics.
- [SECURITY.md](SECURITY.md) — embargo boundary and vulnerability disclosure path.
- [CLAUDE.md](../CLAUDE.md) — agent-facing operating rules and `## Documentation budget`.
