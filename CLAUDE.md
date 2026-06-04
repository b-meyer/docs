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

## Project — a documentation meta-framework + two consumer sites

A **pnpm workspace**: a reusable VitePress-style documentation meta-framework in `packages/core/` (placeholder name `@framework/core`) consumed by two static sites — `apps/tcm/` (the Traditional Chinese Medicine Primer) and `apps/8fold/` (a Noble Eightfold Path primer; a deliberately minimal stub). Pages are cross-linked markdown, pre-rendered per route at build time via **vite-ssg** and hydrated as a SPA. Built directly on Vite + Vue 3 — **NOT VitePress** — with `unplugin-vue-markdown` turning `.md` into Vue SFCs at build time. Remaining / future work is tracked in [TODO.md](TODO.md).

### Workspace layout

```
docs/  (repo root → pnpm workspace)
├── package.json            workspace root: orchestration scripts only (dev/build/check/ready)
├── vite.config.ts          ONE canonical lint + format standard for the whole workspace
├── tsconfig.json           minimal root TS config (for the root vite.config.ts)
├── pnpm-workspace.yaml      workspace globs (packages/* + apps/*) + the dependency catalog
├── packages/core/          @framework/core — the meta-framework
│   ├── package.json        exports: ./config ./vite ./ssg ./sitemap ./App.vue ./styles/framework.css
│   ├── tsconfig.json       no @/* alias; allowImportingTsExtensions
│   └── src/
│       ├── config.ts       FrameworkConfig type, defineConfig, CONFIG_KEY, sidebar types
│       ├── plugin.ts       frameworkPlugin() — define-flags + vue + unplugin-vue-markdown + tailwind
│       ├── ssg.ts          createSSGApp() — wraps ViteSSG
│       ├── routerFactory.ts glob-driven routes + slug/neighbor helpers + scrollBehavior
│       ├── sitemap.ts      filterPublicRoutes + buildSitemap (Node)
│       ├── App.vue         root shell (overridable)
│       ├── components/     AppHeader (slotted), AppNav, PageLayout, PageNav,
│       │                   SearchResults, ThemeToggle, LayoutResolver, HomeLayout
│       ├── composables/    useConfig, useTheme, useReadingMode, useFrontmatter, useSearch
│       ├── runtime/        slugify, reducedMotion, mermaid, headFromFrontmatter
│       ├── markdown/       linkRewriter, tableWrapper, mermaid, containers, alerts (+ barrel)
│       ├── styles/         tokens.css, components.css, utilities.css, framework.css (barrel)
│       └── (tests/)        markdown plugin tests (run `vp test` from packages/core)
└── apps/
    ├── tcm/    framework.config.ts + src/{scripts/main.ts, Logo.vue, pages/*.md, styles/main.css}
    │           + vite.config.ts + index.html + public/ + tsconfig.json + shims.d.ts
    └── 8fold/  same shape; markdown.mermaid: false, distinct brand hue, stock prose only
```

### `vp` command map — run from the repo ROOT

**`vp` is the sole entry point — never raw `pnpm` / `npm` / `yarn`.** All of these run from the root:

