# Workflow Script Template

This is the template for the research workflow script. Fill in the three placeholder sections marked with `// FILL FROM RESEARCH.md` before running.

The script uses the Workflow tool's `pipeline()` to run one agent per page. Each agent fetches its assigned sources, decides section structure, and writes the file.

---

## The Script

```javascript
export const meta = {
  name: '<app-name>-primer-pages',
  description: 'Research and write <App Name> primer content pages from scholarly sources',
  phases: [{ title: 'Write Pages' }],
}

// --- FILL FROM RESEARCH.md: content rules ---
// Read AGENTS.md §1-§40 and paste the rules as a string here.
// Keep every rule on one line in the format: §N  Description → correction
const CONTENT_RULES = `
§1  Significance inflation — "vital role" / "underscores its significance" / "pivotal" / "stands as a testament" → state what it does; drop the claim
§3  Participial padding — trailing "symbolizing…" / "reflecting…" / "contributing to…" → cut; stop at the fact
§4  Promotional adjectives — remarkable, sophisticated, profound, holistic, vibrant → cut or reword
§7  AI vocabulary — delve, tapestry, testament, showcase (v), pivotal, intricacies, interplay, fostering, garner, landscape (abstract), enduring, crucial → replace with plain verbs and nouns
§8  Copula avoidance — "serves as" / "stands as" / "marks a" / "represents a" → is / are / has
§9  Negative parallelism — "not merely X; it is Y" / "not just X, but Y" → state Y directly
§14 Structural punctuation — em-dash, en-dash, colon, semicolon in prose → rewrite naturally. Use ASCII hyphen only for: title/subtitle separators | Pinyin annotations | definition lists (**Term** - desc)
§15 Bold overuse — bold only on reference-list terms; not on prose emphasis
§16 Inline-header lists — **Term:** or **Term.** in list items → **Term** - desc
§17 Title-case H2+ — capitalize every significant word; lowercase: a an the and but or for nor of in to at by (unless first or last word)
§23 Filler phrases — "In order to" / "Due to the fact that" / "It is important to note" → cut
§24 Excessive hedging — "could potentially possibly be argued" → direct claim or "may"
§25 Generic conclusions — "The future looks bright" → end on a specific fact
§27 Authority tropes — "at its core" / "what really matters" / "fundamentally" → cut
§28 Signposting — "Let's dive in" / "Let's explore" → cut
§29 Fragmented headers — warm-up sentence after heading that only restates it → cut
§31 Staccato drama — 3+ short declarative fragments in a row for emphasis → rewrite as varied prose
§34 Temporal framing — "In today's rapidly evolving X" / "In a world where" → state the claim directly
§35 Vague attribution — "experts argue" / "research suggests" → name the source or state the claim directly
§36 Additive transitions — "Additionally," / "Furthermore," / "Moreover," / "In addition," → connect through sentence structure; cut the connector
§37 Triadic padding — adj, adj, and adj stacked for completeness → state what is specific; cut
§38 Elegant variation — synonym-swapping to avoid repeating a word → repeat the right word
§39 Challenges boilerplate — "Despite its X, [subject] faces challenges including Y" → state challenges directly
`

const PAGE_SHAPE = `Page shape:
- Frontmatter: title (exact page title) and description (one specific sentence)
- H1 matching the page title exactly
- Framing paragraph (2-4 sentences): what this concept is and why it appears in the primer
- H2 sections — let the sources dictate the breakdown, not a generic template
- H3 subsections where a topic has meaningful sub-parts
- Tables for structured information (correspondences, cycles, attributes)
- No summary or conclusion section — end on a specific fact
- Target: Overview pages 500-750 words; Detail pages 350-550 words
`

// --- FILL FROM RESEARCH.md: page inventory ---
// One entry per content page (not index.md).
// Fields:
//   file    - exact filename with .md extension
//   title   - exact page title from the inventory table
//   group   - sidebar group name (must match exactly for args filtering to work)
//   type    - 'Overview' or 'Detail' from the inventory table
//   scope   - the Scope column text from the inventory table
//   sources - array of 1-3 URLs from RESEARCH.md Sources section
//   mermaid - one-sentence diagram instruction, or null
const PAGES = [
  // Example entry — replace with actual pages:
  // {
  //   file: 'ExamplePage.md',
  //   title: 'Example Page',
  //   group: 'Foundation',
  //   type: 'Overview',
  //   scope: 'What this page covers.',
  //   sources: ['https://example.com/source'],
  //   mermaid: null,
  // },
]

// --- FILL FROM RESEARCH.md: cross-link list ---
// Comma-separated list of all .md filenames in the app.
// Used so agents know which pages to cross-link to.
const ALL_PAGES = `ExamplePage.md` // replace with full list

// --- Script body (do not edit below this line) ---

const targetPages = args ? PAGES.filter(p => p.group === args) : PAGES
log('Writing ' + targetPages.length + ' pages' + (args ? ' (group: ' + args + ')' : ' (all groups)'))

phase('Write Pages')
await pipeline(
  targetPages,
  page => agent(
    'You are writing a content page for a primer — a philosophy-first study aid for curious newcomers and educated adults.\n\n' +
    '## Assignment\n\n' +
    'Page title: ' + page.title + '\n' +
    'Type: ' + page.type + ' (Overview pages run 500-750 words; Detail pages 350-550 words)\n' +
    'Scope: ' + page.scope + '\n' +
    (page.mermaid ? 'Mermaid diagram: ' + page.mermaid + '\n' : '') +
    '\n## Steps\n\n' +
    '1. Fetch each source URL below. Read enough to understand the key claims, scholarly framing, and natural structure of the topic. If a URL fails or is blocked, use your training knowledge for that source, anchoring claims to what that source would say.\n\nDo not use Wikipedia, wikis (fandom, wikia), Reddit, Quora, Medium, Substack, news articles, or AI-generated summary sites as sources — they are fine for orientation but must not appear as the basis for any claim in the page.\n\n' +
    'Sources:\n' + page.sources.map(s => '- ' + s).join('\n') + '\n\n' +
    '2. Decide on H2 section headings from the natural structure of the material. Let the sources dictate the breakdown.\n\n' +
    '3. Write the complete page.\n\n' +
    '4. Write the finished file to: <REPO_ROOT>/apps/<APP>/src/' + page.file + '\n\n' +
    '## Page format\n\n' +
    'Start the file with YAML frontmatter (three dashes, title and description, three dashes), then a blank line, then the H1, then content:\n\n' +
    '  ---\n' +
    '  title: \'' + page.title + '\'\n' +
    '  description: \'One specific sentence describing what this page covers.\'\n' +
    '  ---\n\n' +
    '  # ' + page.title + '\n\n' +
    '  [framing paragraph]\n\n' +
    '  ## [Section]\n\n' +
    PAGE_SHAPE + '\n\n' +
    '## Content rules\n\n' +
    CONTENT_RULES + '\n\n' +
    '## Cross-linking\n\n' +
    'When you first mention a topic that has its own page in the primer, link it as [Display Text](Filename.md). Do not link a page to itself. Full page list:\n' +
    ALL_PAGES,
    { label: page.file, phase: 'Write Pages' }
  )
)
```

