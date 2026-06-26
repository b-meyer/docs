# Project Agent Reference

## Workspace

```
docs/                        ← repo root (pnpm workspace)
├── apps/                    primer apps — one directory per app (run `ls apps/` for current list)
├── packages/qdocs/          qdocs — shared framework library
├── docs/                    topical docs (ARCHITECTURE, CONVENTIONS, etc.)
└── vite.config.ts           canonical lint + format config (whole workspace)
```

Stack: Vite + Vue 3 + qdocs-ssg (custom SSG, not SPA) + unplugin-vue-markdown + Tailwind 4. NOT VitePress.

## App scope

Each `apps/<app>/` is a self-contained primer at one of two grains:

- **Broad (tradition-level)** — a whole domain with a conceptual core and a long tail of specialist material (`tcm`, `dao`). The sidebar splits into core groups plus supplementary groups flagged `extra: true`.
- **Focused (framework-level)** — one bounded framework whose structure is fixed by the subject (`8fold`: eight factors, four truths, three trainings). No long tail, so no `extra` tier.

Use **hub-and-spoke** only when the relationship is **containment**: the spoke is a specific framework _within_ the hub's tradition, and the hub would have to re-author the same material at real depth — or leave a meaningful gap — without it. The hub gives the shared topic one overview page that links out to the spoke rather than re-authoring it (apps deploy as separate sites, so this is a cross-site link, not the intra-app `[Display](Other.md)` form).

Do **not** cross-link apps whose relationship is **parallel** — shared structural analogies or historical influence where each system's treatment of the overlapping concepts is self-contained within its own doctrine. Those apps are standalone; each owns its own foundational material. Buddhism → 8fold is containment (the Eightfold Path is a Buddhist framework). Dao and TCM are parallel (both discuss Yin-Yang, but from independent starting points for independent purposes).

Candidate apps and their scoping rationale live in `docs/ROADMAP.md`. While an app is being authored, a temporary `apps/<app>/RESEARCH.md` holds its full page inventory; it is removed once the `src/*.md` pages and sidebar exist.

## Before finishing any task

1. `vp check` — format, lint, type-check the whole workspace
2. `vp run test` — run all tests
3. If the task touched a build artifact or routing: `vp run build`

Fix all failures before handing back. Do not leave lint errors, type errors, or failing tests for a human to clean up.

## Toolchain — `vp` is the sole entry point

| Command               | Does                                                 |
| --------------------- | ---------------------------------------------------- |
| `vp install`          | Install/refresh all deps                             |
| `vp check`            | Format + lint + type-check (whole workspace)         |
| `vp run fix`          | Autofix format/lint issues                           |
| `vp run build`        | Build all apps (`qdocs-ssg` → static HTML per route) |
| `vp run test`         | Run all tests (Vitest)                               |
| `vp run ready`        | `vp check && vp run build` — pre-push gate           |
| `vp run dev:<app>`    | Dev server for one app (HMR on `.md` changes)        |
| `vp run <app>#build`  | Build one app only                                   |

**`vp build` ≠ `vp run build`** — `vp build` invokes Vite's SPA path, skipping qdocs-ssg. Always use `vp run build`.
**`vp test` ≠ `vp run test`** — `vp test` runs current package only. Always use `vp run test`.
**`vp check` does NOT run as part of `vp run build`** — they are separate steps. `vp run ready` runs both.

All commands from the **repo root**.

## Import rules

- `@/` is **app-local** — each app's `vite.config.ts` maps it to its own `src/`. Never use it in `packages/qdocs/`.
- Framework source uses **relative imports only** (`./components/AppHeader.vue`).
- App code reaches the framework via package name: `qdocs/config` — never via relative paths crossing workspace boundaries.
- Files reachable from `vite.config.ts` require **explicit `.ts` extensions** (Node ESM; no directory imports).

## Conventions

- Vue SFCs: `<script setup>` only. No Options API.
- Composables: `use*` prefix (`useConfig`, `useTheme`).
- Framework chrome components: `App*` prefix (`AppHeader`, `AppNav`). Feature components omit it.
- Tailwind 4 is CSS-first via `@theme {}`. No `tailwind.config.js` — reintroducing it is a defect.
- Utility classes for layout/spacing/color. Scoped `<style>` only for rules Tailwind can't express.
- Use declared tokens (`text-primary-600`), not arbitrary values (`[#hex]`).
- Regex literals require the `u` flag (`/\.vue$/u`). Oxlint enforces this.
- Dependency versions live in `pnpm-workspace.yaml` catalog — never edit individual `package.json` versions directly.
- `vue-router@~5.0.7` is intentional (in-dev next major). Do not upgrade to v4.
- Cross-links in markdown: `[Display](Other.md)` — resolves to `/Other`. Never hardcode `/Other`.
- Sidebar groups of supplementary pages carry `extra: true` (between `group` and `items`) to render de-emphasized. See **App scope** for when an app needs the tier.

## Content writing

SCOPE: these rules apply only to `apps/*/src/*.md` content files. Instruction files (AGENTS.md, CLAUDE.md, skill files, docs/) are exempt.

Write like a person describing a subject, not like a chatbot summarizing one.

