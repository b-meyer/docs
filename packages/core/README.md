# @framework/core

Layered on root [CLAUDE.md](../../CLAUDE.md) + [docs/](../../docs/).

A VitePress-style **documentation meta-framework** built directly on Vite + Vue 3
(not VitePress). Cross-linked markdown pages are pre-rendered per route at build
time via [vite-ssg](https://github.com/antfu/vite-ssg) and hydrated as a SPA, with
batteries-included chrome: a configurable sidebar, local fuzzy search, a theme
toggle with live brand-hue/intensity controls, a markdown pipeline (cross-link
rewriting, callouts, GitHub alerts, optional mermaid), and a doc/home layout
dispatcher.

> **Name.** `@framework/core` is a placeholder; rename to taste with a single
> find-and-replace across the workspace.

A site built on it is **config + content** — typically `framework.config.ts`, a
thin entry, and `pages/*.md`. This repo ships two consumers: `apps/tcm` (rich:
mermaid + theme controls) and `apps/8fold` (a minimal stock-prose stub).

---

## Quickstart

From a workspace where this package is available (e.g. `"@framework/core": "workspace:*"`):

**1. Install peers** (the framework brings its own markdown/search/UI deps; you provide the runtime + Vite + Tailwind):

```
vp add vue vue-router vite-ssg @unhead/vue
vp add -D @vitejs/plugin-vue tailwindcss @tailwindcss/vite @tailwindcss/typography vite-plus
# only if you set markdown.mermaid: true ↓
vp add mermaid
```

**2. `framework.config.ts`** (repo-relative to the app root):

```ts
import { defineConfig } from '@framework/core/config';

export default defineConfig({
  title: 'My Docs',
  description: 'A short description.',
  branding: {
    siteTitle: 'My Docs',
    logoComponent: () => import('./src/Logo.vue'), // optional
  },
  markdown: { mermaid: false },
  sitemap: { hostname: 'https://example.com' },
  themeDefaults: { brandHue: 210, brandIntensity: 50 },
  sidebar: [
    { group: 'Start', items: [{ slug: 'index', title: 'Home' }] },
    { group: 'Guides', items: [{ slug: 'Install', title: 'Install' }] },
  ],
});
```

**3. `vite.config.ts`:**

```ts
import { fileURLToPath, URL } from 'node:url';
import { buildSitemap, filterPublicRoutes } from '@framework/core/sitemap';
import { frameworkPlugin } from '@framework/core/vite';
import { defineConfig } from 'vite-plus';

const PAGES_DIR = fileURLToPath(new URL('./src/pages', import.meta.url));
const DIST_DIR = fileURLToPath(new URL('./dist', import.meta.url));
let renderedPaths: string[] = [];

export default defineConfig({
  plugins: [frameworkPlugin({ markdown: { mermaid: false } })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  run: { tasks: { build: { command: 'vite-ssg build', dependsOn: ['check'] } } },
  // @ts-expect-error — ssgOptions is a vite-ssg extension
  ssgOptions: {
    dirStyle: 'nested',
    formatting: 'minify',
    includedRoutes: (paths: string[]) => (renderedPaths = filterPublicRoutes(paths, PAGES_DIR)),
    onFinished: () => buildSitemap(DIST_DIR, renderedPaths, { hostname: 'https://example.com' }),
  },
});
```

**4. `src/scripts/main.ts`** (the vite-ssg entry; point `index.html`'s module script at it):

```ts
import App from '@framework/core/App.vue';
import { createSSGApp } from '@framework/core/ssg';
import config from '../../framework.config';
import '@/styles/main.css';

const pages = import.meta.glob('../pages/*.md');
const rawPages = import.meta.env.SSR
  ? {}
  : (import.meta.glob('../pages/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
      string,
      string
    >);

export const createApp = createSSGApp(App, config, { pages, rawPages });
```

**5. `src/styles/main.css`** — you own the Tailwind import + an `@source` at this package:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@source '../../../../packages/core/src'; /* ⚠️ required — see Customization */
@import '@framework/core/styles/framework.css';
:root {
  --brand-hue: 210;
} /* optional brand override */
```

**6. Content** — `src/pages/index.md` (start with `# H1`) and a required `src/pages/NotFound.md`. Build with `vp run build`, dev with `vp dev`.

---

## Config reference (`FrameworkConfig`)

| Field                          | Type                       | Default                            | Notes                                                                                         |
| ------------------------------ | -------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `title`                        | `string`                   | —                                  | Document title base. **Required.**                                                            |
| `description`                  | `string`                   | —                                  | Meta description.                                                                             |
| `base`                         | `string`                   | `'/'`                              | Public base path (reserved).                                                                  |
| `home`                         | `{ slug; title }`          | `{ slug: 'index', title: 'Home' }` | The `/` entry shown in nav.                                                                   |
| `sidebar`                      | `SidebarGroup[]`           | —                                  | Nav manifest. **Required.** Drives grouping, reading order, prev/next.                        |
| `branding.siteTitle`           | `string`                   | `title`                            | Short name in the header / mobile drawer.                                                     |
| `branding.logoComponent`       | `() => Promise<Component>` | —                                  | Async logo SFC loader (browser-only).                                                         |
| `markdown.mermaid`             | `boolean`                  | `false`                            | Enables the mermaid fence transform + runtime. When off, mermaid is tree-shaken out entirely. |
| `sitemap.hostname`             | `string`                   | `http://localhost:5173`            | Sitemap URL host (the `PUBLIC_SITE_URL` env var still wins for CI).                           |
| `themeDefaults.brandHue`       | `number` (0–360)           | `210`                              | Starting hue. The real default also lives in your `main.css` `:root`.                         |
| `themeDefaults.brandIntensity` | `number` (0–100)           | `50`                               | Starting intensity.                                                                           |

`SidebarGroup = { group: string; items: { slug; title }[]; extra?: boolean }`.
Groups with `extra: true` render under "Additional reading" and sit **outside**
the prev/next chain (still routable + searchable).

### Page conventions

- **Filename = URL slug**, verbatim (PascalCase recommended). `index.md` → `/`, `NotFound.md` → catch-all (required).
- **Routing is glob-driven:** every `pages/*.md` routes. The sidebar drives nav/order only — a page absent from it still routes.
- **Cross-link with `[Text](Other.md)`** — rewritten to `/Other` (hashes preserved). Never hardcode `/Other`.
- **Frontmatter:** `title`, `description` (→ `<head>`), `hidden: true` (drops from SSG output + search + nav; still routable in dev), `outline: false | number[]` (right-side TOC levels), `layout: home` (hero + features — see below).
- **Markdown extras:** `:::tip|info|warning|danger|details` callouts; `> [!NOTE|TIP|IMPORTANT|WARNING|CAUTION]` alerts; ` ```mermaid ` fences (when enabled); tables auto-wrapped for scroll.

### Home layout

A page with `layout: home` renders `HomeLayout` (hero + features grid) instead of the doc layout:

```yaml
---
layout: home
hero:
  name: My Docs
  text: A tagline headline
  tagline: One sentence of supporting copy.
  image: /logo.svg
  actions:
    - { text: Get started, link: /Install, theme: brand }
    - { text: GitHub, link: /about, theme: alt }
features:
  - { icon: 📦, title: Zero config, details: …, link: /Install }
---
Markdown body renders below the features grid.
```

---

## Customization

- **Slots on the header.** If you override `App.vue`, `AppHeader` exposes `#logo`,
  `#site-title`, and `#nav-actions` slots (defaults come from `config.branding`).
  Most sites just set `branding.logoComponent` + `siteTitle` instead.
- **CSS custom properties.** Override in your `main.css` `:root`: `--brand-hue`
  (0–360), `--brand-intensity` (0–1), plus the generated `--color-primary-*` /
  `--color-gray-*` scales and `--header-h`. Dark mode is the `.dark` class.
- **Component replacement via Vite alias.** Point `resolve.alias` at your own SFC
  to override any framework component.
- **Extra markdown-it plugins.** Fork/extend via your own plugin wrapping
  `frameworkPlugin`'s output, or open an issue for a config hook.

### ⚠️ Two things that bite (and fail silently in _production_ only)

1. **`@source` is required.** Tailwind 4 ignores `node_modules` during content
   detection, so without `@source '…/packages/core/src'` in your `main.css`, every
   utility class used _only_ by framework components is purged — an unstyled prod
   build (dev usually looks fine). Verify the relative depth from your `main.css`.
2. **Reach framework code via `@framework/core/…`, never `@/`.** The `@/` alias is
   yours (maps to your app's `src/`). Framework internals use relative imports.

---

## Exports

| Specifier                              | What                                                              |
| -------------------------------------- | ----------------------------------------------------------------- |
| `@framework/core`                      | composables, types, runtime helpers                               |
| `@framework/core/config`               | `defineConfig`, `FrameworkConfig`, sidebar types, `CONFIG_KEY`    |
| `@framework/core/vite`                 | `frameworkPlugin(options)`                                        |
| `@framework/core/ssg`                  | `createSSGApp(App, config, { pages, rawPages })`                  |
| `@framework/core/sitemap`              | `filterPublicRoutes`, `buildSitemap` (Node, for `vite.config.ts`) |
| `@framework/core/App.vue`              | the default root shell                                            |
| `@framework/core/styles/framework.css` | tokens + components + utilities (no `@import 'tailwindcss'`)      |

## Not included (yet)

Shiki syntax highlighting + `::: code-group` (planned), Algolia, i18n, last-updated
git timestamps, edit-on-GitHub links. CSS variables + Vite-alias component
overrides cover most theming needs today.
