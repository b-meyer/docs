---
purpose: "Enumerates the project's coding conventions — import paths, naming rules, lint configuration, CSS authoring, and dependency pinning rationale."
scope: 'Convention rules enforced by tooling or code review only — toolchain commands in TOOLCHAIN, architectural design rationale in ARCHITECTURE, build failure modes in TROUBLESHOOTING.'
audience: 'Contributors writing new code (primary); agents adding features or refactoring (secondary); reviewers checking PR compliance (tertiary).'
summary: 'Import path rules (@/ alias scope, relative imports in framework, cross-workspace package names), lint and format configuration (workspace-global), Vue component and composable naming, Tailwind 4 CSS-first conventions, shims.d.ts requirements, and version pinning rationale.'
---

# Conventions

## Import paths

**`@/` is consumer-local, not workspace-wide.** Each consumer app declares an `@/` alias pointing to its own `src/`. `packages/core/` uses relative imports exclusively (e.g., `./components/AppHeader.vue`). Consumer code reaches framework modules via the package name: `@framework/core/config`, etc. _Enforcement: TypeScript path alias config — an `@/` import inside `packages/core/` resolves to nothing and fails `vp check` type-check._

**Cross-workspace imports use the package name, never relative paths.** `@framework/core/…` is stable; `../../../../packages/core/src/…` is not. _Enforcement: TypeScript module resolution — relative paths crossing workspace boundaries produce resolution errors._

**Imports reachable from `vite.config.ts` entry points require explicit `.ts` file extensions.** Vite's config loader runs as native Node ESM, which rejects directory imports and requires explicit extensions. This applies to `plugin.ts`, `vite.config.ts` itself, and any file they directly import. The TypeScript bundler resolves extension-less relative imports in the rest of the framework source. _Enforcement: Node ESM runtime throws `ERR_UNSUPPORTED_DIR_IMPORT` on first load._ See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for the failure mode.

## Lint and format

**Lint and format are workspace-global — one root config, no per-package overrides.** The root `vite.config.ts` is the single canonical config. Running `vp check` from the root covers every package.

**`.vscode/settings.json` points the oxc formatter at the root config.** Editor autoformat and CI agree on the same config.

**Regex literals require the `u` flag.** Oxlint enforces `eslint/require-unicode-regexp`: all regex literals must include `/u` (e.g., `/\.vue$/u`).

## Vue SFCs and composables

**Vue SFCs use `<script setup>` exclusively.** The Composition API + `<script setup>` form is the project default; the Options API is not used for new code.

**Composable functions carry the `use*` prefix.** Reusable reactive logic in `src/composables/` follows `useSubject` (camelCase). The prefix signals the function must be called inside a Vue setup context.

**Top-level chrome components carry the `App*` prefix.** Framework chrome (header, nav, sidebar) is named `AppSubject.vue` (PascalCase). Feature components (`ThemeToggle`, `MermaidBlock`) omit the prefix.

## CSS (Tailwind 4)

**Tailwind 4 is CSS-first via `@theme` — no `tailwind.config.js`.** Design tokens are declared in `@theme { … }` blocks. Reintroducing `tailwind.config.js` is a defect.

**Utility classes over scoped CSS for layout, spacing, and color.** Scoped `<style>` blocks are reserved for rules Tailwind can't express: multi-keyframe animations, complex selectors, deep child targeting.

**Token references over arbitrary values.** Use declared tokens (`text-primary-600`) rather than `[#hex]` or `[12px]` escape hatches.

**Don't enable `permalink` on `markdown-it-anchor`.** The `@tailwindcss/typography` plugin styles any `¶` glyph it finds, producing visual noise.

## Shims and type declarations

**`packages/core` provides type shims via `@framework/core/client` — do not delete `packages/core/shims.d.ts`.** The shim file declares module types for `*.vue`, `*.md`, and `__FRAMEWORK_MERMAID__`. Consumer apps reference these types through the `@framework/core/client` export — they no longer carry their own `shims.d.ts`.

## Dependency pinning

**`vue-router@~5.0.7` is intentional.** In-development next major aligned with Vite+. Do not "upgrade" to vue-router v4 — the APIs differ.

**Bump versions in the pnpm catalog, not individual `package.json` files.** Change the version in `pnpm-workspace.yaml` and run `vp install`. See [DEPENDENCIES.md](DEPENDENCIES.md) for the full catalog and update policy.

## Industry References

- [Vue 3 — `<script setup>`](https://vuejs.org/api/sfc-script-setup.html) — the Composition API form used by this project.
- [Tailwind CSS 4 — CSS-first configuration](https://tailwindcss.com/docs/theme) — `@theme` block grounding the no-`tailwind.config.js` rule.
- [Oxlint — `eslint/require-unicode-regexp`](https://oxc.rs/docs/guide/usage/linter.html) — the lint rule requiring the `/u` (or `/v`) flag on regex literals.
- [Reka UI](https://reka-ui.com) — the unstyled primitive library wrapped by `App*` components.

_External URLs verified 2026-06-04._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp` entry-point contract.
- [ARCHITECTURE.md](ARCHITECTURE.md) — design rationale behind the import rules.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — failure modes triggered by violating these conventions.
- [STRUCTURE.md](STRUCTURE.md) — workspace file placement rules.
- [DEPENDENCIES.md](DEPENDENCIES.md) — dependency catalog and update policy.
