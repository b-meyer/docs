<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## External references

- Reka UI (unstyled accessible primitives used in `AppHeader.vue`): https://reka-ui.com/llms.txt

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

<!--VITE PLUS END-->

## Project — TCM Primer (markdown reader on Vite+ / Vue 3)

A static-style reader for a Traditional Chinese Medicine primer: cross-linked markdown topic pages (foundation theory, organ deep-dives, treatment branches) rendered as a SPA with VitePress-style chrome. The sidebar manifest in `src/scripts/router.ts` is the canonical list of which pages exist. Built directly on Vite + Vue 3 — **NOT VitePress** — with `unplugin-vue-markdown` transforming `.md` into Vue SFCs at build time.

### This is NOT the `/poc` data-driven scaffold

Older `/poc` conventions explicitly do not apply here:

- No Pinia + `localStorage` data layer — content is read-only markdown. Cmd+K search state (index + UI) lives in `src/scripts/search.ts` as module-scoped refs (a module-level singleton, returned directly from `useSearch()`); nothing is persisted.
- No `data.vue` inspector or "two-layer IA" — there is no mutable data.
- No file-based routing — `unplugin-vue-router` was removed. Dropping a `.md` into `src/pages/` does NOT route it automatically.
- No `<!-- nav-start --> / <!-- nav-end -->` markers in `Header.vue`. Don't reintroduce them — `/poc` would overwrite the nav on its next run.
- The Vue components directory is `src/components/`. There is no `src/layouts/` or `src/layout/`.

## Architecture