§1 Significance inflation "vital role" / "underscores its significance" / "pivotal" / "stands as a testament" → state what it does; drop the significance claim
§3 Participial padding trailing "symbolizing…" / "reflecting…" / "contributing to…" → cut; stop at the fact
§4 Promotional adjectives remarkable, sophisticated, profound, holistic, vibrant → cut or reword; just say what it does
§7 AI vocabulary delve, tapestry (abstract), testament, showcase (v), pivotal, intricacies, → replace with plain verbs and nouns
interplay, fostering, garner, landscape (abstract), enduring, crucial
§8 Copula avoidance "serves as" / "stands as" / "marks a" / "represents a" → is / are / has
§9 Negative parallelism "not merely X; it is Y" / "not just X, but Y" → state Y directly
§14 Structural punctuation — – : ; in prose → rewrite naturally; do not swap one for another
ascii - only for: title/subtitle separators | annotation (Pali - English) | **Term** - desc
§15 Boldface overuse bold on non-essential phrases → remove; bold belongs on reference-list terms only
§16 Inline-header lists **Term:** or **Term.** in any list item → **Term** - desc (never colon or period inside bold)
§17 Title-case headings H2+ not in title case → capitalize every significant word
lowercase: a an the and but or for nor of in to at by (unless first or last word)
§23 Filler phrases "In order to" / "Due to the fact that" / "It is important to note that" → cut or compress
§24 Excessive hedging "could potentially possibly be argued" → direct claim or "may"
§25 Generic conclusions "The future looks bright" / "Exciting times lie ahead" → end on a specific fact
§27 Authority tropes "at its core" / "what really matters" / "fundamentally" → cut
§28 Signposting "Let's dive in" / "Let's explore" / "Here's what you need to know" → cut
§29 Fragmented headers warm-up sentence after heading that only restates it → cut
§31 Staccato drama 3+ short declarative fragments in a row for emphasis → rewrite as varied prose
§34 Temporal framing "In today's rapidly evolving X" / "In a world where" → state the claim directly
§35 Vague attribution "experts argue" / "some critics contend" / "research suggests" → name the source, or state the claim directly
§36 Additive transitions "Additionally," / "Furthermore," / "Moreover," / "In addition," → connect through sentence structure; cut the connector
§37 Triadic padding adj, adj, and adj stacked for completeness ("warm, accessible, and grounding") → state what is specific; cut the list
§38 Elegant variation synonym-swapping to avoid repeating a word ("constraints / norms / confines") → repeat the right word
§39 Challenges boilerplate "Despite its X, [subject] faces challenges including Y" → state challenges directly; no setup formula
§40 Diff-anchored docs describing what changed rather than what currently exists → write to current state; changelogs excepted

## New file placement

| Adding               | Where                                                                |
| -------------------- | -------------------------------------------------------------------- |
| New page in an app   | `apps/<app>/src/pages/<Slug>.md` + sidebar entry in `vite.config.ts` |
| Framework component  | `packages/qdocs/src/components/<Name>.vue`                           |
| Composable           | `packages/qdocs/src/composables/use<Name>.ts`                        |
| Markdown-it plugin   | `packages/qdocs/src/markdown/<name>.ts`                              |
| Runtime utility      | `packages/qdocs/src/runtime/<name>.ts`                               |
| New framework export | Named subpath in `packages/qdocs/package.json` `exports`             |

## Testing

Tests colocate next to source (`useFoo.ts` + `useFoo.test.ts`), all in `packages/qdocs/src/`. Three layers:

- **Unit** — pure logic, no DOM.
- **Composable integration** — `// @vitest-environment jsdom` docblock, minimal `defineComponent` mount.
- **Component** — `// @vitest-environment jsdom`, use `mountWithConfig` from `src/test-utils/mountWithConfig.ts`.

## Known traps

**Runtime conditionals don't tree-shake dynamic imports** — use the `__QDOCS_MERMAID__` Vite define flag pattern for optional-feature chunks.

**`ERR_UNSUPPORTED_DIR_IMPORT`** — add explicit `.ts` extension to any import reachable from `vite.config.ts`.

## Documentation policy

Keep docs **evergreen**: write conventions and patterns, not enumerations of current state.

- Do not list specific app names, secret names, resource names, or workflow files in documentation. Use `<slug>` placeholders and patterns instead, and point to the authoritative source (e.g. `ls apps/`, `infra/main.bicep`, `.github/workflows/`).
- Do not embed per-app runbook commands. Describe the pattern once; the `app-deploy` skill generates the concrete commands.
- A doc that requires edits every time an app is added or removed is a doc written at the wrong level of abstraction.

This applies to all files under `docs/`, `AGENTS.md`, and `CLAUDE.md`. Content files (`apps/*/src/*.md`) are exempt — they are the content, not the documentation of it.

## Links

| Need more on                                     | Read                      |
| ------------------------------------------------ | ------------------------- |
| Framework design, SSG pipeline, Azure topology   | `docs/ARCHITECTURE.md`    |
| Workspace topology and import model              | `docs/STRUCTURE.md`       |
| `vp` commands and entry-point contract           | `docs/TOOLCHAIN.md`       |
| Coding conventions (import paths, naming, CSS)   | `docs/CONVENTIONS.md`     |
| Dependency catalog and version pins              | `docs/DEPENDENCIES.md`    |
| Test layers, runner, and determinism conventions | `docs/TESTING.md`         |
| Build failures and silent prod bugs              | `docs/TROUBLESHOOTING.md` |
| CI/CD pipeline and deploy stages                 | `docs/PIPELINE.md`        |
| Security posture, CSP, and secrets inventory     | `docs/SECURITY.md`        |
| Contributing workflow and pre-PR gate            | `docs/CONTRIBUTING.md`    |
| Prospective apps and how to scope them           | `docs/ROADMAP.md`         |
