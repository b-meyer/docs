# RESEARCH.md structure guide

This file shows the required structure and conventions for a completed RESEARCH.md. Use it as a reference when writing the file from research — do not copy it as a skeleton and leave placeholders. Every `<ANGLE BRACKET>` below is a prompt for what to put there; none should appear in the finished file.

Two shaping rules:

- **Grain.** For a **broad (tradition-level)** topic, keep the Core / Additional Reading split (Additional Reading sidebar groups carry `extra: true`). For a **focused (framework-level)** topic, delete the Additional Reading tier entirely and keep one flat set of groups — the subject has no long tail to demote.
- **Completeness.** Every section must be fully populated from research before handing off to the author for review. The author's job is to approve, adjust, or redirect — not to fill in blanks.

---

```markdown
# RESEARCH.md — <Topic> primer content map

> Temporary authoring scaffold. This file plans the pages, the sidebar, and index.md
> for the <slug> app. It is removed once the content is authored — not a durable record.

## Purpose

This is the content map for the <Topic> primer. Each row in the inventory below becomes
one `.md` page in `src/`; the sidebar groups map to the sections here. Authoring the pages,
wiring the `vite.config.ts` sidebar, and writing `index.md` are the follow-up work this
document specifies.

## Conventions

- Filenames: **PascalCase**, no spaces or hyphens. Use the established term where the
  field has one (transliterate non-English terms); plain English where that reads naturally.
- Cross-links in content: `[Display](Other.md)` — resolves to `/Other`. Never hardcode `/Other`.
- Diagrams: this app has `markdown.mermaid` <on|off>. <If on, list each file that needs
  a diagram and one sentence describing what it should show — this is used directly by the
  research pass to generate the diagram. Example:
  - `Cosmogony.md` — flowchart showing the generative sequence (Dao → One → Two → Three → ten thousand things)
  - `WuXing.md` — two cycle diagrams: generating (sheng) and controlling (ke)
  If off, delete this bullet.>
- Tiering: Core groups carry the conceptual spine; supplementary groups are flagged
  `extra: true` in the sidebar (the workspace convention for de-emphasized sections).
  <Delete this line for a focused/framework-level topic.>

## File inventory

One row per page. Type = Overview (anchors a section) or Detail (a single concept/figure). Every filename here must appear in the sidebar below, and vice versa.

### Core

#### <Section name>

| Filename       | Page Title    | Type     | Scope                     |
| -------------- | ------------- | -------- | ------------------------- |
| `<Name>.md`    | <Title>       | Overview | <what the page covers>    |
| `<Name>.md`    | <Title>       | Detail   | <what the page covers>    |

<repeat per Core section>

### Additional Reading

Delete this whole tier for a focused/framework-level topic. For a broad topic, these are the specialist long-tail sections; their sidebar groups get `extra: true`.

#### <Section name>

| Filename       | Page Title    | Type     | Scope                     |
| -------------- | ------------- | -------- | ------------------------- |
| `<Name>.md`    | <Title>       | Detail   | <what the page covers>    |

## Proposed vite.config.ts sidebar

Core groups first, then any Additional Reading groups carrying `extra: true`. Every `path` must match a filename in the inventory above (no extension).

\`\`\`ts
sidebar: [
  // --- Core ---
  {
    group: '<Section name>',
    items: [
      { path: '<Name>', title: '<Title>' },
    ],
  },
  // --- Additional Reading (extra: true) ---  <delete for focused topics>
  {
    group: '<Section name>',
    extra: true,
    items: [
      { path: '<Name>', title: '<Title>' },
    ],
  },
],
\`\`\`

## index.md outline

The landing page will need: an intro paragraph (what the primer is and who it's for); a "How to Read This Collection" section (reading order across groups, Overview pages linked); a Working Vocabulary (8–12 recurring terms); Sources and Acknowledgements (pointing into the Sources section below).

## Sources

> Use verified, authoritative sources only. Prefer peer-reviewed reference works for
> conceptual/philosophical material and editorially-reviewed encyclopedias for
> historical/cultural material; cite a specialist source or print work where no reliable
> online entry exists. VERIFY every URL resolves before listing it.
>
> **Do not list these as sources** — they are fine navigation tools for finding real sources,
> but should not appear in RESEARCH.md or in any page's source attribution:
> Wikipedia and any wiki (wikia, fandom, etc.) · Reddit, Quora, forums · Medium, Substack,
> personal blogs · News articles (NYT, Guardian, etc.) · AI-generated summary sites ·
> General educational summaries (SparkNotes, etc.)
> Use them to orient yourself and find citable sources, then cite the citable source directly.
>
> **Good sources for this workspace:** SEP (plato.stanford.edu) · IEP (iep.utm.edu) ·
> Britannica (britannica.com, for topics without a SEP/IEP entry) · university/institutional
> sites · specialist scholarly sites · JSTOR journal articles · Oxford Reference/Bibliographies ·
> print reference works from academic publishers.
>
> Critical format rule: give ONE ENTRY PER URL, not one entry per publisher. Each entry
> needs a parenthetical noting which pages or concepts that specific URL covers — the
> research pass uses this to assign sources to individual pages. Group entries under
> named headings by source type.
>
> Format per entry: `- Topic (pages/concepts it covers): https://url`

### <Peer-reviewed reference — e.g. Stanford Encyclopedia of Philosophy>

- <Topic> (<which pages/concepts this URL is relevant for>): <url>
- <Topic> (<which pages/concepts this URL is relevant for>): <url>

### <Encyclopedic reference — e.g. Britannica>

- <Topic> (<which pages/concepts this URL is relevant for>): <url>

### <Specialist or domain-specific source> (if applicable)

- <Topic> (<which pages/concepts this URL is relevant for>): <url>

### Print reference (if applicable)

- <Author>, _<Title>_ (<Publisher, Year>) — covers: <list of topics with no dedicated online entry>
```