- **Single nav manifest.** `src/scripts/router.ts` owns the `sidebar` groups, `flatOrder`, `allItems`, the slug/path helpers, and the route definitions. `allItems` (core + extra) drives route generation via `import.meta.glob('../pages/*.md')` and the search title lookup. `flatOrder` excludes groups marked `extra: true` and drives prev/next only — extras are routable and searchable but sit outside the linear sequence. Adding a topic = adding a `.md` file _and_ adding to the sidebar array. A `.md` file without a sidebar entry won't route.
- **Markdown transform pipeline.** `unplugin-vue-markdown/vite` (in `vite.config.ts`) converts `.md` into Vue SFCs at build time. It is configured to:
  - Auto-wrap every page body in `PageLayout` (`wrapperComponent: 'PageLayout'`, registered globally in `main.ts`).
  - Add kebab-case heading IDs via `markdown-it-anchor` + the shared `slugify` helper in `src/scripts/utils.ts` (also used by the search index to compute matching anchor IDs).
  - Rewrite `[X](File.md)` cross-links to `/File` SPA routes via `mdLinkRewriter` in `src/scripts/markdown.ts`. Hashes are preserved.
  - Convert ` ```mermaid ` fences to `<pre class="mermaid not-prose">…</pre>` via `mdMermaid` in `src/scripts/markdown.ts`. Other fences fall through to the default renderer.
- **Mermaid rendering.** Two-stage. Build-time fence override emits `<pre class="mermaid">`; runtime (`src/scripts/mermaid.ts`) lazy-imports `mermaid`, initializes with `theme: 'base'` and `themeVariables` resolved from the TCM `--color-*` tokens via a hidden probe `<div>` (so nested `var()` chains resolve to `rgb(...)` strings mermaid can bake into SVG attributes). `PageLayout.vue` calls `runMermaid(articleEl)` on mount and on every route change. `App.vue` installs `watchColorScheme()` once — a `MutationObserver` on `<html>` `class` that re-resolves theme vars and re-renders every processed `pre.mermaid` (originals stashed in a module-scoped `WeakMap`) when `.dark` toggles.
- **Layout.** `App.vue` is the outer shell — sticky header + `<main>` + `RouterView`. Footer-less by design (don't add one back). `PageLayout` (auto-injected by the markdown plugin) is the three-column doc chrome: `AppNav` left, prose `<article>` + inlined prev/next nav middle, `PageNav` right. `PageLayout` exposes the `<article>` element to descendants via `provide('article-el', ...)`; `PageNav` injects it and reads `h2`/`h3` nodes from there (no global DOM query) and uses `IntersectionObserver` for scroll-spy. Prev/next is computed inline in `PageLayout` from `neighbors(slugFromPath(route.path))`.
- **Routing.** Manual `routes` array in `src/scripts/router.ts`. `scrollBehavior` is configured so `/Page#anchor` URLs scroll to the heading on navigation — don't break this.
- **Styling.** Tailwind 4 + `@tailwindcss/typography`. The `prose prose-gray mx-auto max-w-[88ch]` class wraps the rendered markdown body. The inline prev/next nav and `PageNav` deliberately live _outside_ `.prose` so Typography doesn't restyle their links.
- **Theme.** `src/scripts/theme.ts` exposes a `useTheme()` composable returning module-scoped refs (`theme`, `hue`, `intensity`) plus setters. State persists to `localStorage` (`theme`, `brand-hue`, `brand-intensity`). The inline script in `index.html` reads those keys before Vue boots so `.dark` and the brand custom properties are applied pre-paint. `ThemeToggle.vue` in the header drives the same composable.
- **Search.** `src/scripts/search.ts` is the single search file — it builds an in-memory fuzzysort index from raw md (one entry per H1/H2/H3 section) at module load, exposes the `fuzzysort.go` wrapper with its heading/body scoring, and owns the open/query/selection state. The `useSearch()` export returns a plain object of module-scoped refs so each consumer destructures what it needs; templates rely on Vue's top-level ref auto-unwrap for reads and writes (e.g. `selectedIndex = idx`). The search UI is an inline bar in `AppHeader.vue` (desktop ≥sm) plus a magnifier-icon-triggered full-width overlay (mobile <sm); both reuse the same `useSearch()` state and a shared `SearchResults.vue` results pane (handles highlight rendering, list/empty/hints states, and selection scroll-into-view). The Cmd/Ctrl+K shortcut is bound in `AppHeader.vue` and focuses the appropriate input. Heading IDs come from the shared slugifier so result links land on the right anchor.
- **CI / deploy.** GitHub Actions workflow at `.github/workflows/azure-static-web-apps.yml` runs `vp check`/`vp test`/`vp build`, then `Azure/static-web-apps-deploy@v1` with `skip_app_build: true`. SPA fallback + headers in `public/staticwebapp.config.json`. Azure-side setup steps live in `deploy.md` at the repo root.

## File layout

```
src/
  components/   Vue components — outer shell, sticky chrome, auto-injected
                PageLayout (3-col doc grid), right-side outline, inline search,
                theme controls. `PageLayout` is the only architecturally
                load-bearing name (auto-injected by unplugin-vue-markdown).
  pages/        Markdown content. Source of truth for which exist + how they're
                grouped is `src/scripts/router.ts` (sidebar manifest). Pinyin/
                English PascalCase filenames; filename is the URL slug.
  scripts/      main.ts (entry), router.ts (routes+sidebar manifest), search.ts
                (fuzzysort index + useSearch composable), markdown.ts
                (mdLinkRewriter, mdTableWrapper, mdMermaid), mermaid.ts
                (runMermaid + watchColorScheme), theme.ts + reading.ts (small
                composables for persisted UI prefs), utils.ts (slugify,
                prefersReducedMotion), *.test.ts.
  styles/       main.css imports tailwind + typography + theme.css (@theme
                color tokens, .dark variant) + components.css (@layer
                components) + utilities.css (@utility nav-link / outline-link
                / eyebrow / …).
```

## Conventions

