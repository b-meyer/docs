---
purpose: "Documents the framework's design rationale, component contracts, Azure deployment topology, and the consumer model for building sites on it."
scope: 'Framework architecture only — workspace file layout in STRUCTURE, build tooling in TOOLCHAIN, CI/CD in PIPELINE, Azure provisioning in PROVISION, runtime hosting in RUNTIME.'
audience: 'Agents reasoning about cross-cutting design decisions (primary); contributors adding framework features (secondary); consumers building new sites on the framework (tertiary).'
summary: 'Config/inject model, glob-driven routing, plugin chain order, layout dispatch, SSG entry constraints, markdown pipeline, build-time mermaid gating, theme/search/styling, Azure SWA topology, consumer model, and deliberate non-goals.'
---

# Architecture

The framework is a VitePress-style documentation chrome built directly on Vite + Vue 3 — not VitePress. Sites pre-render per route at build time via the `framework-ssg` CLI (custom two-pass SSG in `packages/core/src/build.ts`) and hydrate as a SPA.

## Config and provide/inject

The consumer's `vite.config.ts` — via `defineConfig` from `@framework/core/vite` — is the single source of truth for all per-site decisions (title, sidebar, branding, markdown options, plus Vite build settings). `defineConfig` builds the `FrameworkConfig` object and wires it into the framework plugin; the config is then serialised into a virtual module (`virtual:@framework/config`) and injected into every component at app boot — no global stores, no prop drilling, no module singletons.

**Why not module singletons:** They survive across SSR requests in a long-lived server process, leaking config between renders. Provide/inject is per-app-instance and SSR-safe by construction.

## File-based routing

Routes are auto-discovered by `unplugin-vue-router` from the app's content root (`src/pages/` when it exists, otherwise `src/`). Content presence is the route declaration; the sidebar config drives nav grouping and prev/next order only. A page absent from the sidebar still routes and appears in search. The `hidden: true` frontmatter flag is the opt-out for SSG output and search.

## Plugin chain

A single `frameworkPlugin()` call returns the full plugin array (Vite define flags, vue, unplugin-vue-markdown, Tailwind). The markdown-it plugin order is load-bearing: anchor → link rewriter → table wrapper → (mermaid, gated) → containers → alerts. Reordering breaks heading IDs, cross-links, or admonition syntax.

## Layout dispatch

`LayoutResolver` reads the page's `layout` frontmatter and dispatches to `HomeLayout` (hero + features grid) or `PageLayout` (three-column doc chrome). Adding a new layout type requires touching only `LayoutResolver`, not the markdown pipeline or route configuration.

## SSG build pipeline

The `framework-ssg` CLI (`packages/core/src/build.ts`) drives a two-pass build:

1. **Client pass** — standard Vite bundle with `ssrManifest: true`; entry is `virtual:framework-entry`.
2. **Server pass** — SSR build into `.framework-ssg-temp/`; routes are enumerated from the server-rendered router.
3. **Render loop** — each public route is rendered via `@vue/server-renderer` + JSDOM, then written to `dist/<slug>/index.html`. Up to 20 pages render concurrently.

Consumer apps have no `main.ts` or `index.html`. The framework provides the virtual entry (`virtual:framework-entry`) and injects all HTML metadata through `transformIndexHtml`. Route discovery uses `unplugin-vue-router`'s static type-safe routes (`vue-router/auto-routes`) — no `import.meta.glob` calls in consumer code.

## Markdown pipeline

Five-stage transformation:

