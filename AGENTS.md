# Project Agent Reference

## Workspace

```
docs/                        ← repo root (pnpm workspace)
├── apps/tcm/                TCM Primer — deployed to Azure SWA
├── apps/8fold/              Eightfold Path — not yet deployed
├── apps/showcase/           Framework feature showcase — not yet deployed
├── packages/core/           @framework/core — shared framework library
├── docs/                    topical docs (ARCHITECTURE, CONVENTIONS, etc.)
└── vite.config.ts           canonical lint + format config (whole workspace)
```

Stack: Vite + Vue 3 + framework-ssg (custom SSG, not SPA) + unplugin-vue-markdown + Tailwind 4. NOT VitePress.

## Before finishing any task

1. `vp check` — format, lint, type-check the whole workspace
2. `vp run test` — run all tests
3. If the task touched a build artifact or routing: `vp run build`

Fix all failures before handing back. Do not leave lint errors, type errors, or failing tests for a human to clean up.

## Toolchain — `vp` is the sole entry point

| Command               | Does                                                     |
| --------------------- | -------------------------------------------------------- |
| `vp install`          | Install/refresh all deps                                 |
| `vp check`            | Format + lint + type-check (whole workspace)             |
| `vp run fix`          | Autofix format/lint issues                               |
| `vp run build`        | Build all apps (`framework-ssg` → static HTML per route) |
| `vp run test`         | Run all tests (Vitest)                                   |
| `vp run ready`        | `vp check && vp run build` — pre-push gate               |
| `vp run dev:tcm`      | Dev server for TCM app                                   |
| `vp run dev:8fold`    | Dev server for 8fold app                                 |
| `vp run dev:showcase` | Dev server for showcase app                              |
| `vp run tcm#build`    | Build one app only                                       |

**`vp build` ≠ `vp run build`** — `vp build` invokes Vite's SPA path, skipping framework-ssg. Always use `vp run build`.
**`vp test` ≠ `vp run test`** — `vp test` runs current package only. Always use `vp run test`.
**`vp check` does NOT run as part of `vp run build`** — they are separate steps. `vp run ready` runs both.

All commands from the **repo root**.

## Import rules

- `@/` is **app-local** — each app's `vite.config.ts` maps it to its own `src/`. Never use it in `packages/core/`.
- Framework source uses **relative imports only** (`./components/AppHeader.vue`).
- App code reaches the framework via package name: `@framework/core/config` — never via relative paths crossing workspace boundaries.
- Files reachable from `vite.config.ts` require **explicit `.ts` extensions** (Node ESM; no directory imports).

## Conventions

- Vue SFCs: `<script setup>` only. No Options API.
- Composables: `use*` prefix (`useConfig`, `useTheme`).
- Framework chrome components: `App*` prefix (`AppHeader`, `AppNav`). Feature components omit it.
- Tailwind 4 is CSS-first via `@theme {}`. No `tailwind.config.js` — reintroducing it is a defect.
- Utility classes for layout/spacing/color. Scoped `<style>` only for rules Tailwind can't express.
- Use declared tokens (`text-primary-600`), not arbitrary values (`[#hex]`).
- Regex literals require the `u` flag (`/\.vue$/u`). Oxlint enforces this.
- Dependency versions live in `pnpm-workspace.yaml` catalog — never edit individual `package.json` versions directly.
- `vue-router@~5.0.7` is intentional (in-dev next major). Do not upgrade to v4.
- Cross-links in markdown: `[Display](Other.md)` — resolves to `/Other`. Never hardcode `/Other`.

## New file placement

| Adding               | Where                                                                |
| -------------------- | -------------------------------------------------------------------- |
| New page in an app   | `apps/<app>/src/pages/<Slug>.md` + sidebar entry in `vite.config.ts` |
| Framework component  | `packages/core/src/components/<Name>.vue`                            |
| Composable           | `packages/core/src/composables/use<Name>.ts`                         |
| Markdown-it plugin   | `packages/core/src/markdown/<name>.ts`                               |
| Runtime utility      | `packages/core/src/runtime/<name>.ts`                                |
| New framework export | Named subpath in `packages/core/package.json` `exports`              |

## Testing

Tests colocate next to source (`useFoo.ts` + `useFoo.test.ts`), all in `packages/core/src/`. Three layers:

- **Unit** — pure logic, no DOM.
- **Composable integration** — `// @vitest-environment jsdom` docblock, minimal `defineComponent` mount.
- **Component** — `// @vitest-environment jsdom`, use `mountWithConfig` from `src/test-utils/mountWithConfig.ts`.

## Known traps

**Runtime conditionals don't tree-shake dynamic imports** — use the `__FRAMEWORK_MERMAID__` Vite define flag pattern for optional-feature chunks.

**`ERR_UNSUPPORTED_DIR_IMPORT`** — add explicit `.ts` extension to any import reachable from `vite.config.ts`.

## Links

| Need more on                                     | Read                      |
| ------------------------------------------------ | ------------------------- |
| Framework design, SSG pipeline, Azure topology   | `docs/ARCHITECTURE.md`    |
| Workspace topology and import model              | `docs/STRUCTURE.md`       |
| `vp` commands and entry-point contract           | `docs/TOOLCHAIN.md`       |
| Coding conventions (import paths, naming, CSS)   | `docs/CONVENTIONS.md`     |
| Dependency catalog and version pins              | `docs/DEPENDENCIES.md`    |
| Test layers, runner, and determinism conventions | `docs/TESTING.md`         |
| Build failures and silent prod bugs              | `docs/TROUBLESHOOTING.md` |
| CI/CD pipeline and deploy stages                 | `docs/PIPELINE.md`        |
| Security posture, CSP, and secrets inventory     | `docs/SECURITY.md`        |
| Contributing workflow and pre-PR gate            | `docs/CONTRIBUTING.md`    |