| Command                               | Does                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp install`                          | Install the whole workspace (the pnpm **catalog** in `pnpm-workspace.yaml` is the version source of truth — every package references `catalog:`).  |
| `vp run dev:tcm` / `vp run dev:8fold` | Dev server for TCM / 8fold (= `vp run tcm#dev` / `vp run 8fold#dev`).                                                                              |
| `vp check` / `vp run fix`             | Lint + format + type-check the whole workspace / autofix. **One canonical config: the root `vite.config.ts`** — no per-package lint/fmt overrides. |
| `vp run build`                        | `vp run -r build` — builds every app (each app's `build` task = `vite-ssg build`). `packages/core` has no build (consumed as source).              |
| `vp run test`                         | `vp run -r test` — framework unit tests live in `packages/core`.                                                                                   |
| `vp run ready`                        | `vp check && vp run -r build` — the pre-push gate.                                                                                                 |
| `vp run <app>#<task>`                 | One app's task, e.g. `vp run tcm#build`.                                                                                                           |

`check` is a **separate root step** (not a build dependency) — the apps' `build` tasks do NOT
`dependsOn: ['check']`; `vp run ready` (and CI) run check first. CI deploys only `apps/tcm/dist`
(8fold has no deploy yet).

## Architecture (framework)

- **Config via provide/inject.** `config.ts` defines `FrameworkConfig` (title, sidebar, branding, markdown, sitemap, themeDefaults), `defineConfig` (identity fn for TS completion), `CONFIG_KEY`, and the `SidebarItem`/`SidebarGroup` types. The consumer's `framework.config.ts` is the single source of truth; `createSSGApp` does `app.provide(CONFIG_KEY, config)`, components read it via `useConfig()`.
- **Glob-driven routing.** `routerFactory.ts` `createRoutes(config, pages)` builds a route per `.md` in the consumer's `pages` glob — **every** file routes (`index`→`/`, `NotFound`→catch-all). `config.sidebar` drives nav grouping/order and prev/next ONLY, not route existence. `extra: true` groups render under "Additional reading" and sit outside prev/next. A page absent from the sidebar still routes (e.g. a `hidden: true` dev page). `slugFromPath`, `neighborsOf`, and `scrollBehavior` (the `/Page#anchor` header-offset scroll — don't break it) live here.
- **Single plugin entry.** `plugin.ts` `frameworkPlugin({ markdown })` returns the `[define-flags, vue, unplugin-vue-markdown, tailwindcss]` array (Vite flattens it). It takes ONLY the markdown options, not the full config. markdown-it plugin order is load-bearing: anchor → linkRewriter → tableWrapper → (mermaid, gated) → containers → alerts. `wrapperComponent: 'LayoutResolver'`.
- **Layouts.** `LayoutResolver` is the markdown `wrapperComponent`: it receives `frontmatter` as a prop and dispatches `<component :is>` to `HomeLayout` (`layout: home` — hero + features grid) or `PageLayout` (default — 3-col doc chrome: `AppNav` left, prose `<article>` + inline prev/next middle, `PageNav` right). `PageLayout` provides `article-el`; `PageNav` injects it for `IntersectionObserver` scroll-spy. `App.vue` is the outer shell (sticky header + `<main>` + `RouterView`); footer-less by design.
- **SSG wrapper.** `ssg.ts` `createSSGApp(App, config, { pages, rawPages })` builds routes, seeds the search index, registers global components (`LayoutResolver`/`PageLayout`/`HomeLayout`), provides the config, and returns the `ViteSSG` factory. The literal `import.meta.glob('../pages/*.md')` (+ a `?raw` eager glob, SSR-guarded) lives in the **consumer's** `main.ts` and is passed in — globs must be literal and local to the importer. Don't `await router.isReady()` in the setup fn (hangs during SSR).
- **Markdown pipeline.** `markdown-it-anchor` adds kebab heading IDs via the shared `slugify` (`runtime/slugify.ts`, also used by the search index so anchors match). `mdLinkRewriter` rewrites `[X](File.md)` → `/File` (hashes preserved). `mdTableWrapper`; `mdContainers` (`:::tip|info|warning|danger|details`); `mdAlerts` (`> [!NOTE]` …). `mdMermaid` (` ```mermaid ` → `<pre class="mermaid not-prose">`) is added only when `config.markdown.mermaid`.
- **Mermaid (config-gated, two-stage).** Build: the fence transform above. Runtime: `runtime/mermaid.ts` lazy-imports `mermaid`, themes it from the `--color-*` tokens via a hidden probe div, and re-renders on `.dark` toggle (`watchColorScheme`). Both `App.vue` (watchColorScheme) and `PageLayout` (runMermaid) load `runtime/mermaid.ts` via a dynamic import gated on the **build-time literal `__FRAMEWORK_MERMAID__`** (injected by `frameworkPlugin` via Vite `define`). When a consumer disables mermaid the dead branch + the whole mermaid chunk (+ cytoscape/katex) are tree-shaken out — 8fold's `dist` is ~424K vs TCM's ~5.7M.
- **Theme.** `composables/useTheme.ts` — module refs (`theme`, `hue`, `intensity`) + setters, persisted to `localStorage` (`theme`, `brand-hue`, `brand-intensity`). Defaults are read from the resolved CSS custom properties (so a consumer's `--brand-hue` override sets the slider start), with hardcoded fallbacks. The consumer's `index.html` pre-paint inline script applies `.dark` + brand vars before Vue boots (no flash). `ThemeToggle.vue` drives it. SSR-safe — no top-level `window`/`document`.
- **Search.** `composables/useSearch.ts` — `createSearchIndex(rawPages, config)` builds a fuzzysort index (one entry per H1/H2/H3) into a module singleton; SSR-inert (skipped server-side, kept out of rendered HTML). `useSearch()` exposes open/query/selection state + results. UI: inline bar in `AppHeader` (≥sm) + a magnifier overlay (<sm), both reusing `SearchResults.vue`; Cmd/Ctrl+K bound in `AppHeader`.
- **Styling.** Tailwind 4 + `@tailwindcss/typography`. `framework.css` (= tokens + components + utilities) carries NO `@import 'tailwindcss'` — the **consumer's** `main.css` owns that import plus an `@source` at the framework package (Tailwind ignores node_modules, so framework-only classes would otherwise be purged in prod). `tokens.css` holds the `@theme` color scale (driven by `--brand-hue`/`--brand-intensity`) + the `.dark` variant. Prose body is `.prose prose-gray max-w-[88ch]`; the prev/next nav and `PageNav` sit OUTSIDE `.prose` so Typography doesn't restyle their links.
- **CI / deploy.** `.github/workflows/azure-static-web-apps.yml` (push to `release`) runs from the repo root: `pnpm install` → `vp check` (lints the whole workspace via the root config) → `vp run tcm#build` (`vite-ssg build` → per-route HTML + `sitemap.xml`), then `Azure/static-web-apps-deploy@v1` with `skip_app_build: true` uploads `apps/tcm/dist`. Wiring an 8fold deploy (its own SWA resource + job) is tracked in `TODO.md`.

## Consumer model (how to make/maintain a site)

A consumer is **config + content**:

- **`framework.config.ts`** — `defineConfig({ title, description, sidebar, branding: { siteTitle, logoComponent }, markdown: { mermaid }, sitemap: { hostname }, themeDefaults })`. The `sidebar` array is the nav manifest (groups, `extra: true`, reading order).
- **`src/scripts/main.ts`** (the vite-ssg entry referenced by `index.html`) — the two `import.meta.glob('../pages/*.md')` calls (one lazy for routes, one `?raw` eager + SSR-guarded for search) + `createSSGApp(App, config, { pages, rawPages })`.
- **`src/pages/*.md`** — content. Filename = URL slug verbatim (PascalCase). `NotFound.md` is required (backs the catch-all).
- **`src/Logo.vue`** — brand mark, wired via `branding.logoComponent: () => import('./src/Logo.vue')` (async, browser-only — never reaches the Node config loader).
- **`src/styles/main.css`** — `@import 'tailwindcss'` + `@plugin '@tailwindcss/typography'` + `@source '../../../../packages/core/src'` + `@import '@framework/core/styles/framework.css'` + any `:root { --brand-hue: … }` brand override.
- **`vite.config.ts`** — **build settings only**: `frameworkPlugin({ markdown: { mermaid } })`, the `@` alias, `run.tasks.build = { command: 'vite-ssg build' }`, and `ssgOptions` (`dirStyle: 'nested'`, `includedRoutes` → `filterPublicRoutes`, `onFinished` → `buildSitemap`). **No `lint`/`fmt`** — those live in the root `vite.config.ts`.
- **`index.html`** — title/OG/favicon + the pre-paint theme bootstrap inline script; `shims.d.ts`, `tsconfig.json` (consumer-local `@/*`), `public/staticwebapp.config.json`.

**Adding a topic:** create `src/pages/NewTopic.md` (start with `# H1`), add `{ slug: 'NewTopic', title: '…' }` to a sidebar group in `framework.config.ts`. Cross-link with `[Display](Other.md)` — never hardcode `/Other`. `extra: true` keeps a page off prev/next but in nav/search. `hidden: true` frontmatter drops a page from SSG output + search + nav (still routable in dev). `layout: home` selects `HomeLayout`.

(TCM-specific: `ZangFu.md` is the synthesis pivot launching the 12 organ deep-dives under "Additional Reading"; organ stub pages mark unwritten sections with `<!-- TODO: patterns to be written -->`.)

## Gotchas

- **Framework source uses relative imports, never `@/`.** `@/` (= `src/`) is consumer-local — declared per-app (`apps/*/tsconfig.json` paths + the `@` alias in that app's `vite.config.ts`). `packages/core/` declares no `@/`. Consumers reach framework code via `@framework/core/…`.
- **Each consumer's `main.css` needs `@source` at the framework package** (`../../../../packages/core/src`) or framework-only Tailwind utility classes are purged in production (dev often still looks fine).
- **`plugin.ts` (and anything reachable from `vite.config.ts`) must use Node-ESM-safe specifiers** — explicit `.ts` extensions, no directory/barrel imports. Vite's config loader loads these as native ESM (a `.ts` transpile hook, but Node-style resolution); directory imports throw `ERR_UNSUPPORTED_DIR_IMPORT`. Hence `plugin.ts` imports the markdown plugins from individual `./markdown/*.ts` files, and `frameworkPlugin` takes only `{ markdown }` so `vite.config.ts` need not import the full `framework.config.ts` (which references a `.vue` logo the config loader can't process). `packages/core/tsconfig.json` sets `allowImportingTsExtensions`.
- **Mermaid gating is build-time, not runtime.** A runtime `if (config.markdown.mermaid)` would NOT exclude the chunk — a statically-present dynamic `import()` is always emitted. The gate is the `__FRAMEWORK_MERMAID__` literal (Vite `define`); the dead branch is tree-shaken. It's declared in each `shims.d.ts` (with a `no-underscore-dangle` disable for the Vite dunder convention).
- **`hasHiddenFrontmatter` scans the full leading `---…---` block** (in `sitemap.ts` and `useSearch.ts`) — a `layout: home` page's hero/features frontmatter exceeds any small line cap, so don't reintroduce one.
- **`import.meta.glob` patterns must be literal strings, local to the importer** — they live in each consumer's `main.ts` (`'../pages/*.md'`), never in the framework.
- **Regex literals need the `u` flag** (Oxlint `unicorn/require-unicode-regexp`): `/\.vue$/u`, `/\.md$/u`, the `MD_LINK` regex, etc.
- **Lint + format are workspace-global** — configured ONCE in the root `vite.config.ts` (`lint`, `fmt`, `IGNORE_PATTERNS`). App configs carry no lint/fmt. `vp check`/`vp run fix` run from the root and cover every package. (`.vscode/settings.json` points the oxc formatter at this root config.)
- **Each package has its own `shims.d.ts`** (`*.vue` + `*.md` modules + the `__FRAMEWORK_MERMAID__` global). Don't delete — type-aware lint/TS need them.
- **Don't enable `permalink` on `markdown-it-anchor`** — Typography would loudly style the ¶ glyphs; the right-side outline is the affordance.
- **`vue-router@~5.0.7` is intentional** (in-development next major, aligned with Vite+'s preview ecosystem). Don't "fix" it to v4.
- **Don't run `vp build` directly** — use `vp run build` (root, recursive) or `vp run <app>#build`, so each app's `build` task routes through `vite-ssg build`. `vp build` would run Vite+'s SPA build and bypass vite-ssg. Run `vp check` separately (or `vp run ready` = check + build).
- **`vp` is the sole entry point** — never raw `pnpm`/`npm`/`yarn` scripts. Dependency versions come from the pnpm **catalog** in `pnpm-workspace.yaml` (packages reference `catalog:`); bump a version there, not in individual `package.json` files.

## Deliberately absent

- **Shiki syntax highlighting + `::: code-group`** (planned F4, deferred to v1.1) — neither consumer ships code blocks. The markdown pipeline leaves a seam for it.
- Backend / persistence beyond UI prefs — content is static markdown in the bundle. Only `localStorage` prefs persist (`theme`, `brand-hue`, `brand-intensity`, `show-additional`).
- 8fold CI deploy — needs its own Azure SWA resource + token; the workflow deploys only `apps/tcm`.
- Monitoring / analytics — not wired (tracked in `TODO.md`). CSP in each consumer's `public/staticwebapp.config.json` uses `'unsafe-inline'` for the theme bootstrap script + mermaid's inline `<style>`.