- **Adding a topic:** create `src/pages/NewTopic.md` starting with `# H1`, then add `{ slug: 'NewTopic', title: '...' }` to the appropriate group in `src/scripts/router.ts`. Filename is the URL slug verbatim. Add the group with `extra: true` to keep a page off the prev/next chain while staying routable and searchable (renders under "Additional Reading" in the sidebar).
- **Cross-linking between pages:** always `[Display](OtherFile.md)`. Never hardcode `/OtherFile` in source markdown — the rewriter is what keeps refactors safe.
- **Filenames:** Pinyin PascalCase for theory pages (e.g. `YinYang.md`, `ZangFu.md`); English PascalCase for the 12 Zang-Fu organ pages (`Liver.md`, `SmallIntestine.md`, `SanJiao.md`). Case is preserved into the URL.
- **`ZangFu.md` is the synthesis pivot.** It sits in the core chain (Synthesis & Practice group, between [JinYe.md](src/pages/JinYe.md) and [Jingmai.md](src/pages/Jingmai.md)) and is the launch point for the 12 organ deep-dives that live under "Additional Reading". When adding cross-organ content (axes, combined patterns), put it in `ZangFu.md`; organ-internal patterns belong on the specific organ page. Stub organ pages use `<!-- TODO: patterns to be written -->` markers in `Common patterns` — search for those to find what still needs writing.
- **No frontmatter wired up.** Don't rely on it; the sidebar manifest provides titles.
- **Don't enable `permalink` on `markdown-it-anchor`.** Typography would style the ¶ glyphs loudly. The right-side outline is the affordance.
- **Sidebar order (core groups only) is the canonical reading order.** It mirrors `src/pages/index.md`'s "How to read" numbered list. If you reorder one, reorder the other. Groups marked `extra: true` are listed separately under "Additional reading" in `index.md` and don't participate in prev/next.

## Gotchas

- **`vite.config.ts` defines `IGNORE_PATTERNS` as a top-level `const`.** Don't delete it — the expanded `lint:` and `fmt:` blocks (auto-injected by `vp check --fix`) reference it. Without that const, config loading fails with `ReferenceError`.
- **Regex literals need the `u` flag.** Oxlint's `unicorn/require-unicode-regexp` rule. Examples: `/\.vue$/u`, `/\.md$/u` in `vite.config.ts`; the `MD_LINK` regex in `src/scripts/markdown.ts`.
- **`import.meta.glob` patterns must be literal strings.** Vite's static analyzer can't follow variables. Hardcoded `'../pages/*.md'` (relative to `src/scripts/router.ts`) is correct.
- **Root-level `shims.d.ts` declares `*.vue` and `*.md` modules.** Don't delete — Oxlint's type-aware checks need them or imports like `@/components/App.vue` fail with TS2307. It lives at the repo root and is picked up by `tsconfig.json`'s `include`.
- **Imports use `@/` (= `src/`) regardless of which subdirectory the importing file lives in.** Don't write `../../` chains.
- **`vite.config.ts` imports its own helpers with an explicit `.ts` extension** (e.g. `from './src/scripts/markdown.ts'`). Node's ESM resolver doesn't strip extensions when loading the config file; without `.ts`, `vp dev`/`vp build` fail with `ERR_MODULE_NOT_FOUND`.
- **`vue-router@^5` is intentional.** Stable for Vue 3 is v4; this project pulls the in-development next major from `vuejs/router` to align with Vite+'s preview-grade ecosystem. Don't "fix" the version unless you're deliberately migrating.

## Deliberately absent

- Code highlighting (Shiki etc.) — markdown content has no code blocks. Mermaid fences are handled separately (see Architecture).
- Backend, persistence beyond a handful of UI prefs — content is static markdown shipped in the bundle. Only small UI prefs persist (`localStorage`); `grep -n 'localStorage.setItem' src/scripts` enumerates the current keys.
- Application Insights / monitoring / analytics — not wired up yet; see `deploy.md` follow-ups. CSP is configured in `public/staticwebapp.config.json` with `'unsafe-inline'` for scripts (theme bootstrap inline) and styles (mermaid SVG inline `<style>`).
