# qdocs

A VitePress-style **documentation meta-framework** built directly on Vite + Vue 3
(not VitePress). Cross-linked markdown pages are pre-rendered per route at build
time via the `qdocs-ssg` CLI (bundled in this package) and hydrated as a SPA, with
batteries-included chrome: a configurable sidebar, local fuzzy search, a theme
toggle with live brand-hue/intensity controls, a markdown pipeline (cross-link
rewriting, callouts, GitHub alerts, optional mermaid), and a doc/home layout
dispatcher.

> **Name.** `qdocs` is a placeholder; rename to taste with a single
> find-and-replace across the workspace.

A site built on it is **config + content** — `vite.config.ts` and `src/*.md` (or
`src/pages/*.md`). No `main.ts`, no `main.css`, no `index.html`. This repo ships
three consumers: `apps/tcm` (rich: mermaid + theme controls), `apps/8fold` (minimal
stock-prose stub), and `apps/showcase` (feature demos).

---

## Quickstart

From a workspace where this package is available (e.g. `"qdocs": "workspace:*"`):

**1. Install peers** (the framework brings its own markdown/search/UI deps; you provide the runtime + Vite + Tailwind):

```
vp add vue vue-router @unhead/vue
vp add -D @vitejs/plugin-vue tailwindcss @tailwindcss/vite @tailwindcss/typography vite-plus
# only if you set markdown.mermaid: true ↓
vp add mermaid
```

**2. `vite.config.ts`** (the only config file needed):

```ts
import { defineConfig } from 'qdocs/vite';

export default defineConfig({
  title: 'My Docs',
  description: 'A short description.',
  branding: { siteTitle: 'My Docs' },
  markdown: { mermaid: false },
  themeDefaults: { brandHue: 210, brandIntensity: 50 },
  sidebar: [
    { group: 'Start', items: [{ slug: 'index', title: 'Home' }] },
    { group: 'Guides', items: [{ slug: 'Install', title: 'Install' }] },
  ],
  server: { port: 12345 },
});
```

**3. `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vp dev",
    "build": "qdocs-ssg",
    "preview": "vp preview"
  }
}
```

**4. `tsconfig.json`** — extend the framework base, which provides all module shims (`*.vue`, `*.md`, `__QDOCS_MERMAID__`) and shared compiler settings:

```json
{
  "extends": "qdocs/tsconfig.base.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*"]
}
```

**5. Content** — `src/index.md` (start with `# H1`). The framework auto-discovers all `.md` and `.vue` files in `src/` (or `src/pages/` if that directory exists). Build with `vp run build`, dev with `vp run dev`.

---

## Config reference (`QDocsConfig`)

| Field                          | Type              | Default                            | Notes                                                                                         |
| ------------------------------ | ----------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `title`                        | `string`          | —                                  | Document `<title>` base. **Required.**                                                        |
| `description`                  | `string`          | —                                  | Meta description.                                                                             |
| `base`                         | `string`          | `'/'`                              | Public base path.                                                                             |
| `home`                         | `{ slug; title }` | `{ slug: 'index', title: 'Home' }` | The `/` entry shown in nav.                                                                   |
| `sidebar`                      | `SidebarGroup[]`  | —                                  | Nav manifest. **Required.** Drives grouping, reading order, prev/next.                        |
| `branding.siteTitle`           | `string`          | `title`                            | Short name in the header / mobile drawer.                                                     |
| `markdown.mermaid`             | `boolean`         | `false`                            | Enables the mermaid fence transform + runtime. When off, mermaid is tree-shaken out entirely. |
| `markdown.html`                | `boolean`         | `false`                            | Allow raw HTML tags in markdown prose.                                                        |
| `themeDefaults.brandHue`       | `number` (0–360)  | `210`                              | Starting brand hue.                                                                           |
| `themeDefaults.brandIntensity` | `number` (0–100)  | `50`                               | Starting brand intensity.                                                                     |

`SidebarGroup = { group: string; items: { slug; title }[]; extra?: boolean }`.
Groups with `extra: true` render under "Additional reading" and sit **outside**
the prev/next chain (still routable + searchable).

### Page conventions

- **Filename = URL slug**, verbatim (PascalCase recommended). `index.md` → `/`.
- **Routing is auto-discovered:** every `.md` / `.vue` in the content root routes. The sidebar drives nav/order only — a page absent from it still routes.
- **Cross-link with `[Text](Other.md)`** — rewritten to `/Other` (hashes preserved). Never hardcode `/Other`.
- **Frontmatter:** `title`, `description` (→ `<head>`), `hidden: true` (drops from SSG output + search + nav; still routable in dev), `layout: home` (hero + features — see below).
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

- **CSS custom properties.** Override in your app's `vite.config.ts` `themeDefaults`, or at runtime via `localStorage` (`brand-hue`, `brand-intensity`). Dark mode is the `.dark` class.
- **Component replacement via Vite alias.** Point `resolve.alias` at your own SFC to override any framework component.
- **Extra markdown-it plugins.** Pass additional plugins via `qdocsPlugin`'s options, or wrap the plugin array returned by `defineConfig`.

---

## Exports

| Specifier                  | What                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `qdocs`                    | composables, types, runtime helpers                                                                                   |
| `qdocs/config`             | `QDocsConfig`, `SidebarGroup`, `SidebarItem`, `CONFIG_KEY`                                                            |
| `qdocs/vite`               | `defineConfig(opts)` — the primary consumer entry point                                                               |
| `qdocs/ssg`                | `createApp` — called automatically by the framework virtual entry; consumers do not call it directly                  |
| `qdocs/sitemap`            | `filterPublicRoutes`, `buildSearchIndex`, `buildSitemap`, `patchCspScriptHash` — called by `qdocs-ssg`; **Node-only** |
| `qdocs/App.vue`            | the default root shell                                                                                                |
| `qdocs/styles/qdocs.css`   | tokens + components + utilities (no `@import 'tailwindcss'`)                                                          |
| `qdocs/client`             | TypeScript shims for `*.vue`, `*.md`, `__QDOCS_MERMAID__`                                                             |
| `qdocs/tsconfig.base.json` | shared `tsconfig` base for consumer apps                                                                              |

## Not included (yet)

Shiki syntax highlighting + `::: code-group` (planned), Algolia, i18n, last-updated
git timestamps, edit-on-GitHub links. CSS variables + Vite-alias component
overrides cover most theming needs today.
