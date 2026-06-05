---
purpose: 'Documents the vp CLI entry-point contract, the full command reference, the pre-push gate, and local-CI parity requirements.'
scope: 'Toolchain invocation and gates only — workspace structure in STRUCTURE, dependency management in DEPENDENCIES, CI pipeline orchestration in PIPELINE.'
audience: 'Contributors running dev workflows (primary); agents executing build and check commands (secondary); CI configuration maintainers (tertiary).'
summary: 'vp is the sole entry point wrapping pnpm + Vite + Vitest + lint/format; command reference for dev/build/check/test/ready; pre-push gate (vp run ready = check + build); local-CI parity contract (vp check = what CI runs); dependency version management via pnpm catalog.'
---

# Toolchain

## Entry-point contract

**`vp` is the sole entry point for all workspace operations** — development, builds, checks, tests, and dependency management. Bare `pnpm`/`npm`/`yarn` invocations bypass the `vp` contract: workspace catalog pinning, run cache, and hook routing all require `vp`. The few legitimate escape hatches (ad-hoc operations `vp` doesn't cover) are noted inline when used. CI uses `pnpm install --frozen-lockfile` directly — the `--frozen-lockfile` flag is not exposed via `vp install` and is necessary for reproducible CI installs.

All commands run from the **repo root**, not from individual app or package directories. Per-app tasks use the `vp run <app>#<task>` form. Lint and format are root-owned — `vp check` from the root covers every package.

**Node version:** `node >=22.12.0` is required (Active LTS; pinned in root `package.json` → `engines` field). `vp` enforces this at install time.

## Commands

| Command                               | Does                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `vp install`                          | Install / refresh all workspace deps (pnpm catalog in `pnpm-workspace.yaml` is the version source of truth). |
| `vp run dev:tcm` / `vp run dev:8fold` | Dev server for TCM / 8fold (HMR on `.md` changes). Equivalent: `vp run tcm#dev` / `vp run 8fold#dev`.        |
| `vp check`                            | Format + lint + type-check the whole workspace. One canonical config in root `vite.config.ts`.               |
| `vp run fix`                          | Autofix format + lint issues workspace-wide (`vp check --fix`). Type-check errors require manual resolution. |
| `vp run build`                        | `vp run -r build` — builds every app (`vite-ssg build` → static HTML per route + `sitemap.xml`).             |
| `vp run test`                         | `vp run -r test` — runs each package's tests (framework unit tests live in `packages/core/`).                |
| `vp run ready`                        | `vp check && vp run -r build` — the pre-push gate.                                                           |
| `vp run <app>#<task>`                 | Run one app's task, e.g. `vp run tcm#build`, `vp run 8fold#preview`.                                         |

**`vp build` ≠ `vp run build`.** `vp build` invokes Vite+'s SPA build path, bypassing `vite-ssg`. Always use `vp run build` (or `vp run <app>#build`) so each app's build task routes through `vite-ssg build`. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if a build produces a SPA bundle instead of static HTML.

**`vp test` ≠ `vp run test`.** `vp test` invokes Vite+'s built-in Vitest on the current package only; always use `vp run test` (or `vp run -r test`) to run tests across all workspace packages.

## Pre-push gate

`vp run ready` = `vp check && vp run -r build`. Run this before pushing. It catches format/lint/type errors (check phase) and confirms every app builds to static HTML (build phase). CI runs the same sequence; a green local `ready` run means CI will pass.

`check` is a **separate root step** — the apps' `build` tasks do NOT `dependsOn: ['check']`. `vp run ready` (and CI) run check first explicitly. Running only `vp run build` does not lint or type-check.

## Local-CI parity

`vp check` is the same command CI runs for the lint/format/type stage. Local config and CI config use identical sources — the root `vite.config.ts`. No per-app lint configuration exists; no CI-specific lint flags diverge from local. A lint failure on CI that doesn't reproduce locally is a configuration defect.

## IDE setup

`.vscode/settings.json` wires format-on-save via the OXC formatter extension (`oxc.fmt.configPath: "./vite.config.ts"`), sets `npm.scriptRunner: "vp"` so the VS Code npm-scripts panel runs `vp` commands, and enables `editor.formatOnSave`. See `.vscode/extensions.json` for the recommended extension pack. These settings are committed to the repo; contributors using VS Code get a consistent environment without extra steps.

## Dependency management

Dependency versions are declared once in the `catalog:` block of `pnpm-workspace.yaml`. Individual `package.json` files reference `catalog:` rather than pinning versions directly. To bump a dependency:

1. Change the version in `pnpm-workspace.yaml` catalog
2. Run `vp install`
3. Run `vp check` to catch any type or lint regressions

Do not edit individual `package.json` versions directly — the catalog is the preferred source of truth (`catalogMode: prefer`; individual version specs are accepted but discouraged).

## Industry References

- [Vite+ guide](https://viteplus.dev/guide/) — `vp` CLI documentation and workspace conventions.
- [pnpm Workspaces](https://pnpm.io/workspaces) — workspace topology and multi-package management.
- [pnpm Catalogs](https://pnpm.io/catalogs) — version-as-catalog mechanics (`prefer` mode used here; `strict` would reject any dep outside the catalog).

_External URLs verified 2026-06-04._

## Cross-references

- [CONVENTIONS.md](CONVENTIONS.md) — `vp`-as-sole-entry-point convention and why bare `pnpm` invocations are disallowed.
- [STRUCTURE.md](STRUCTURE.md) — workspace layout that determines which commands apply to which packages.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — `vp build` vs `vp run build` failure mode.
- [PIPELINE.md](PIPELINE.md) — CI pipeline that runs the same `vp check` + `vp run build` sequence.
