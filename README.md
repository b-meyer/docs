# docs-workspace

A **documentation meta-framework** and the sites built on it, as a pnpm workspace
managed by [Vite+](https://viteplus.dev/) (`vp`). The framework
([`packages/core`](packages/core/README.md)) packages VitePress-style chrome —
sidebar, local search, theming, a markdown pipeline, and doc/home layouts — built
directly on Vite + Vue 3 + [vite-ssg](https://github.com/antfu/vite-ssg) (pages are
pre-rendered per route and hydrated as a SPA). Each site is **config + content**.

> Agents: see [`CLAUDE.md`](CLAUDE.md) for the architecture and hard rules.

## Stack

| Property        | Value                            |
| --------------- | -------------------------------- |
| Host            | Azure Static Web Apps            |
| Runtime         | Node ≥ 22                        |
| Package manager | pnpm (catalog-pinned versions)   |
| Framework       | Vite + Vue 3 + vite-ssg          |
| Apps            | `tcm` (deployed), `8fold` (stub) |

## Workspace

| Path                                       | Name              | What                                                                                                  |
| ------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------- |
| [`packages/core`](packages/core/README.md) | `@framework/core` | The meta-framework (routing, layout, search, theme, markdown). Consumed by the apps.                  |
| [`apps/tcm`](apps/tcm/)                    | `tcm`             | Traditional Chinese Medicine Primer — the rich consumer (mermaid diagrams, theme controls). Deployed. |
| [`apps/8fold`](apps/8fold/)                | `8fold`           | Noble Eightfold Path primer — a minimal stock-prose consumer (no mermaid). Not deployed.              |

`@framework/core` is a placeholder name (rename with one find-and-replace when ready).

## Getting started

`vp` (Vite+) is the **only** entry point — never run `pnpm`/`npm`/`yarn` scripts directly.

```bash
vp install        # install the whole workspace (run from the repo root)
vp run dev:tcm    # dev server for the TCM site (HMR on .md changes)
vp run dev:8fold  # dev server for the 8fold site
vp check          # format + lint + type-check the whole workspace
vp run build      # production build of every app (vite-ssg → static HTML per route)
vp run ready      # check + build — the pre-push gate
```

All of these run from the **repo root**. To target one app's own tasks directly,
use `vp run <app>#<task>`, e.g. `vp run tcm#dev`, `vp run 8fold#preview`.

## Commands

| Command                               | Does                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `vp install`                          | Install/refresh all workspace deps (pnpm catalog drives versions — see `pnpm-workspace.yaml`).                 |
| `vp run dev:tcm` / `vp run dev:8fold` | Dev server for TCM / 8fold.                                                                                    |
| `vp check` / `vp run fix`             | Lint + format (+ type-check) the whole workspace / autofix. One canonical config in the root `vite.config.ts`. |
| `vp run build`                        | `vp run -r build` — builds every app (vite-ssg).                                                               |
| `vp run test`                         | `vp run -r test` — runs each package's tests (framework unit tests live in `packages/core`).                   |
| `vp run ready`                        | `vp check && vp run -r build`.                                                                                 |
| `vp run <app>#<task>`                 | Run one app's task, e.g. `vp run tcm#build`.                                                                   |

## Layout

```
docs-workspace/
├── packages/core/   @framework/core — the meta-framework (see its README)
├── apps/tcm/        TCM Primer (config + pages/*.md)
├── apps/8fold/      8fold (config + pages/*.md)
├── vite.config.ts   ONE canonical lint + format standard for the whole workspace
├── tsconfig.json    minimal root TS config (for the root vite.config.ts)
├── pnpm-workspace.yaml  workspace globs + the dependency catalog
└── package.json     workspace root: orchestration scripts only
```

Each app/package owns its own `vite.config.ts` (build settings), `tsconfig.json`,
and `CLAUDE.md`. Lint/format are **not** configured per-package — the root
`vite.config.ts` is the single source.

## Documentation

| Doc                                                  | Summary                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| [`CLAUDE.md`](CLAUDE.md)                             | Agents-first operating rules, stack links, review gate     |
| [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md)     | POUR surface coverage for the doc-site view layer          |
| [`docs/AI.md`](docs/AI.md)                           | AI-assisted authoring posture and agent contribution rules |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)       | Framework design, component contracts, Azure deployment    |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)       | Onboarding, branch/PR conventions, pre-PR gate             |
| [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)         | Import paths, naming, CSS, lint, and dependency-pin rules  |
| [`docs/DEPENDENCIES.md`](docs/DEPENDENCIES.md)       | pnpm catalog, top-of-graph deps, update policy             |
| [`docs/DICTIONARY.md`](docs/DICTIONARY.md)           | Project-specific terminology and deprecated synonyms       |
| [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)     | Doc tree map, Branch inventory, opted-out topics           |
| [`docs/PIPELINE.md`](docs/PIPELINE.md)               | GitHub Actions → Azure SWA deploy workflow                 |
| [`docs/PROVISION.md`](docs/PROVISION.md)             | Azure SWA resource provisioning and token setup            |
| [`docs/RUNTIME.md`](docs/RUNTIME.md)                 | Azure SWA hosting model, route config, local dev           |
| [`docs/SECURITY.md`](docs/SECURITY.md)               | CSP posture, content trust boundary, dependency graph      |
| [`docs/STRUCTURE.md`](docs/STRUCTURE.md)             | Workspace topology, file placement, import model           |
| [`docs/SUPPORT.md`](docs/SUPPORT.md)                 | Issue tracker, contact channels, escalation path           |
| [`docs/TESTING.md`](docs/TESTING.md)                 | Test layers, runner, placement conventions                 |
| [`docs/TOOLCHAIN.md`](docs/TOOLCHAIN.md)             | `vp` commands, entry-point contract, pre-push gate         |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Project-specific failure modes and build gotchas           |

## Deployment

Only **`apps/tcm`** is deployed today, to Azure Static Web Apps via
[`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml)
on push to `release` (uploads `apps/tcm/dist`). `apps/8fold` has no deploy yet —
see [`TODO.md`](TODO.md) for what wiring it up entails.

## AI-assisted content

The prose under `apps/tcm/src/pages/` and `apps/8fold/src/pages/` was generated with
AI assistance and edited for consistency. Treat it as study material, not a primary
source.
