---
purpose: 'Guides contributors through onboarding, branch and PR conventions, the pre-PR gate, and the boundary with support.'
scope: 'Contributor workflow only — toolchain commands in TOOLCHAIN, coding conventions in CONVENTIONS, support channels in SUPPORT.'
audience: 'New contributors onboarding (primary); returning contributors refreshing workflow memory (secondary).'
summary: 'Clone → vp install → vp check green onboarding; short-lived feature branches against main; vp run ready as the pre-PR gate; conventions pointer; first-PR guidance; role boundary with SUPPORT.'
---

# Contributing

## Onboarding

1. Clone the repo.
2. Run `vp install` from the repo root to install all workspace dependencies.
3. Run `vp check` — it should pass with no errors. If it fails, resolve the issue before making changes (may indicate a stale lockfile or Node version mismatch).
4. Start a dev server: `vp run dev:tcm` or `vp run dev:8fold`.

**Node version:** ≥ 22. `vp` enforces this; older Node versions will error on install.

## Branch and PR conventions

- **Branch from `main`.** Short-lived feature branches; no long-running forks.
- **Branch naming:** `<type>/<short-description>` — e.g., `fix/search-missing-pages`, `feat/new-layout`.
- **PR title:** `<type>(<scope>): <description>` following [Conventional Commits](https://www.conventionalcommits.org). Scope is optional. Type set matches branch types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. PRs are squash-merged, so the PR title becomes the final commit message — keep it precise.
- **PR target:** `main`. The `release` branch is CI-only (deploy trigger); do not PR against it.
- **PR size:** keep PRs focused on one concern. A refactor and a feature fix in the same PR are harder to review.

## Pre-PR gate

Run `vp run ready` and `vp run -r test` before pushing:

```sh
vp run ready     # vp check && vp run -r build
vp run -r test   # unit tests across all packages
```

This runs format + lint + type-check, builds every app to static HTML, and runs the test suite. A green local `ready` + `vp run -r test` covers the main CI gates; `pnpm audit --audit-level=high` runs additionally in CI and blocks on high-severity CVEs. Do **not** skip hooks (`--no-verify`); if a hook fails, fix the underlying issue.

## Coding conventions

Follow [CONVENTIONS.md](CONVENTIONS.md) for import paths, naming (`App*`, `use*`), Tailwind 4 CSS, shims, and version pinning. The rules most likely to catch contributors:

- Import cross-workspace modules via `@framework/core/…`, never relative paths across package boundaries.
- Bump versions in `pnpm-workspace.yaml` catalog, not individual `package.json` files.
- All regex literals require the `/u` flag (Oxlint enforces this).

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org). Because PRs are squash-merged, the PR title becomes the final commit message — that's the commit that matters. Local commits on a feature branch are informal; the squash cleans them up. Type set: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Breaking changes use a `!` suffix: `feat!: ...`.

## First PR

- The maintainer reviews all PRs. Expect feedback within a few days (internal project; no SLA).
- If you're unsure whether a change is in scope, open an Issue first to discuss.
- For documentation-only PRs, `vp check` is sufficient (no build required), but `vp run ready` is still the recommended gate.

## Boundary with support

If you're filing a bug rather than contributing a fix, see [SUPPORT.md](SUPPORT.md) for the correct channel and reporting format.

## Industry References

- [pnpm Workspaces](https://pnpm.io/workspaces) — workspace-aware install and run commands.
- [Conventional Commits](https://www.conventionalcommits.org) — the `<type>` prefix vocabulary for branch names is borrowed from this commit-message convention's type tokens (`feat`, `fix`, etc.); CC itself defines commit messages, not branch naming.

_External URLs verified 2026-06-04._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — full `vp` command reference.
- [CONVENTIONS.md](CONVENTIONS.md) — coding rules for PRs.
- [SUPPORT.md](SUPPORT.md) — bug reporting and escalation (not the contributor workflow).
