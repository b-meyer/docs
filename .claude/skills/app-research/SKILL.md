---
name: app-research
---

# Write Primer Content

This skill picks up after `scaffold-primer-app` has run and the user has completed RESEARCH.md. It takes the app from empty stubs to fully researched, written pages via a three-phase workflow.

## Preconditions

Before starting, verify:
- `apps/<app>/RESEARCH.md` exists and has been filled in (page inventory tables + Sources section)
- `apps/<app>/src/` exists (may be empty or already have stubs)
- `apps/<app>/vite.config.ts` exists with `sidebar: []`

If stubs already exist and the sidebar is already wired, skip Phase 1 and go straight to Phase 2.

---

## Phase 1: Scaffold Stubs and Wire the Sidebar

This phase is mechanical. Do not research or write content yet.

### 1a. Parse RESEARCH.md

Read `apps/<app>/RESEARCH.md` and extract:

1. **File inventory** — every row in every table under "File inventory". Each row gives you: filename, page title, type (Overview/Detail), and scope. Preserve the group the row belongs to (Foundation, Core Concepts, etc.) — you'll need it for Phase 2.

2. **Proposed sidebar** — the full `sidebar: [...]` array in the "Proposed vite.config.ts sidebar" code block. Copy it exactly — do not reconstruct it from the inventory tables.

3. **Sources section** — the full list of URLs and their descriptions. You will use this in Phase 2 to assign sources to pages.

### 1b. Create stub .md files

For each page in the inventory, create `apps/<app>/src/<Filename>.md`:

```
---
title: '<Page Title>'
description: '<One-sentence scope from the inventory table.>'
---

# <Page Title>
```

Also create `apps/<app>/src/index.md` with:
```
---
title: '<App Title>'
description: '<One sentence — what the collection covers and who it is for.>'
---

# <App Title>
```

The index.md will be written properly in Phase 3, after all content pages exist.

### 1c. Update vite.config.ts

Replace `sidebar: []` in `apps/<app>/vite.config.ts` with the sidebar array from RESEARCH.md verbatim.

### 1d. Verify

Run `vp check` and fix any errors before continuing.

---

## Phase 2: Build the Research Workflow Script

The research workflow is a Workflow tool script that spawns one agent per page. Each agent fetches its assigned sources, decides section structure from what the sources say, and writes the finished page directly to disk.

Read `references/workflow-template.md` now — it contains the full script structure and filling instructions.

The three things you must populate from RESEARCH.md before the script is runnable:

1. **`PAGES` array** — one entry per content page (not index.md). See the template for the required fields: `file`, `title`, `group`, `type`, `scope`, `sources`, `mermaid`.

2. **Source assignment** — for each page, pick 1–3 URLs from the RESEARCH.md Sources section that are most relevant to that page's scope. Prefer peer-reviewed sources (SEP, IEP) over encyclopedic ones (Britannica) when both cover the topic. Assign Britannica when no SEP/IEP entry exists for the topic. Assign the specialized source (Golden Elixir, Columbia, etc.) only to the pages it directly covers.

3. **Mermaid hints** — RESEARCH.md's Conventions section notes which pages should have diagrams. For those pages, set the `mermaid` field to a one-sentence instruction describing what the diagram should show. For all others, set `mermaid: null`.

Save the built script to the session scratchpad and note its path — you will pass it to the Workflow tool via `scriptPath`.

---

## Phase 3: Run the Workflow

Run the workflow group by group. Start with the first Core group (usually 2–3 pages) as a pilot.

```
Workflow({ scriptPath: '<path>', args: '<Group Name>' })
```

After the pilot completes, review 1–2 of the written pages:
- Do the sections follow what the sources actually say (not a generic template)?
- Are the §1-§40 content rules being applied?
- Are cross-links placed correctly?

If the pilot looks good, continue with the remaining groups. You can fire multiple groups in parallel by calling Workflow multiple times in the same turn — each is a separate background run.

Groups to run in order (adjust to match the actual RESEARCH.md group names):
1. Pilot group (first Core group) — review before continuing
2. Remaining Core groups
3. Additional Reading groups (can all fire in parallel)

After all content pages are complete, write `index.md` properly. Read `references/index-template.md` for the expected structure.

---

## Content Rules

These rules apply to every sentence in every page. They come from AGENTS.md §1–§40 and are embedded in each agent's prompt automatically by the workflow template. You do not need to enforce them manually — the workflow agents apply them.

If you see violations in the output, the workflow prompt is the place to fix them, not the output files directly.

---

## After All Pages Are Written

1. Run `vp check` — fix all lint/type errors.
2. Run `vp run test` — fix any test failures.
3. If routing changed: `vp run build`.
4. Consider running `/app-humanizer` over pages that feel dense or pattern-heavy.
