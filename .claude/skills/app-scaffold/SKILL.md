---
name: app-scaffold
---

# Scaffold a primer app

This workspace hosts several content-primer apps under `apps/<slug>/`, each built on the same Vite + Vue 3 + framework-ssg stack. They all start life from an identical shell: a handful of near-boilerplate files, a themed but contentless `vite.config.ts`, and a `RESEARCH.md` that plans the pages before anyone writes them. This skill reproduces that starting state for a new topic so a human (or a later pass) can fill in the actual content.

The guiding idea: **derive the shell from a real app in the live workspace, not from frozen copies bundled here.** The framework's boilerplate evolves; copying from an existing app keeps a new scaffold correct without this skill going stale. This skill carries the _procedure and the per-app decisions_, not snapshots of project files.

## What the end state looks like

A freshly scaffolded app matches what the other apps look like before any pages exist:

```
apps/<slug>/
├── package.json                     # boilerplate; only "name" differs per app
├── tsconfig.json                    # identical across apps
├── public/staticwebapp.config.json  # identical across apps
├── vite.config.ts                   # per-app theme + title; sidebar: []; unique port
└── RESEARCH.md                      # planning skeleton (see references/research-skeleton.md)
```

Plus two lines added to the **root** `package.json` `scripts`. That's the whole registration — `apps/*` is already globbed in `pnpm-workspace.yaml`, so nothing else needs editing.

Deliberately **not** created:

- **`public/favicon.svg`** — the favicon is app-specific artwork, not boilerplate. Leave it out and tell the author to add their own. Copying another app's favicon would ship the wrong icon.
- **No deploy workflow** (`.github/workflows/deploy-<slug>.yml`) — apps start undeployed. Adding deployment is a separate, later decision.
- **No `src/` pages and no sidebar entries** — those come after RESEARCH.md is turned into content. The sidebar stays `[]`.

## Inputs to collect

Gather these before writing anything. Ask for whatever the user didn't already give you; infer sensible defaults for the rest and state them.

- **slug** — lowercase, no spaces (e.g. `buddhism`). Becomes the directory name, the `package.json` `name`, and the `dev:`/`preview:` script suffixes.
- **title** — the full site title (e.g. "Buddhism Primer"). Goes in `vite.config.ts` `title`.
- **siteTitle** — the short brand shown in the header (e.g. "Buddhism"). Usually the topic word.
- **description** — one line for `vite.config.ts` `description`.
- **topic / subject scope** — what the primer covers. Drives the RESEARCH.md skeleton. Note whether it's:
  - **broad (tradition-level)** — a whole domain with a conceptual core and a long tail of specialist material. Gets a Core / `extra: true` tiered inventory.
  - **focused (framework-level)** — one bounded framework whose structure is fixed by the subject. Single flat tier, no `extra`.
  - This mirrors the "App scope" guidance in the repo's `AGENTS.md`; read it if the grain is unclear.
- **mermaid** — whether the app needs diagrams. Sets `markdown.mermaid` true/false.
- **brandHue** — 0–360 for the theme accent. If the user has no preference, pick a hue not already used by another app and say which.

## Procedure

### 1. Pick a reference app and the next port

Choose any existing app under `apps/` as the boilerplate source (the most recently created one is a good model). Then find the next free port — apps must run side by side, so each needs a unique one:

```bash
cd <repo-root>
# highest port currently used across all apps, + 1
grep -rhoE 'port: [0-9]+' apps/*/vite.config.ts | grep -oE '[0-9]+' | sort -n | tail -1
```

Add 1 to that number; use it for **both** `server.port` and `preview.port`.

### 2. Create the app directory from the reference

Copy the byte-identical boilerplate verbatim, then generate the two files that differ:

- **`tsconfig.json`** and **`public/staticwebapp.config.json`** — copy from the reference app unchanged.
- **`package.json`** — copy from the reference, then change only the `name` field to the slug. Leave scripts, dependencies, and everything else exactly as-is.
- **`vite.config.ts`** — copy from the reference, then swap the per-app fields: `title`, `description`, `branding.siteTitle`, `themeDefaults.brandHue`, `markdown.mermaid`, and both ports. Set `sidebar: []`. Keep the structural fields (the `defineConfig` import from `@framework/core/vite`, `base`, `themeControls`, etc.) as the reference has them.

