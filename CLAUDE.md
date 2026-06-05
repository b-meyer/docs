<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Links

**Vite+ (vp):**

- **Vite+ guide** https://viteplus.dev/guide/ — `vp` CLI commands, workspace conventions, and plugin reference.
- **Reka UI** https://reka-ui.com/llms.txt — unstyled accessible primitives used in `AppHeader.vue`.

**Framework + runtime:**

- **Vue 3** https://vuejs.org/guide/ — component model and reactivity.
- **vite-ssg** https://github.com/antfu/vite-ssg — SSG build wrapper; lifecycle contract governs `createSSGApp`.
- **Tailwind CSS 4** https://tailwindcss.com/docs — CSS-first utility framework; `@theme` config replaces `tailwind.config.js`.

**Deployment:**

- **Azure Static Web Apps** https://learn.microsoft.com/azure/static-web-apps/ — hosting model + `staticwebapp.config.json` route contract.

_External URLs verified 2026-06-04._

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

<!--VITE PLUS END-->

## Project — a documentation meta-framework + two consumer sites

A **pnpm workspace**: a reusable VitePress-style documentation meta-framework in `packages/core/` (placeholder name `@framework/core`) consumed by two static sites — `apps/tcm/` (the Traditional Chinese Medicine Primer) and `apps/8fold/` (a Noble Eightfold Path primer; a deliberately minimal stub). Pages are cross-linked markdown, pre-rendered per route at build time via **vite-ssg** and hydrated as a SPA. Built directly on Vite + Vue 3 — **NOT VitePress** — with `unplugin-vue-markdown` turning `.md` into Vue SFCs at build time. Remaining / future work is tracked in [TODO.md](TODO.md).

`check` is a **separate root step** — the apps' `build` tasks do NOT `dependsOn: ['check']`; `vp run ready` (and CI) run check first. CI deploys only `apps/tcm/dist` (8fold has no deploy yet).

## What lives where

| Topic                                                            | Doc                                                |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| Framework design, component contracts, Azure deployment topology | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)       |
| Coding conventions — imports, naming, CSS, lint, version pins    | [docs/CONVENTIONS.md](docs/CONVENTIONS.md)         |
| Workspace topology, file placement, import model                 | [docs/STRUCTURE.md](docs/STRUCTURE.md)             |
| `vp` commands, entry-point contract, pre-push gate               | [docs/TOOLCHAIN.md](docs/TOOLCHAIN.md)             |
| Project-specific failure modes and build gotchas                 | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Doc tree map + opted-out canon topics                            | [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)     |
| POUR surface coverage for the doc-site view layer                | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)     |
| AI-assisted authoring posture and agent contribution rules       | [docs/AI.md](docs/AI.md)                           |
| Onboarding, branch/PR conventions, pre-PR gate                   | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)       |
| pnpm catalog, top-of-graph deps, update policy                   | [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)       |
| Project-specific terminology and deprecated synonyms             | [docs/DICTIONARY.md](docs/DICTIONARY.md)           |
| GitHub Actions → Azure SWA deploy workflow                       | [docs/PIPELINE.md](docs/PIPELINE.md)               |
| Azure SWA resource provisioning and token setup                  | [docs/PROVISION.md](docs/PROVISION.md)             |
| Azure SWA hosting model, route config, local dev                 | [docs/RUNTIME.md](docs/RUNTIME.md)                 |
| CSP posture, content trust boundary, dependency graph            | [docs/SECURITY.md](docs/SECURITY.md)               |
| Issue tracker, contact channels, escalation path                 | [docs/SUPPORT.md](docs/SUPPORT.md)                 |
| Test layers, runner, placement conventions                       | [docs/TESTING.md](docs/TESTING.md)                 |

## Documentation budget

| Property         | Value          |
| ---------------- | -------------- |
| Project size     | 3.92 kSLOC     |
| Token target     | 797            |
| Token band       | 478–1195       |
| Floor            | 300            |
| Standard ceiling | 2500           |
| Op-topic ceiling | 4000           |
| Density band     | 12–22 tok/line |

Recompute trigger: ≥10% shift in kSLOC.
