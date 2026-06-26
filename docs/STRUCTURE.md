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
│   └── <app>/            one directory per deployable primer (run `ls apps/` for current list)
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
├── vite.config.ts        full site config — title, sidebar, branding, markdown options, build settings
├── src/
│   ├── pages/            content files (.md or .vue; filename = URL slug) ← preferred
│   └── [assets/]         optional: static assets referenced by pages (SVGs, images)
└── public/
    ├── staticwebapp.config.json   Azure SWA route + CSP config
    └── favicon.svg                site icon served at /favicon.svg
```

All site configuration (title, sidebar, branding, markdown options) is expressed through `defineConfig` from `@framework/core/vite` in `vite.config.ts` — there is no separate `framework.config.ts`. The framework generates `index.html`, the app entry module, and all Tailwind CSS internally; consumer apps contain only content and static assets.

The framework auto-detects the content root: `src/pages/` is used when it exists; otherwise `src/` is the fallback. New apps should use `src/pages/`.

## Framework package layout (`packages/core/`)

```
packages/core/
├── src/
│   ├── components/       AppHeader, AppNav, PageLayout, HomeLayout, …
│   ├── composables/      useConfig, useTheme, useSearch, …
│   ├── markdown/         markdown-it plugins
│   ├── runtime/          slugify, mermaid, reducedMotion, headFromFrontmatter
│   ├── styles/           entry.css + framework.css + tokens + components + utilities
│   ├── test-utils/       mountWithConfig helper for component tests
│   ├── plugin.ts         frameworkPlugin() — Vite plugin array
│   ├── defineConfig.ts   consumer entry point (replaces framework.config.ts)
│   ├── build.ts          framework-ssg CLI — two-pass SSG build
│   └── ssg.ts            createApp() — shared browser + SSR entry
└── README.md             public API reference (export map)
```

All tests colocate next to their source file (`useFoo.ts` + `useFoo.test.ts`).

## Import model

**`@/` is app-local.** Each app's `vite.config.ts` + `tsconfig.json` declares `@/` → `./src`. Framework source uses relative imports exclusively.

**Cross-workspace imports use the package name.** App code reaches the framework via `@framework/core/config`, `@framework/core/App.vue`, etc. — never via relative paths crossing workspace boundaries.

**Framework exports are declared in `package.json` `exports`.** Internal modules (not in `exports`) are package-private. See [packages/core/README.md](../packages/core/README.md) for the full export map.

## New-file placement

| What you're adding              | Where it goes                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| A new page in an existing app   | `apps/<app>/src/pages/<Slug>.md` + entry in `vite.config.ts` sidebar  |
| A new framework component       | `packages/core/src/components/<Name>.vue`                             |
| A new composable                | `packages/core/src/composables/use<Name>.ts`                          |
| A new markdown-it plugin        | `packages/core/src/markdown/<name>.ts`                                |
| A new framework runtime utility | `packages/core/src/runtime/<name>.ts`                                 |
| A new framework export          | Named subpath in `packages/core/package.json` `exports`               |
| A new docs Branch               | `docs/<TOPIC>.md` + entry in `docs/DOCUMENTATION.md` Branch inventory |

## Gated artifacts

Files whose path is fixed by an external consumer — moving them breaks the contract.

| File                       | Location             | Gate                                                                                        |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `README.md`                | Repo root            | GitHub surfaces it as the project README                                                    |
| `CLAUDE.md`                | Repo root            | Claude Code loads it as the agents-first Trunk                                              |
| `AGENTS.md`                | Repo root            | `@AGENTS.md` import from `CLAUDE.md`                                                        |
| `staticwebapp.config.json` | `apps/<app>/public/` | Azure SWA deploy task requires it at the `output_location` root when `skip_app_build: true` |
| `favicon.svg`              | `apps/<app>/public/` | Served at `/favicon.svg` by SWA; path is a platform convention                              |

## Excluded paths

| Path                   | Reason                                               | `.gitignore` pattern   |
| ---------------------- | ---------------------------------------------------- | ---------------------- |
| `node_modules/`        | Installed deps — regenerated by `vp install`         | `node_modules/`        |
| `apps/*/dist/`         | Build output — regenerated by `vp run build`         | `dist/`                |
| `.framework-ssg-temp/` | SSG intermediate render output — deleted after build | `.framework-ssg-temp/` |
| `packages/core/dist/`  | Compiled library output (`vp pack`) — regenerated    | `packages/*/dist/`     |

## Industry References

- [pnpm Workspaces](https://pnpm.io/workspaces) — workspace topology mechanics.
- [Vite — Path aliases](https://vite.dev/config/shared-options.html#resolve-alias) — `@/` alias configuration.

_External URLs verified 2026-06-04._

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — why the import model is structured this way.
- [TOOLCHAIN.md](TOOLCHAIN.md) — commands that operate on the workspace.
- [CONVENTIONS.md](CONVENTIONS.md) — import path naming rules.