Do **not** create `public/favicon.svg`.

### 3. Register the app at the root

Add two entries to the **root** `package.json` `scripts`, matching the pattern the other apps use:

```json
"dev:<slug>": "vp run <slug>#dev",
"preview:<slug>": "vp run <slug>#preview"
```

### 4. Research the topic

Before writing RESEARCH.md, research the topic to understand its domain structure well enough to propose the full page inventory, sidebar, and sources. The goal is a RESEARCH.md the author only needs to review and approve — not fill in.

**Orientation fetches**

Fetch these in order, taking what exists:
- SEP main entry for the topic (`plato.stanford.edu/entries/...`)
- IEP main entry for the topic (`iep.utm.edu/...`)
- Britannica overview page for the topic (`britannica.com/topic/...`)

From these, establish:
- The major conceptual clusters (what are the core ideas?)
- The key texts, figures, schools, and practices
- The natural grain: broad (long conceptual tail needing an `extra:true` tier) or focused (bounded framework, flat structure)?

**Inventory design**

Propose 25–40 pages for broad topics, 10–20 for focused ones. Let the sources dictate the groupings — do not impose a generic template. For each page:
- Filename: PascalCase, topic's established term or plain English
- Scope: one sentence derived from what the sources say, not invented
- Type: Overview (anchors a section) or Detail (single concept/figure)

**Source mapping**

For each page or cluster of related pages, identify 1–3 source URLs that directly cover that material. Where SEP or IEP has a dedicated entry for a specific figure or text, find and verify that specific URL. For practices, schools, and historical material those sources don't cover in depth, find Britannica topic pages or specialist scholarly sites.

Verify every URL resolves before listing it. Do not list URLs you haven't confirmed are reachable.

**Do not use as sources:** Wikipedia, any wiki (fandom, wikia, etc.), Reddit, Quora, Medium, Substack, news articles, or AI-generated summary sites. Fine to read for orientation and to find real sources — must not appear in RESEARCH.md.

### 5. Write RESEARCH.md

Write `apps/<slug>/RESEARCH.md` using `references/research-skeleton.md` as the structure guide. Every section must be fully populated — no `<ANGLE BRACKET>` placeholders remaining, no unfilled guidance blockquotes.

The completed file must have:
- **Purpose** — one paragraph describing what this primer covers
- **Conventions** — mermaid on/off; if on, per-file diagram notes for any page that needs one
- **File inventory** — all tables populated, every row with a real scope sentence
- **Proposed sidebar** — every `path` matches a filename in the inventory
- **index.md outline** — brief description of each section the landing page will need
- **Sources** — per-URL entries grouped by source type, each with a parenthetical noting which pages it covers

Note at the top that RESEARCH.md is a temporary authoring scaffold — removed once pages are written, not a durable record.

### 6. Link the workspace package

Run `vp install` from the repo root so pnpm links the new workspace package and its scripts resolve.

## Verifying the scaffold

Do **not** run the full `vp run build` / `vp run ready` gate yet — it will fail by design because the sidebar is empty and there are no pages. That's the correct scaffold state, not a defect.

Confirm:

1. The five files exist under `apps/<slug>/` (no favicon).
2. `apps/<slug>/package.json` `name` is the slug; the chosen port appears in `vite.config.ts` for both `server` and `preview` and is not used by any other app.
3. The root `package.json` has the new `dev:<slug>` and `preview:<slug>` scripts.
4. `vp run dev:<slug>` starts the dev server (empty shell — expected).

Then present `RESEARCH.md` to the author for review. Key things for them to check:
- Page groupings and count make sense for the topic
- Scope sentences are accurate, not generic
- All source URLs resolve and are authoritative
- Grain (broad/focused) and `extra: true` tier are correct

Once they approve, `app-research` can take over and write all the pages.
