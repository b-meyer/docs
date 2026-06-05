# apps/8fold — Noble Eightfold Path primer (framework consumer)

Layered on root [CLAUDE.md](../../CLAUDE.md) + [docs/](../../docs/).

The second consumer of the `@framework/core` docs meta-framework (workspace root:
`../../`), and a deliberately **minimal stub**: it ships only `framework.config.ts`
plus `src/pages/*.md`. See the root [`CLAUDE.md`](../../CLAUDE.md) for the
architecture and [`packages/core/README.md`](../../packages/core/README.md) for the
framework API.

## Why it exists

Proof that the extraction boundary holds — a consumer with no TCM-isms, built from
config + content alone. Also the **gating proof**: `framework.config.ts` sets
`markdown.mermaid: false` and declares no `shiki`, so neither dep enters this app's
bundle (`grep -ri mermaid dist/assets` ⇒ nothing).

## Working here

- **Run `vp` from the repo root**: `vp run dev:8fold` (= `vp run 8fold#dev`),
  `vp run build`, `vp check`, `vp run ready`; `vp install` from root too. (For focused work
  you can `cd` here and `vp dev`, but lint/format are root-owned.)
- Distinct brand hue (`--brand-hue: 35`, warm) set in `src/styles/main.css`, vs
  TCM's blue (210) — the same framework, visibly different sites.
- Stock prose only: no code blocks, no mermaid fences. Cross-link with
  `[Display](Other.md)` (the framework's link rewriter handles it). `index.md` is
  prose on `PageLayout` (no `layout: home`).
- **No CI deploy** yet — needs its own Azure Static Web Apps resource + token; the
  GitHub workflow still deploys only `apps/tcm`. Tracked in root `TODO.md`.
