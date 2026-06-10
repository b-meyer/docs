---
purpose: 'Registry of project-specific failure modes that are non-obvious, silent in dev but visible in production, or produce misleading error messages.'
scope: 'Project-specific gotchas only — generic Vite/Vue/SSG troubleshooting belongs upstream. Coding conventions in CONVENTIONS; toolchain entry-point rules in TOOLCHAIN.'
audience: 'Contributors debugging unexpected build or runtime behavior (primary); agents diagnosing CI failures (secondary); maintainers auditing known issues (tertiary).'
summary: 'Three symptom-led entries: Node ESM directory import rejection, Vite static-analysis mermaid chunk inclusion, and silent search/sitemap truncation from frontmatter scan line caps.'
---

# Troubleshooting

Scope: project-specific failure modes where the symptom is misleading or the fix requires non-obvious knowledge. Out of scope: generic Vite/Vue dev advice, standard tool error messages documented upstream, coding conventions (see [CONVENTIONS.md](CONVENTIONS.md)), and toolchain entry-point rules (see [TOOLCHAIN.md](TOOLCHAIN.md)).

## ERR_UNSUPPORTED_DIR_IMPORT from vite.config.ts or plugin file

**Symptom:** Vite config load fails with `ERR_UNSUPPORTED_DIR_IMPORT` when importing from `plugin.ts`, a markdown plugin, or any file reachable from `vite.config.ts`.

**Cause:** Vite's config loader runs as native Node ESM, which does not resolve directory imports.

**Resolution:** Use explicit `.ts` file extensions on all imports reachable from `vite.config.ts` — e.g., `import { mdAlerts } from './markdown/alerts.ts'`, not `'./markdown'`.

## Mermaid (or other optional chunk) appears in bundle that should exclude it

**Symptom:** `grep -ri mermaid apps/8fold/dist/assets` returns matches despite `markdown.mermaid: false` in `vite.config.ts`.

**Cause:** A runtime conditional (`if (config.markdown.mermaid) { import('mermaid') }`) does not tree-shake the chunk. Vite's static analysis sees a reachable dynamic import and emits it regardless of the runtime value.

**Resolution:** Use the `__FRAMEWORK_MERMAID__` Vite define flag, replaced at build time with `true`/`false`. New optional-feature chunks must follow the same define flag pattern. See [ARCHITECTURE.md](ARCHITECTURE.md) § Build-time mermaid gating.

## Search results or sitemap silently missing pages with long frontmatter

**Symptom:** A page with `layout: home` doesn't appear in search results or the sitemap despite being reachable in the browser.

**Cause:** `hasHiddenFrontmatter` in `sitemap.ts` and `useSearch.ts` scans the leading `---…---` block. A line cap causes long hero/features frontmatter to exceed the cap, causing the function to miss the `hidden: true` flag.

**Resolution:** Verify `hasHiddenFrontmatter` scans the full `---…---` block without a line cap. Any reasonable frontmatter block must be scanned in its entirety.

_No industry references — all entries are project-specific failure modes with project-specific resolutions._

## Cross-references

- [CONVENTIONS.md](CONVENTIONS.md) — coding rules (import paths, shims) that prevent a class of issues above.
- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp run build` vs `vp build` distinction.
- [ARCHITECTURE.md](ARCHITECTURE.md) — mermaid gating design rationale and SSR constraints.
