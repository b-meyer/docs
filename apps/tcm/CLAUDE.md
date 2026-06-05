# apps/tcm — TCM Primer (framework consumer)

Layered on root [CLAUDE.md](../../CLAUDE.md) + [docs/](../../docs/).

The Traditional Chinese Medicine primer — the **rich** consumer of `@framework/core`
(mermaid diagrams + theme controls). Workspace root: `../../`. See the root
[`CLAUDE.md`](../../CLAUDE.md) for architecture + the `vp` command map, and
[`packages/core/README.md`](../../packages/core/README.md) for the framework API.

## What's here

Consumer code only — the chrome lives in `@framework/core`:

- `framework.config.ts` — title, sidebar manifest, branding (`siteTitle` + `Logo.vue`),
  `markdown.mermaid: true`, sitemap hostname, theme defaults (hue 210).
- `src/scripts/main.ts` — the vite-ssg entry (`createSSGApp` + the `pages` globs).
- `src/Logo.vue`, `src/pages/*.md` (content), `src/styles/main.css` (Tailwind import +
  `@source` at the framework + brand-hue).
- `vite.config.ts` (build settings only — no lint/fmt), `index.html`, `public/`,
  `tsconfig.json`, `shims.d.ts`.

## Working here

- **Run `vp` from the repo root**, not this dir: `vp run dev` (= `vp run tcm#dev`),
  `vp run build`, `vp check`, `vp run ready`. `vp install` from root too. (For focused work
  you can `cd` here and `vp dev`, but lint/format are root-owned — `vp check` belongs at root.)
- Imports inside `src/` use the consumer-local `@/` alias (= `apps/tcm/src/`). Framework code
  is reached via `@framework/core/…`, never `@/`.
- Stock chrome comes from the framework; this app adds only config + content. Direct deps are
  just `@framework/core` + the framework's runtime peers (vue, vue-router, vite-ssg,
  @unhead/vue, mermaid). Don't re-add `reka-ui`/`@heroicons`/`markdown-it*` — those are bundled
  by the framework.
- Deploy: CI builds + uploads `apps/tcm/dist` to Azure Static Web Apps on push to `release`.
