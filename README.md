# TCM Primer

A reader for a Traditional Chinese Medicine primer — a set of cross-linked markdown topic pages (foundation theory, organ deep-dives, treatment branches) plus a navigation home page, rendered as a single-page app. The canonical page list lives in [`src/scripts/router.ts`](src/scripts/router.ts).

VitePress-style chrome (sidebar nav, scroll-spy outline, prev/next, Cmd+K search) built directly on Vite + Vue 3 — no VitePress, no static-site generator.

## Stack

- **Build:** Vite+ (Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt under the `vp` CLI)
- **Framework:** Vue 3 + Vue Router (manual route map; no file-based routing plugin)
- **Markdown:** `unplugin-vue-markdown` transforms `.md` files into Vue SFCs at build time
- **Markdown extras:** `markdown-it-anchor` (heading IDs), a custom kebab-case slugifier (`src/scripts/utils.ts`), a cross-link rewriter for `.md` → `/Route` and a `<div class="table-wrap">` wrapper for prose tables (`src/scripts/markdown.ts`)
- **Search:** `fuzzysort` + a Reka UI dialog, opened via the header button or `⌘K` / `Ctrl+K`
- **Styles:** Tailwind 4 + `@tailwindcss/typography`. Theme tokens (primary + gray + black + white + transparent) live in `src/styles/main.css`
- **Runtime:** TypeScript 6, Node 22.12+, pnpm 11

## Getting started

```bash
vp install        # install dependencies
vp dev            # dev server (HMR on .md changes)
vp build          # production build (one chunk per route + lazy-loaded Mermaid)
vp check          # format + lint + type check
vp check --fix    # apply formatter fixes
```

## Project layout

```
src/
  components/   Vue components — outer shell, sticky chrome (header + sidebar nav),
                auto-injected doc layout, right-side outline, inline search UI,
                theme controls. Roles described in "How content is wired" below.
  pages/        Markdown content, one file per route. The sidebar manifest in
                src/scripts/router.ts is the canonical list of which pages exist
                and how they're grouped (theory, organ deep-dives, treatment,
                plus index.md and a NotFound catch-all).
  scripts/      main.ts (Vite entry), router.ts (single source of truth for
                routes + sidebar), search.ts (fuzzysort index + Cmd+K state),
                markdown.ts (markdown-it plugins: SPA link rewriter, table
                wrapper, mermaid fence), mermaid.ts (lazy runtime + theme-aware
                re-render), theme.ts + reading.ts (small composables for
                persisted UI prefs), utils.ts (slugify + reduced-motion).
  styles/       main.css imports tailwind + typography + theme.css (tokens) +
                components.css (.prose .table-wrap, pre.mermaid) +
                utilities.css (@utility nav-link / outline-link / eyebrow / …).
shims.d.ts      TS shims for *.vue and *.md modules (repo root, in tsconfig).
```

## How content is wired

1. **Markdown files** live in `src/pages/*.md` — one file per route. Filename (Pinyin PascalCase) is the URL slug: `YinYang.md` → `/YinYang`. The home page is `index.md` → `/`.
2. **`src/scripts/router.ts`** is the single source of truth for which pages exist and how they're grouped. The exported `sidebar` array maps slug → title in canonical reading order. Routes are derived from `flatOrder` via `import.meta.glob('../pages/*.md')`.
3. **Cross-links** between `.md` files use the natural form `[Display](OtherFile.md)`. At build time, `mdLinkRewriter` (in `src/scripts/markdown.ts`) rewrites them to SPA routes (`/OtherFile`). Hashes are preserved: `[Display](OtherFile.md#sub-heading)` → `/OtherFile#sub-heading`. As a special case, `index.md` rewrites to `/` (not `/index`) so links to home-page anchors work.
4. **Every page** is auto-wrapped in `PageLayout` (configured in `vite.config.ts` via `Markdown({ wrapperComponent: 'PageLayout' })`). The layout supplies sidebar nav, the prose container, the right-side outline, and an inline prev/next nav below the article.
5. **Heading IDs** are kebab-cased by the shared `slugify` helper in `src/scripts/utils.ts` so URL fragments are predictable: `## Reading the Taijitu` → `id="reading-the-taijitu"`. The search index uses the same function, guaranteeing that result links land on the right anchor.
6. **Search.** All search logic lives in `src/scripts/search.ts`. On module load it parses every page's raw markdown into one entry per H1/H2/H3 section, strips to plaintext, and pre-prepares the heading + body strings for `fuzzysort`. The same file owns the open / query / selectedIndex state and exposes a `results` computed (body matches are penalized so heading hits rank first) via `useSearch()`. The search UI lives inline in the header (desktop bar at ≥sm, magnifier-triggered full-width overlay at <sm); both share a results pane and the `⌘K` / `Ctrl+K` shortcut. Heading IDs come from the same `slugify` as `markdown-it-anchor`, so result links land on the right anchor.

## Adding a new topic

1. Create `src/pages/NewTopic.md` starting with `# Title` (the H1).
2. Add an entry to the appropriate group in `src/scripts/router.ts`:
   ```ts
   { slug: 'NewTopic', title: 'Display Title' },
   ```
3. Cross-link to/from existing files with `[X](NewTopic.md)`.

Route, sidebar entry, page outline, prev/next, and search index are picked up automatically. A `.md` file without a sidebar entry won't get a route.

## Authoring conventions

- **Filenames:** Pinyin PascalCase (`YinYang.md`, not `yin-yang.md`). The filename is the URL slug verbatim.
- **Cross-links:** always use the `[Display](File.md)` form. Never hardcode `/File` in source markdown — the rewriter is what makes it refactor-safe. For links to the home page, use `[Display](index.md)` or `[Display](index.md#anchor)`.
- **Headings:** first line is the page's `# H1`. The right-side outline shows `h2` and `h3` only.
- **No frontmatter required.** Titles come from the sidebar manifest; the on-page H1 stands alone.
- **No code highlighting wired up** (Shiki etc.) — the TCM content has none. Mermaid diagrams in ` ```mermaid ` fences are rendered separately via `src/scripts/mermaid.ts`.

## AI-assisted origin

The TCM text under `src/pages/` was generated with AI assistance as a synthesis of publicly available TCM material and edited for consistency. Treat it as a study aid, not a primary source.

## Deployment

Deployed to Azure Static Web Apps via the GitHub Actions workflow in `.github/workflows/azure-static-web-apps.yml`. SPA routing + headers live in `public/staticwebapp.config.json`. The one-time Azure-side setup (creating the resource, capturing the deployment token, first deploy) is in [`deploy.md`](./deploy.md).
