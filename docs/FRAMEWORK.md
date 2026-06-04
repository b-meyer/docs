# Plan: extract TCM Primer chrome into a reusable meta-framework

> Phase 2 of a two-phase effort. **Prerequisite: [PREPARE.md](PREPARE.md) is shipped.** The TCM site is on vite-ssg with frontmatter, custom containers, GitHub alerts, and a sitemap — but everything lives in `src/` as a single-app build. This plan lifts the chrome (routing, layout, search, theme, markdown pipeline) into a `packages/core/` workspace package, with TCM as one consumer among many.
>
> Placeholder package name: `@framework/core`. A single find-and-replace pass renames at F5.

## 1. Context

PREPARE delivered the user-facing features to the TCM site directly. This plan is pure restructure-for-distribution work: split the repo into a pnpm workspace, abstract the sidebar manifest behind `provide/inject` config, slot-ify the header, package up the markdown plugins, and add the framework-only features (Shiki syntax highlighting + code groups) that pay off when a code-heavy second consumer exists.

After FRAMEWORK ships, dropping in a new docs site is `vp add @<name>/core` + a `framework.config.ts` + a `pages/*.md` directory.

See [PREPARE.md §3.2](PREPARE.md#32-vite-ssg-integration-patterns) for the vite-ssg integration mechanics (Vite Task pattern, `ssgOptions`, `dirStyle: 'nested'`) — they're inherited unchanged. See [PREPARE.md §3.3](PREPARE.md#33-ssr-hazard-catalog-current-code) for the SSR hazard catalog — those hazards were patched in P0 and the framework extraction inherits a clean baseline.

## 2. Scope

### In — extraction work
1. Monorepo split: `packages/core/` (framework) + `apps/tcm/` (consumer). pnpm workspace.
2. `provide/inject` config: `FrameworkConfig` type + `useConfig()` composable. Sidebar manifest moves into the consumer's `framework.config.ts`; framework components inject it.
3. Slot-ification of `AppHeader.vue`: `#logo`, `#site-title`, `#nav-actions` slots; `branding.logoComponent` config field.
4. `defineConfig` helper for consumer's TS completion.
5. `frameworkPlugin(config)` — single Vite plugin import that returns the array of inner plugins.
6. `createSSGApp(App, config, { pages, rawPages })` — wrapper around `ViteSSG` that handles route generation, search-index init, and provide/inject setup.
7. Framework-only markdown features (lands once extraction is in place):
   - Shiki syntax highlighting with dual light/dark theme.
   - Code groups (`::: code-group` with tabbed children).
   - `CodeGroup.vue` component using reka-ui's `TabsRoot/List/Trigger/Content`.
8. `packages/core/README.md` with quickstart, config reference, customization guide.
9. Rename `@framework/core` → real name.

Plus, picked up from PREPARE's deferred list:
- **Home layout (hero + features grid) selected via `layout: home` frontmatter, dispatched by a new `LayoutResolver` wrapperComponent.** Lands in F3 (see §5). PREPARE kept `wrapperComponent: 'PageLayout'` directly; FRAMEWORK introduces `LayoutResolver.vue` as the dispatcher between `PageLayout` and the new `HomeLayout`, plus optionally migrates `apps/tcm/src/pages/index.md` to use it.

### Out — explicitly deferred
- **Edit-on-GitHub link.** Removed from v1 scope entirely. If reintroduced later, the natural shape is a `config.editLink.pattern` field with `:path` substitution from the resolved page source.
- **Algolia DocSearch, i18n, math, last-updated git timestamps, sidebar collapsibility, snippet imports, Shiki transformers (focus/diff/error), dynamic routes, data loaders, MPA mode, page transitions, link prefetch, RSS, multiple custom layouts beyond doc/home, formal theme-extends mechanism** — all v1.1+ (CSS vars + Vite-alias component overrides are sufficient for v1).
- **`useFrontmatter()` / `headFromFrontmatter()`** — these composables already exist in TCM's `src/scripts/` from PREPARE P1/P2. Extraction copies them to `packages/core/src/` largely unchanged.

## 3. Research findings

### 3.1 Configuration / theme / customization surface (informs F2 + F5)

The framework's API surface, drawn from the VitePress comparison. Items struck through are deferred for v1.

**Configuration surface (`framework.config.ts`)**
- `title`, `description`, `base`, `lang` — CRITICAL
- `head`, `titleTemplate` — STANDARD
- `srcDir`, `outDir` — CRITICAL
- `cleanUrls` — CRITICAL
- `appearance` (light/dark/auto) — STANDARD
- `markdown` (parser config) — CRITICAL
- `vite` (raw passthrough) — STANDARD
- `~~lastUpdated~~`, `ignoreDeadLinks` — STANDARD (lastUpdated deferred)
- `~~rewrites~~`, `~~srcExclude~~`, `~~mpa~~`, `~~metaChunk~~` — deferred
- Build hooks: `buildEnd`, `~~postRender~~`, `~~transformHead~~`, `~~transformHtml~~`, `~~transformPageData~~` — only `buildEnd` in v1 (used for sitemap, set in [PREPARE.md](PREPARE.md) §3.2)

**Theme config**
- `logo`, `siteTitle`, `nav` (with dropdowns) — CRITICAL
- `sidebar` (object or array, groups) — CRITICAL
- `aside`, `outline` — STANDARD
- `socialLinks` — STANDARD
- `~~editLink~~` — deferred (removed from v1 scope; see §2 Out)
- `~~externalLinkIcon~~`, `~~docFooter~~`, `~~footer~~` — deferred (consumer can override via slot)
- `~~lastUpdated theme config~~` — deferred
- `search` (local) — STANDARD (already have via fuzzysort)
- `~~algolia~~`, `~~carbonAds~~`, `~~i18nRouting~~` — deferred
- `~~darkModeSwitchLabel~~` and other mobile labels — deferred or hardcoded English

**Customization mechanisms**
- Theme entry / enhanceApp hook — STANDARD (provided via vite-ssg `setupFn` and the consumer's `main.ts`)
- Layout slots — STANDARD (IN — slots on `AppHeader`: `#logo`, `#site-title`, `#nav-actions`)
- `~~Theme extends pattern~~` — deferred (CSS vars + Vite-alias component overrides are sufficient v1)
- CSS variables for theming — CRITICAL (already have via `tokens.css`)
- Component replacement via Vite alias — STANDARD (works out of the box; documented in README)
- `~~Dynamic routes~~`, `~~Data loaders~~` — deferred

**Markdown features unique to FRAMEWORK (added in F3)**
- Shiki syntax highlighting — CRITICAL (only matters for code-heavy consumers)
- Line highlighting (` ```js {4,6-8} `) — STANDARD (free with Shiki)
- `~~Line numbers, focus mode, diff markers, error/warning markers~~` — Shiki transformers, deferred
- Code groups (`::: code-group`) — STANDARD
- `~~Snippet imports (<<<)~~`, `~~Region imports~~` — deferred

**Developer ergonomics**
- HMR on markdown / config changes — CRITICAL (free via Vite, unchanged from PREPARE)
- Dev server — CRITICAL (`vp dev` continues to work)
- `defineConfig` helper with TS types — STANDARD (IN — exported from `@framework/core/config`)
- `~~Setup wizard / init~~`, `~~Build-time dead-link error messages~~` — deferred

### 3.2 Pointers to PREPARE research

The vite-ssg integration patterns ([PREPARE.md §3.2](PREPARE.md#32-vite-ssg-integration-patterns)) and the SSR hazard catalog ([PREPARE.md §3.3](PREPARE.md#33-ssr-hazard-catalog-current-code)) apply unchanged to the framework. F1 inherits the SSR-safe baseline; F2 inherits the Vite Task + `ssgOptions` config; F4 inherits the Mermaid + search SSR strategies.

## 4. Architecture

### 4.1 Monorepo shape

```
tcm/  (repo root → pnpm workspace)
├── pnpm-workspace.yaml          packages: ['packages/*', 'apps/*']
├── package.json                 workspace root, no app deps
├── packages/
│   └── core/                    the framework package
│       ├── package.json         name: @framework/core (placeholder), peer deps below
│       ├── README.md            quickstart + config reference + customization
│       ├── src/
│       │   ├── index.ts         re-exports the public surface
│       │   ├── config.ts        defineConfig + FrameworkConfig type + CONFIG_KEY symbol
│       │   ├── plugin.ts        Vite plugin factory (frameworkPlugin)
│       │   ├── ssg.ts           createSSGApp wrapper around ViteSSG
│       │   ├── App.vue          framework's root shell (overridable)
│       │   ├── routerFactory.ts createRoutes(config, pagesGlob) and scrollBehavior
│       │   ├── searchFactory.ts createSearchIndex(rawPages, config)
│       │   ├── sitemap.ts       buildSitemap helper (called from onFinished)
│       │   ├── components/
│       │   │   ├── PageLayout.vue
│       │   │   ├── HomeLayout.vue
│       │   │   ├── LayoutResolver.vue   ← registered as Markdown wrapperComponent (F3)
│       │   │   ├── AppHeader.vue         (with #logo, #site-title, #nav-actions slots)
│       │   │   ├── AppNav.vue
│       │   │   ├── PageNav.vue
│       │   │   ├── SearchResults.vue
│       │   │   ├── ThemeToggle.vue
│       │   │   └── CodeGroup.vue
│       │   ├── composables/
│       │   │   ├── useConfig.ts          inject CONFIG_KEY
│       │   │   ├── useTheme.ts           SSR-safe; hydrates on client
│       │   │   ├── useReadingMode.ts     SSR-safe
│       │   │   ├── useSearch.ts          reads module singleton
│       │   │   └── useFrontmatter.ts     reads current route's .md frontmatter export
│       │   ├── markdown/
│       │   │   ├── linkRewriter.ts       (existing mdLinkRewriter)
│       │   │   ├── tableWrapper.ts       (existing mdTableWrapper)
│       │   │   ├── mermaid.ts            (existing mdMermaid, opt-in)
│       │   │   ├── containers.ts         (from PREPARE)
│       │   │   ├── alerts.ts             (from PREPARE)
│       │   │   ├── codeGroup.ts          ::: code-group → <CodeGroup>  (F3)
│       │   │   └── shiki.ts              @shikijs/markdown-it wrapper  (F3)
│       │   ├── runtime/
│       │   │   ├── mermaid.ts            runMermaid + watchColorScheme (existing)
│       │   │   ├── slugify.ts            (existing)
│       │   │   ├── reducedMotion.ts      (existing)
│       │   │   └── headFromFrontmatter.ts  (from PREPARE)
│       │   └── styles/
│       │       ├── tokens.css            CSS custom properties + .dark variant
│       │       ├── components.css        .callout, .alert, .table-wrap, pre.mermaid
│       │       └── utilities.css         @utility nav-link / outline-link / eyebrow / scrollbar
│       └── tests/
│           ├── linkRewriter.test.ts
│           ├── containers.test.ts
│           ├── alerts.test.ts
│           ├── codeGroup.test.ts
│           └── shiki.test.ts
└── apps/
    └── tcm/                     the TCM site as a thin consumer
        ├── package.json         depends on @framework/core via workspace:*
        ├── vite.config.ts       uses framework's Vite plugin
        ├── framework.config.ts  sidebar, branding, theme, mermaid: true
        ├── index.html           consumer-owned (title, OG, favicon, theme bootstrap script)
        ├── public/
        │   └── staticwebapp.config.json
        └── src/
            ├── main.ts          createSSGApp factory call
            ├── App.vue          (optional override; usually omitted)
            ├── Logo.vue         brand logo SFC
            ├── pages/           the .md files (unchanged)
            └── styles/
                └── main.css     consumer Tailwind imports + brand-hue defaults
```

### 4.2 Peer dependencies

Framework declares as **peers** (consumer installs):
- `vue ^3.5`
- `vue-router ~5.0.7`
- `vite ^7` (Vite+ core)
- `tailwindcss ^4`
- `@tailwindcss/typography`
- `vite-ssg`
- `@unhead/vue`
- `mermaid` (only if consumer enables `markdown.mermaid: true`)

Framework **bundles** (its own deps):
- `markdown-it`, `markdown-it-anchor`, `markdown-it-container`
- `unplugin-vue-markdown`
- `@shikijs/markdown-it` + `shiki` (added in F3)
- `fuzzysort`
- `reka-ui` (Dialog, Popover, Slider, Switch, Tabs primitives)
- `@heroicons/vue` (icon set)

### 4.3 Consumer surface

**`framework.config.ts`** — typed via `defineConfig`:
```ts
import { defineConfig } from '@framework/core/config';

export default defineConfig({
  title: 'TCM Primer',
  description: 'A reader for a Traditional Chinese Medicine primer.',
  base: '/',
  pagesDir: 'src/pages',
  sidebar: [
    {
      group: 'Foundation',
      items: [
        { slug: 'YinYang', title: 'Yin & Yang (Dao)' },
        { slug: 'WuXing', title: 'Wu Xing (Five Phases)' },
      ],
    },
    // … same shape as today's src/scripts/router.ts sidebar export
  ],
  branding: {
    siteTitle: 'TCM',
    logoComponent: () => import('./src/Logo.vue'),
  },
  markdown: {
    mermaid: true,
    shiki: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  sitemap: {
    hostname: 'https://tcm-primer.example.com',
  },
  themeDefaults: {
    brandHue: 210,
    brandIntensity: 50,
  },
});
```

**`vite.config.ts`** (consumer):
```ts
import { defineConfig } from 'vite-plus';
import frameworkPlugin from '@framework/core/vite';
import config from './framework.config';

const IGNORE_PATTERNS: string[] = ['dist', 'node_modules'];

export default defineConfig({
  plugins: [frameworkPlugin(config)],
  run: {
    tasks: {
      build: { command: 'vite-ssg build', dependsOn: ['check'] },
    },
  },
  // @ts-expect-error ssgOptions is a vite-ssg extension not declared on Vite+'s UserConfig
  ssgOptions: {
    dirStyle: 'nested',
    formatting: 'minify',
    includedRoutes: (paths: string[]) => paths.filter((p) => !p.startsWith('/NotFound')),
    onFinished: () => {
      // Sitemap is wired by the framework plugin; consumer just declares hostname in config.
    },
  },
  // lint / fmt blocks (vp-managed) reference IGNORE_PATTERNS
});
```

**`src/main.ts`** (consumer, createSSGApp shape):
```ts
import { createSSGApp } from '@framework/core/ssg';
import App from '@framework/core/App.vue';
import config from '../framework.config';
import '@framework/core/styles/main.css';

const pages = import.meta.glob('./pages/*.md');
const rawPages = import.meta.glob('./pages/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const createApp = createSSGApp(App, config, { pages, rawPages });
```

`createSSGApp` is the framework's wrapper around `ViteSSG`. It:
- Builds routes from `config.sidebar` + the `pages` glob via `createRoutes(config, pages)`.
- Builds the search index from `rawPages` via `createSearchIndex(rawPages, config)`.
- Installs `vue-router`, `@unhead/vue`, and any global components (`PageLayout`, `HomeLayout`, `LayoutResolver`, `CodeGroup`).
- Calls `app.provide(CONFIG_KEY, config)` so deep components can `useConfig()`.
- Returns the `ViteSSG` factory result.

## 5. Milestones

Each milestone is a coherent stop-the-world checkpoint where the site still works end-to-end. Don't merge a half-done milestone.

### F1 — Monorepo skeleton (½ day)

**Goal:** repository becomes a pnpm workspace with an empty framework package and the TCM app moved under `apps/tcm/`. App still builds identically — same SSG output as end of PREPARE.

**Steps:**
1. Add `pnpm-workspace.yaml` with `packages: ['packages/*', 'apps/*']`.
2. Create `packages/core/package.json` with placeholder name `@framework/core`, the peer-deps + bundled-deps lists from §4.2, and an `exports` map that will be populated as code moves in.
3. Move `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `shims.d.ts` under `apps/tcm/`. Keep `.github/` at the repo root but update `.github/workflows/azure-static-web-apps.yml`:
   - Add `defaults: { run: { working-directory: apps/tcm } }` at the job level, OR set `working-directory: apps/tcm` on the install/check/test/build steps.
   - Change the SWA deploy action input `app_location: "dist"` → `app_location: "apps/tcm/dist"` (the SWA action runs from the repo root regardless of step-level `working-directory`).
   - Keep `skip_app_build: true`.
   - The `Build` step continues to invoke `pnpm exec vp build` unchanged — Vite Task in `apps/tcm/vite.config.ts` is what routes the call to `vite-ssg build` ([PREPARE.md §3.2](PREPARE.md#32-vite-ssg-integration-patterns)). No workflow-side command change needed.

   Update each package's `tsconfig.json`:
   - `apps/tcm/tsconfig.json`: `paths: { "@/*": ["./src/*"] }`, `include: ["src/**/*", "src/**/*.vue", "shims.d.ts"]`.
   - `packages/core/tsconfig.json`: `paths: { "@/*": ["./src/*"] }`, `include: ["src/**/*", "src/**/*.vue", "shims.d.ts"]`.
   - Both `@/*` aliases are package-local — they never cross the package boundary. Consumer imports framework code only via `@framework/core/...`. Document this in `packages/core/README.md` (F6).
4. Root `package.json` becomes a workspace root (`"private": true`, no app deps, only dev tooling shared across packages if any).
5. `apps/tcm/package.json` depends on `@framework/core` via `"workspace:*"`.

**Verify:** `vp install` from the root succeeds. `vp dev` from `apps/tcm/` produces the working site. `vp build` produces the working `dist/` (still functioning SSG site from PREPARE; no code moved yet).

### F2 — Code extraction + provide/inject + slot AppHeader (1–2 days)

**Goal:** generic code lives in `packages/core/src/`; TCM-specific code (sidebar manifest, branding, logo, edit-link pattern, sitemap hostname) lives in `apps/tcm/framework.config.ts`. App behavior unchanged.

**Steps:**

1. Move all `apps/tcm/src/components/*.vue` (App.vue, AppHeader.vue, AppNav.vue, PageNav.vue, SearchResults.vue, ThemeToggle.vue, PageLayout.vue) into `packages/core/src/components/`.

2. Move `apps/tcm/src/scripts/*.ts` (search.ts, theme.ts, reading.ts, mermaid.ts, utils.ts, page.ts, head.ts, sitemap.ts → reorganized into `composables/`, `runtime/` subdirs as appropriate) into `packages/core/src/`. `markdown.ts` splits into `packages/core/src/markdown/linkRewriter.ts`, `tableWrapper.ts`, `mermaid.ts`, `containers.ts`, `alerts.ts`.

3. Split `apps/tcm/src/scripts/router.ts`:
   - Pure factory in `packages/core/src/routerFactory.ts` — takes `config` + resolved `pages` glob, returns `{ routes, flatOrder, allItems, slugFromPath, neighbors, scrollBehavior }`.
   - Consumer keeps no router code; the `createSSGApp` wrapper handles it.

4. Move `apps/tcm/src/styles/*.css` into `packages/core/src/styles/`. Consumer's `apps/tcm/src/styles/main.css` keeps only Tailwind import + brand-hue defaults; framework's main.css imports all framework styles.

5. **Introduce `provide/inject` config:**
   - Define `FrameworkConfig` type and `CONFIG_KEY = Symbol('framework-config')` in `packages/core/src/config.ts`.
   - Components currently importing the sidebar from `router.ts` (AppNav, PageNav for prev/next, SearchResults indirectly) instead call `useConfig()` (which `inject(CONFIG_KEY, throwIfMissing)`).
   - `createSSGApp` calls `app.provide(CONFIG_KEY, config)` in vite-ssg's `setupFn`.

6. **Slot-ify `AppHeader`:**
   - Hard-coded `TCM` brand string + SVG logo → two named slots `#logo` and `#site-title`.
   - Default fallback uses `config.title` and `config.branding.siteTitle`.
   - Consumer override path: pass `branding.logoComponent` in `framework.config.ts` — `AppHeader.vue` dynamically imports it.

7. **Search factory.** Move the `import.meta.glob` raw-page collection out of `search.ts` (globs must be literal in the consumer). Framework exposes `createSearchIndex(rawPages, config)`; consumer's `main.ts` calls it once at boot via `createSSGApp`. `useSearch()` reads from the resulting module singleton.

8. **Sitemap helper takes `config`.** Move `apps/tcm/src/scripts/sitemap.ts` → `packages/core/src/sitemap.ts`. Signature becomes `buildSitemap(config, outDir)`. Hostname read from `config.sitemap.hostname`.

**Verify:** TCM site behavior unchanged. All imports from `@framework/core/...` resolve. No `@/scripts/...` imports remain in `apps/tcm/src/` except for the consumer's own modules (Logo.vue, framework.config.ts).

### F3 — Home layout + LayoutResolver (½–1 day)

**Goal:** the framework supports a hero+features home layout via `layout: home` frontmatter. A new `LayoutResolver.vue` wrapper dispatches between `PageLayout` (default) and `HomeLayout` based on the frontmatter prop.

**Steps:**

1. **`LayoutResolver.vue`** in `packages/core/src/components/`:
   - Receives `frontmatter` as a prop (auto-passed by `unplugin-vue-markdown` to the `wrapperComponent`).
   - Dispatches `<component :is="…">` between `PageLayout` (default) and `HomeLayout` (`layout: home`). Passes the default slot through.
   - Structured to extend: adding a third layout later is one more `<component :is>` branch.

2. **`HomeLayout.vue`** in `packages/core/src/components/` — frontmatter-driven hero + features grid. Sample frontmatter shape:
   ```yaml
   ---
   layout: home
   hero:
     name: TCM Primer
     text: Foundation theory to daily practice
     tagline: A structured introduction to Traditional Chinese Medicine.
     image: /favicon.svg
     actions:
       - { text: Start reading, link: /YinYang, theme: brand }
   features:
     - { icon: ..., title: Yin & Yang, details: ..., link: /YinYang }
     - { icon: ..., title: Wu Xing, details: ..., link: /WuXing }
   ---
   ```
   Implementation: Tailwind-only, no new CSS file. CSS grid for features, flexbox for hero. Receives `frontmatter` via prop. Calls `headFromFrontmatter(frontmatter)` (the helper from PREPARE).

3. **Switch `wrapperComponent`** in `frameworkPlugin` (in `packages/core/src/plugin.ts`) from `'PageLayout'` to `'LayoutResolver'`. Register `LayoutResolver`, `HomeLayout`, and `PageLayout` as global components in `createSSGApp`'s setupFn.

4. **TCM homepage migration (optional, user-gated).** `apps/tcm/src/pages/index.md` can switch from prose to `layout: home` + hero + features for the ten core topics. The long "Working vocabulary" / "Concept cross-reference" sections either move to a new `Reference.md` (sidebar "Additional Reading") or live as markdown body below the features grid (HomeLayout renders the body in a slot under the grid). Defer this content decision until the user reviews at F3 — the framework feature ships regardless of whether TCM adopts it.

**Verify:** `vp dev` on a page with `layout: home` renders the hero + features grid; pages without that frontmatter still render via `PageLayout` unchanged. Toggling `layout: home` on/off swaps the layout cleanly. `vp test` + `vp check` green. Parity check (F5) still passes for all non-home pages.

### F4 — Framework-only markdown features: Shiki + code groups (1 day)

**Goal:** framework supports code-heavy consumers via Shiki syntax highlighting with dual themes and `::: code-group` tabbed code blocks. TCM doesn't use these (CLAUDE.md "Deliberately absent: Code highlighting") but they're standard expectations for a docs framework.

**Steps:**

1. **Plugin factory** in `packages/core/src/plugin.ts`:
   ```ts
   import vue from '@vitejs/plugin-vue';
   import Markdown from 'unplugin-vue-markdown/vite';
   import anchor from 'markdown-it-anchor';
   import tailwindcss from '@tailwindcss/vite';
   import shikiMarkdownItPlugin from '@shikijs/markdown-it';
   import {
     mdLinkRewriter, mdTableWrapper, mdMermaid,
     mdContainers, mdAlerts, mdCodeGroup,
   } from './markdown';
   import { slugify } from './runtime/slugify';
   import type { FrameworkConfig } from './config';

   export default function frameworkPlugin(config: FrameworkConfig) {
     return [
       vue({ include: [/\.vue$/u, /\.md$/u] }),
       Markdown({
         wrapperComponent: 'LayoutResolver',
         exportFrontmatter: true,
         markdownItOptions: { html: true, linkify: true, typographer: true },
         markdownItSetup(md) {
           md.use(anchor, { permalink: false, slugify });
           md.use(mdLinkRewriter);
           md.use(mdTableWrapper);
           if (config.markdown?.mermaid) md.use(mdMermaid);
           md.use(mdContainers);
           md.use(mdAlerts);
           md.use(mdCodeGroup);
           md.use(shikiMarkdownItPlugin, {
             themes: config.markdown?.shiki?.themes ?? { light: 'github-light', dark: 'github-dark' },
           });
         },
       }),
       tailwindcss(),
     ];
   }
   ```

2. **`mdCodeGroup`** in `packages/core/src/markdown/codeGroup.ts` (40–60 LOC): variant of `markdown-it-container` that recognizes `::: code-group`. Children are fenced code blocks; the plugin emits a `<CodeGroup>` Vue component (registered globally by `createSSGApp`) that renders tabs above and the corresponding fence below. Tab labels derive from the fence's first line if it's a `// [!code label]` directive, otherwise from the language name.

3. **`CodeGroup.vue`** in `packages/core/src/components/` (≤100 LOC): plain Vue 3 component using reka-ui's `TabsRoot`/`TabsList`/`TabsTrigger`/`TabsContent` (confirmed available in `reka-ui@2.9.7`).

4. **Shiki integration** in `packages/core/src/markdown/shiki.ts`: thin wrapper around `@shikijs/markdown-it` with `themes: { light, dark }`. Output is dual-themed HTML — each token gets two inline color styles (`color: …; --shiki-dark: …`). Framework's `.dark` variant CSS overrides via the `--shiki-dark` custom property. No runtime re-highlight needed on dark toggle.

5. **Tests** in `packages/core/tests/`: `codeGroup.test.ts` and `shiki.test.ts` follow the existing markdown-it plugin pattern (vite-plus/test, instantiate MarkdownIt, `md.use(plugin)`, assert output HTML). Also move the PREPARE-era tests into `packages/core/tests/` next to the new ones (`linkRewriter.test.ts`, `tableWrapper.test.ts`, `containers.test.ts`, `alerts.test.ts`).

6. **Kitchen-sink page update.** Add code groups + Shiki-highlighted code blocks to `apps/tcm/src/pages/_kitchen.md` (still `hidden: true`) so the manual smoke test exercises them. TCM's real content stays code-block-free. Optionally add a second hidden page with `layout: home` to smoke-test the F3 layout dispatcher.

**Verify:** `vp dev` on the kitchen page renders code blocks (dual-themed) and code groups (tab-switching) in both light and dark mode. `vp test` runs all plugin tests green. `vp check` is clean. Real TCM pages (no code blocks) bundle-size unchanged within rounding.

### F5 — Consumer cleanup + extraction-parity validation (½ day)

**Goal:** `apps/tcm/src/` contains only consumer-specific code; visual parity vs the end-of-PREPARE snapshot is verified (modulo deliberate homepage migration in F3, if adopted).

**Steps:**

1. Audit `apps/tcm/src/`:
   - `main.ts` — ≤20 lines, just `createSSGApp(...)`.
   - `App.vue` — only if consumer wants to override the framework default (usually omitted; consumer relies on `@framework/core/App.vue`).
   - `Logo.vue` — brand SVG.
   - `pages/*.md` — content (and `_kitchen.md` hidden).
   - `styles/main.css` — Tailwind import + brand-hue defaults.
   - `framework.config.ts` — config object.
   - `vite.config.ts` — plugin import + `run.tasks` + `ssgOptions`.
   - `tsconfig.json`, `shims.d.ts` — TS setup (most of `shims.d.ts` can move into the framework's exported types).
   - `index.html` — consumer-owned title, OG, favicon, theme bootstrap script.

   Delete anything else.

2. **Parity check against the end-of-PREPARE snapshot:**
   - Every URL renders the same prose.
   - Every anchor scroll lands at the right heading offset.
   - Every Cmd+K search hit goes to the right `slug#anchor`.
   - Every mermaid diagram renders in both light and dark.
   - Every cross-link clicks through correctly.
   - Theme toggle + hue/intensity sliders persist across reload.
   - Skip-to-content link works.

3. Document any deliberate behavior differences in a `MIGRATION.md` at the repo root. Expect at most one: if F3's optional homepage migration was adopted, the index page changed from prose to hero+features. All other pages should be visually identical.

**Verify:** No regressions vs the end-of-PREPARE snapshot (except the deliberate homepage migration from F3, if adopted). `vp check` + `vp test` + `vp build` all green.

### F6 — Distribution polish (½ day)

**Goal:** the framework is ready for a second consumer (and eventual npm publication).

**Steps:**

1. **`packages/core/README.md`:**
   - Quickstart: `vp add @<name>/core` + minimal `vite.config.ts` + minimal `framework.config.ts` + minimal `main.ts` + a sample page.
   - Config reference: every field on `FrameworkConfig` with type, default, and a one-line description.
   - Customization guide:
     - Slots on `AppHeader` (`#logo`, `#site-title`, `#nav-actions`).
     - CSS custom properties to override (`--color-primary-*`, `--color-gray-*`, `--header-h`, `--brand-hue`, `--brand-intensity`).
     - Component replacement via Vite alias.
     - Adding markdown-it plugins via a config hook.

2. **`packages/core/src/config.ts`** exports `defineConfig` as the identity function with full TS typing so consumer config files get IDE completion.

3. **Rename `@framework/core` → real name** (single find-and-replace; the user picks the name at this point).

4. **Optional second consumer** at `apps/docs/` — a tiny docs site that documents the framework itself. Dogfoods the public surface (including `layout: home`), catches API rough edges. Skip if time-constrained.

**Verify:** Quickstart in the README, executed against a fresh directory, produces a working docs site. TS completion fires in the consumer's `framework.config.ts`. `vp check` + `vp test` + `vp build` all green across both packages.

## 6. Critical patterns (reference)

### 6.2 `provide/inject` config

`createSSGApp`'s setupFn calls `app.provide(CONFIG_KEY, config)`. Consumer components call `useConfig()` which `inject(CONFIG_KEY, throwIfMissing)`. Avoids prop drilling, makes testing trivial (provide a stub config).

### 6.3 Markdown-it plugin module shape

Every `md.use(...)` plugin in `packages/core/src/markdown/*.ts` is a default-exported function `(md: MarkdownIt) => void`. Composes cleanly; tests follow the existing pattern (vite-plus/test, instantiate MarkdownIt, `md.use(plugin)`, assert rendered HTML). Same shape introduced in [PREPARE.md §6.3](PREPARE.md#63-markdown-it-plugin-module-shape) for containers/alerts; F3 adds two more (`codeGroup`, `shiki`) following the same convention.

### 6.4 Mermaid opt-in

Only enabled when `config.markdown.mermaid === true`. The runtime `import('mermaid')` in `packages/core/src/runtime/mermaid.ts` is dynamic so the bundle is unaffected when disabled. PREPARE has it always-on (TCM uses it); FRAMEWORK gates it via config so non-mermaid consumers don't ship the dep.

### 6.5 vite-ssg `setupFn` responsibilities

Inside the `({ app, router, isClient, initialState }) => { … }` callback in `createSSGApp`:
- Install Vue plugins (router is already wired by ViteSSG; @unhead/vue is auto-installed).
- Register global components (`PageLayout`, `CodeGroup`).
- Call `app.provide(CONFIG_KEY, config)`.
- Do NOT `await router.isReady()` — hangs during SSR.

## 7. Open questions / decisions

- **Framework name.** Locked as `@framework/core` placeholder through F5. User picks at F6 (single find-and-replace).
- **TCM homepage migration in F3.** Optional and user-gated. The `layout: home` feature ships in F3 regardless; whether TCM's `index.md` adopts it is a content decision. Default is to keep the prose homepage; switch only if the user signs off on the migration during F3.
- **Code highlighting transformers** (focus/diff/error). Deferred. Shiki's transformer API is straightforward to add later via the plugin's markdown setup hook.
- **Custom layout discovery beyond doc/home.** Deferred. `LayoutResolver` (added in F3) is structured to make adding a third layout (e.g., `layout: page` full-width) trivial later — just extend the `<component :is>` dispatch.
- **Bundle size budget.** Before F1 vs after F6. The framework adds Shiki (~200KB compressed) in F4 + reka-ui Tabs. Capture the delta in the F6 verify block; document in README.
- **Second consumer at `apps/docs/`.** Optional in F6. Strongly recommended if the framework will be published — it's the cheapest way to catch API rough edges.

## 8. Verification (cross-cutting)

In addition to each milestone's verification block:

1. **`vp check` + `vp test`** after every milestone. Tests added in F4 for the new markdown-it plugins (and moved from PREPARE) must stay green.
2. **`vp build` smoke** at F1 (still PREPARE site) and after F5 (extracted but identical, with home layout available): per-route HTML, sitemap.xml present, `view-source` shows pre-rendered prose, no SSR errors.
3. **`vp dev` smoke** at every milestone: cold start, HMR on `.md` change, route navigation, Cmd+K search, theme toggle. After F3, also smoke the layout dispatcher (toggle a page's `layout: home`).
4. **Side-by-side parity** at F5: end-of-PREPARE snapshot vs post-F5 SSG output should be visually identical at every URL — except the deliberate homepage migration if F3's optional TCM adoption was taken.
5. **Bundle size budget.** Snapshot at end of PREPARE; re-measure after F6. The framework's Shiki + reka-ui Tabs add weight that's only relevant for code-heavy consumers — TCM's actual emitted bundle should stay near-flat (Shiki is dynamic-imported through the markdown plugin pipeline only when the consumer enables it).

## 9. Sequencing summary

| F | Title | Duration | Cumulative |
|---|---|---|---|
| F1 | Monorepo skeleton | ½ day | ½ |
| F2 | Code extraction + provide/inject + slot AppHeader | 1–2 days | 1.5–2.5 |
| F3 | Home layout + LayoutResolver | ½–1 day | 2–3.5 |
| F4 | Framework-only markdown features (Shiki, code groups) | 1 day | 3–4.5 |
| F5 | Consumer cleanup + extraction-parity validation | ½ day | 3.5–5 |
| F6 | Distribution polish + README + rename | ½ day | 4–5.5 |

**Total: 4–5.5 working days.** F1–F2 carry the most risk (extraction boundary, provide/inject wiring); F3 introduces the layout dispatcher (small but new component); F4–F6 are additive and mechanical.

Combined with [PREPARE.md](PREPARE.md) (3–5 days), the full effort is **7–10.5 working days** — same envelope as the original unsplit plan, now phased so the TCM site ships its core upgrades first and the framework extraction can layer home-layout and code-block support on a stable SSG baseline.