1. **Anchor** — kebab heading IDs (shared slugify with the search index)
2. **Link rewriter** — `[Display](Other.md)` → `/Other` (hash preserved)
3. **Table wrapper** — scroll container for mobile
4. **Mermaid** (gated) — ` ```mermaid ` fences to hydration targets
5. **Containers / Alerts** — `:::tip|info|warning|danger|details` + GitHub-style `> [!NOTE]`

## Build-time mermaid gating

Whether mermaid is included in the bundle is decided at **build time** via a Vite `define` flag (`__FRAMEWORK_MERMAID__`). A runtime conditional does not tree-shake the chunk — Vite's static analysis sees a reachable dynamic import and emits it regardless. Any new optional-feature chunk must follow the same define flag pattern.

## Theme, search, and styling

**Theme:** User preference (light/dark, brand hue/intensity) is stored in `localStorage`. The pre-paint inline script (injected by the framework plugin into every HTML page) applies `.dark` and brand CSS vars before Vue boots, preventing a flash. All theme logic is SSR-safe — no top-level `window`/`document` access at module load time.

**Search:** In development, the framework plugin serves `/search-index.json` on demand from the filesystem. In production, `build.ts` writes `dist/search-index.json`. One entry per H1/H2/H3 heading; `fuzzysort` handles matching.

**Styling:** `packages/core/src/styles/entry.css` is the sole CSS entry point, imported directly by `ssg.ts`. `framework.css` declares `@source '..'` so Tailwind 4 scans all framework source files. Consumer apps have no `main.css` — all styles come from the framework's entry.

## Azure deployment topology

Each app (`apps/tcm`, `apps/8fold`, `apps/showcase`) is a separate Azure Static Web Apps resource with no shared backends, Functions, or databases. Route config lives in each app's `public/staticwebapp.config.json`. See [PROVISION.md](PROVISION.md) for resource setup and [RUNTIME.md](RUNTIME.md) for the CDN hosting model.

## Consumer model

A site is **config + content**:

- `vite.config.ts` — everything: title, sidebar, branding, markdown options, plus Vite build settings. Uses `defineConfig` from `@framework/core/vite`.
- `src/pages/*.md` — filename = URL slug; `index.md` → `/`
- `public/favicon.svg` — site icon served at `/favicon.svg`

The framework generates `index.html`, the virtual app entry, and all CSS. No `main.ts`, no `main.css`, no `Logo.vue`. Framework changes don't require touching consumer code beyond the package version bump.

**Cross-linking:** Use `[Display](Other.md)` — the link rewriter resolves this to `/Other`. Never hardcode `/Other`.

## Deliberate non-goals

- **Multi-region active/active** — each app is pinned to one Azure region. Cross-region failover is a recovery story (RPO/RTO target), not a steady-state load-balancing strategy. Trigger to invest: a stated SLA requirement that single-region availability can't meet.
- **Shiki syntax highlighting** — no consumer ships code blocks; the pipeline has a seam for it (see `TODO.md`).
- **Backend / persistence** — content is static markdown; only `localStorage` prefs persist.
- **8fold CI deploy** — needs its own SWA resource and token (see `TODO.md`).
- **Monitoring / analytics** — not wired (see `TODO.md`); CSP allows `'unsafe-inline'` for the theme script and mermaid (see [SECURITY.md](SECURITY.md)).

## Industry References

- [Vite](https://vite.dev/) — dev server + bundler; plugin surface docs.
- framework-ssg — custom two-pass SSG CLI in `packages/core/src/build.ts`; wraps Vite's `build()` API directly.
- [Vue 3 — provide/inject](https://vuejs.org/guide/components/provide-inject.html) — config injection model.
- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/) — single-SWA topology.

_External URLs verified 2026-06-04._

## Cross-references

- [STRUCTURE.md](STRUCTURE.md) — workspace file layout and import model.
- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp` commands and build entry points.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — failure modes for SSR constraints, mermaid gating, and the plugin chain.
- [CONVENTIONS.md](CONVENTIONS.md) — coding conventions that follow from the architecture.
- [PIPELINE.md](PIPELINE.md) — CI/CD workflow.
- [PROVISION.md](PROVISION.md) — Azure SWA provisioning.
- [RUNTIME.md](RUNTIME.md) — SWA hosting model and route config.
- [SECURITY.md](SECURITY.md) — CSP posture and `'unsafe-inline'` rationale.