---

## Filling Instructions

### PAGES array

Pull directly from the File inventory tables in RESEARCH.md. For each row:

- `file` → Filename column
- `title` → Page Title column  
- `group` → the `###` heading above the table (e.g., `### Foundation` → `'Foundation'`)
- `type` → Type column (`'Overview'` or `'Detail'`)
- `scope` → Scope column (the description text)
- `sources` → assign from RESEARCH.md Sources section (see below)
- `mermaid` → from RESEARCH.md Conventions/Mermaid note, or `null`

### Source assignment

Read the Sources section of RESEARCH.md. Map each source to the pages it covers:

- A broad philosophical overview source (SEP, IEP main entry) → all Core Concepts pages and most Foundation/Ethics pages
- A text-specific source (e.g., SEP entry for a specific author) → that author's page and related text pages
- A religion/practice source (SEP religion entry, Golden Elixir, etc.) → Schools, Practice, Pantheon pages
- A topic-specific encyclopedic source (Britannica entry for Qigong, Tai chi, etc.) → only that specific page

Each page should get 1–3 sources. Avoid assigning a source that doesn't cover that page's scope.

### File write path

Replace `<REPO_ROOT>/apps/<APP>/src/` with the actual absolute path to the app's src directory before running.

### ALL_PAGES

List every `.md` filename in the app (from the File inventory), comma-separated. Include `index.md` at the end.
