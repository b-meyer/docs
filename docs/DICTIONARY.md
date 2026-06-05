---
purpose: 'Defines project-specific terms, prefixes, and deprecated synonyms used across the framework and consumer apps.'
scope: 'Terminology only — design rationale in ARCHITECTURE, coding conventions in CONVENTIONS, workspace layout in STRUCTURE.'
audience: 'Agents encountering unfamiliar terms (primary); contributors reading or writing framework code (secondary).'
summary: 'Alphabetical and topical glossaries for vite-plus/vp, workspace conventions, framework API terms, and CSS-config terms; deprecated synonyms column for retired patterns.'
---

# Dictionary

## Alphabetical

| Term               | Definition                                                                                                                                                                                      | Deprecated synonym            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `@framework/core`  | The shared framework library package (`packages/core/`). Imported by consumers via this package name, never by relative path.                                                                   | —                             |
| `@theme`           | CSS `@theme { … }` block declaring Tailwind 4 design tokens (color scale, spacing, type scale). Replaces the v3-era JS config file.                                                             | `tailwind.config.js`          |
| `App*`             | PascalCase prefix for framework chrome SFCs that form the persistent shell (e.g., `AppHeader.vue`, `AppNav.vue`). Feature components omit this prefix.                                          | —                             |
| `catalog:`         | pnpm catalog reference used in `package.json` instead of a direct version pin. All versions are declared once in `pnpm-workspace.yaml`.                                                         | —                             |
| `createSSGApp`     | vite-ssg entry wrapper exported from `@framework/core/ssg`. Wires routes, seeds the search index, registers global components, and provides the config.                                         | `createApp` + `Vue.use`       |
| `frameworkPlugin`  | Vite plugin factory exported from `@framework/core/plugin`. Returns the full plugin array (define flags, vue, unplugin-vue-markdown, Tailwind). Called once in the consumer's `vite.config.ts`. | —                             |
| `LayoutResolver`   | Vue component that reads the page's `layout` frontmatter and dispatches to `HomeLayout` or `PageLayout`. The only place to add new layout types.                                                | —                             |
| `use*`             | camelCase prefix for composables in `src/composables/` (e.g., `useConfig`, `useTheme`). Signals the function must be called inside a Vue component setup context.                               | —                             |
| `vite-plus` / `vp` | The unified toolchain CLI wrapping Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. The sole entry point for all workspace operations.                                             | bare `pnpm`/`npm` invocations |
| `vp-mono`          | The workspace shape: one pnpm workspace with `apps/` (deployable sites) and `packages/` (shared libraries), orchestrated by `vp`.                                                               | —                             |

## Topical

### Framework API

- **`createSSGApp`** — SSG entry wrapper; consumer's `main.ts` calls this with the pages glob results and config object.
- **`frameworkPlugin`** — single `vite.config.ts` call that wires the full Vite plugin chain.
- **`LayoutResolver`** — frontmatter-driven layout dispatch; the only place to add new layout types.

### Naming prefixes

- **`App*`** — persistent shell SFCs; feature components (e.g., `ThemeToggle`, `MermaidBlock`) omit the prefix.
- **`use*`** — composables callable only inside Vue component setup or another composable.

### Stack-coined terms

- **`@theme`** — Tailwind 4 CSS-first config block; `tailwind.config.js` is absent by design.
- **`catalog:`** — pnpm catalog reference; bump versions in `pnpm-workspace.yaml`, not individual `package.json` files.
- **`vp-mono`** — the `apps/` + `packages/` workspace shape orchestrated by `vp`.

## Industry References

- [pnpm Catalogs](https://pnpm.io/catalogs) — `catalog:` version-reference mechanics.
- [Tailwind CSS 4 — CSS-first configuration](https://tailwindcss.com/docs/theme) — `@theme` block reference.
- [Vue 3 — Composables](https://vuejs.org/guide/reusability/composables.html) — `use*` naming convention rationale.

_External URLs verified 2026-06-04._

## Cross-references

- [CONVENTIONS.md](CONVENTIONS.md) — coding conventions that enforce these naming rules.
- [ARCHITECTURE.md](ARCHITECTURE.md) — design rationale for `frameworkPlugin`, `createSSGApp`, and `LayoutResolver`.
- [STRUCTURE.md](STRUCTURE.md) — where `App*` components and composables live in the workspace.
