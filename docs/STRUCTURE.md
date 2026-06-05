---
purpose: 'Documents the workspace topology, per-package layout conventions, import model, and new-file placement rules.'
scope: 'File organization and import resolution only — toolchain commands in TOOLCHAIN, architecture rationale in ARCHITECTURE, coding conventions in CONVENTIONS.'
audience: 'Contributors placing new files (primary); agents navigating the workspace (secondary); maintainers adding new apps or packages (tertiary).'
summary: 'vp-mono layout with apps/ (deployable surfaces) and packages/ (shared libraries); per-app and per-package layout conventions; @/ alias is app-local; cross-workspace imports use package name; public exports through src/index.ts; test placement note.'
---

# Structure

## Workspace topology

```
docs/                     ← repo root (pnpm workspace)
├── apps/
│   ├── tcm/              TCM Primer — deployed to Azure SWA
│   └── 8fold/            Eightfold Path — not yet deployed
├── packages/
│   └── core/             @framework/core — shared framework library
├── docs/                 Branches (topical docs/<TOPIC>.md files)
├── vite.config.ts        canonical lint + format config (whole workspace)
├── pnpm-workspace.yaml   workspace globs + dependency catalog
└── package.json          workspace root: orchestration scripts only
```

`apps/` holds deployable surfaces. `packages/` holds shared libraries consumed by apps.

## Per-app layout

```
apps/<name>/
├── framework.config.ts   site config (title, sidebar, branding, markdown options)
├── vite.config.ts        build settings only — no lint/fmt
├── index.html            entry HTML + pre-paint theme bootstrap inline script
├── src/
│   ├── scripts/main.ts   vite-ssg entry (the two import.meta.glob calls)
│   ├── pages/            content files (filename = URL slug)
│   ├── styles/main.css   Tailwind import + @source + brand override
│   └── Logo.vue          brand mark (optional)
└── public/
    └── staticwebapp.config.json   Azure SWA route + CSP config
```

## Framework package layout (`packages/core/`)

```
packages/core/
├── src/
│   ├── components/       AppHeader, AppNav, PageLayout, HomeLayout, …
│   ├── composables/      useConfig, useTheme, useSearch, …
│   ├── markdown/         markdown-it plugins
│   ├── runtime/          slugify, mermaid, reducedMotion, headFromFrontmatter
│   ├── styles/           framework.css + tokens + components + utilities
│   ├── plugin.ts         frameworkPlugin() — Vite plugin array
│   └── ssg.ts            createSSGApp() wrapper
├── tests/
│   └── markdown.test.ts  markdown plugin unit tests
└── README.md             public API reference (export map)
```

**Note on test placement:** The viteplus blueprint convention co-locates unit tests next to source files. The current framework tests live in `tests/` — a divergence tracked for future alignment.

## Import model

**`@/` is app-local.** Each app's `vite.config.ts` + `tsconfig.json` declares `@/` → `./src`. Framework source uses relative imports exclusively.

**Cross-workspace imports use the package name.** App code reaches the framework via `@framework/core/config`, `@framework/core/App.vue`, etc. — never via relative paths crossing workspace boundaries.

**Framework exports are declared in `package.json` `exports`.** Internal modules (not in `exports`) are package-private. See [packages/core/README.md](../packages/core/README.md) for the full export map.

## New-file placement

| What you're adding              | Where it goes                                                             |
| ------------------------------- | ------------------------------------------------------------------------- |
| A new page in an existing app   | `apps/<app>/src/pages/<Slug>.md` + entry in `framework.config.ts` sidebar |
| A new framework component       | `packages/core/src/components/<Name>.vue`                                 |
| A new composable                | `packages/core/src/composables/use<Name>.ts`                              |
| A new markdown-it plugin        | `packages/core/src/markdown/<name>.ts`                                    |
| A new framework runtime utility | `packages/core/src/runtime/<name>.ts`                                     |
| A new app-level style override  | `apps/<app>/src/styles/main.css`                                          |
| A new framework export          | Named subpath in `packages/core/package.json` `exports`                   |
| A new docs Branch               | `docs/<TOPIC>.md` + entry in `docs/DOCUMENTATION.md` Branch inventory     |

## Industry References

- [pnpm Workspaces](https://pnpm.io/workspaces) — workspace topology mechanics.
- [Vite — Path aliases](https://vite.dev/config/shared-options.html#resolve-alias) — `@/` alias configuration.

_External URLs verified 2026-06-04._

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — why the import model is structured this way.
- [TOOLCHAIN.md](TOOLCHAIN.md) — commands that operate on the workspace.
- [CONVENTIONS.md](CONVENTIONS.md) — import path naming rules.
