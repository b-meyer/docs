---
purpose: 'Registry of project-specific failure modes that are non-obvious, silent in dev but visible in production, or produce misleading error messages.'
scope: 'Project-specific gotchas only — generic Vite/Vue/SSG troubleshooting belongs upstream. Coding conventions in CONVENTIONS; toolchain entry-point rules in TOOLCHAIN.'
audience: 'Contributors debugging unexpected build or runtime behavior (primary); agents diagnosing CI failures (secondary); maintainers auditing known issues (tertiary).'
summary: 'Six symptom-led entries: Tailwind 4 production style purging, Node ESM directory import rejection, Vite static-analysis mermaid chunk inclusion, silent search/sitemap truncation from frontmatter scan line caps, bundler errors from non-literal glob patterns, and vite-ssg SSR router hang.'
---

# Troubleshooting

Scope: project-specific failure modes where the symptom is misleading or the fix requires non-obvious knowledge. Out of scope: generic Vite/Vue dev advice, standard tool error messages documented upstream, coding conventions (see [CONVENTIONS.md](CONVENTIONS.md)), and toolchain entry-point rules (see [TOOLCHAIN.md](TOOLCHAIN.md)).

## Production build is unstyled; dev looks correct

**Symptom:** `vp run build` renders without styles; `vp run dev:tcm` looks fine.

**Cause:** Each consumer's `src/styles/main.css` must declare `@source '../../../../packages/core/src'`. Tailwind 4 skips `node_modules` during content detection, so framework utility classes are purged from production bundles. The dev server doesn't trigger purging, masking the problem.

**Resolution:** Add the `@source` declaration to the consumer app's `main.css` pointing at `packages/core/src`. Verify the relative depth from the specific app's `main.css` location.

## ERR_UNSUPPORTED_DIR_IMPORT from vite.config.ts or plugin file

**Symptom:** Vite config load fails with `ERR_UNSUPPORTED_DIR_IMPORT` when importing from `plugin.ts`, a markdown plugin, or any file reachable from `vite.config.ts`.

**Cause:** Vite's config loader runs as native Node ESM, which does not resolve directory imports.

**Resolution:** Use explicit `.ts` file extensions on all imports reachable from `vite.config.ts` — e.g., `import { mdAlerts } from './markdown/alerts.ts'`, not `'./markdown'`.

## Mermaid (or other optional chunk) appears in bundle that should exclude it

**Symptom:** `grep -ri mermaid apps/8fold/dist/assets` returns matches despite `markdown.mermaid: false` in `framework.config.ts`.

**Cause:** A runtime conditional (`if (config.markdown.mermaid) { import('mermaid') }`) does not tree-shake the chunk. Vite's static analysis sees a reachable dynamic import and emits it regardless of the runtime value.

**Resolution:** Use the `__FRAMEWORK_MERMAID__` Vite define flag, replaced at build time with `true`/`false`. New optional-feature chunks must follow the same define flag pattern. See [ARCHITECTURE.md](ARCHITECTURE.md) § Build-time mermaid gating.

## Search results or sitemap silently missing pages with long frontmatter

**Symptom:** A page with `layout: home` doesn't appear in search results or the sitemap despite being reachable in the browser.

**Cause:** `hasHiddenFrontmatter` in `sitemap.ts` and `useSearch.ts` scans the leading `---…---` block. A line cap causes long hero/features frontmatter to exceed the cap, causing the function to miss the `hidden: true` flag.

**Resolution:** Verify `hasHiddenFrontmatter` scans the full `---…---` block without a line cap. Any reasonable frontmatter block must be scanned in its entirety.

## Bundler error: `import.meta.glob` pattern is not a string literal

**Symptom:** Build fails with a Vite/Rolldown error about `import.meta.glob` receiving a non-literal pattern, or glob results are unexpectedly empty.

**Cause:** `import.meta.glob` patterns are resolved at build time by static analysis and must be string literals at the call site — not variables or dynamically constructed strings.

**Resolution:** The two `import.meta.glob` calls must live in each consumer's `main.ts`. They cannot be moved to `@framework/core/ssg.ts` or any shared module.

## SSG build starts but never finishes (hangs silently)

**Symptom:** `vp run build` starts but never produces output and never exits. No error in terminal.

**Cause:** `await router.isReady()` inside the vite-ssg setup function. During SSR, the router lifecycle doesn't reach "ready" state within the setup execution window.

**Resolution:** Remove `await router.isReady()` from the vite-ssg setup function. The vite-ssg lifecycle manages router readiness independently. See [ARCHITECTURE.md](ARCHITECTURE.md) § SSG entry and SSR constraints.

## Industry References

- [Tailwind CSS 4 — Content detection](https://tailwindcss.com/docs/detecting-classes-in-source-files) — why `node_modules` is excluded and how `@source` overrides it.
- [vite-ssg](https://github.com/antfu/vite-ssg) — SSG lifecycle contract; router readiness constraint context.
- [Vite — Glob import](https://vite.dev/guide/features.html#glob-import) — literal pattern requirement.

_External URLs verified 2026-06-04._

## Cross-references

- [CONVENTIONS.md](CONVENTIONS.md) — coding rules (import paths, shims) that prevent a class of issues above.
- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp run build` vs `vp build` distinction.
- [ARCHITECTURE.md](ARCHITECTURE.md) — mermaid gating design rationale and SSR constraints.
