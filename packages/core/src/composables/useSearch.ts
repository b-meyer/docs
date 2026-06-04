import fuzzysort from 'fuzzysort';
import { computed, ref } from 'vue';
import type { FrameworkConfig } from '../config';
import { buildAllItems } from '../routerFactory';
import { slugify } from '../runtime/slugify';

// ---- Index types ----

export type SearchEntry = {
  slug: string;
  pageTitle: string;
  heading: string;
  headingId: string;
  level: 1 | 2 | 3;
  body: string;
};

export type IndexedEntry = SearchEntry & {
  headingTarget: Fuzzysort.Prepared;
  bodyTarget: Fuzzysort.Prepared;
};

export type SearchResult = Fuzzysort.KeysResult<IndexedEntry>;

// ---- Index parsing ----

const HEADING_RE = /^(#{1,3})\s+(.+)$/u;
// Sections whose heading matches this regex are excluded from the search
// index. "See also" sections are link bullets, not content — they were
// surfacing as body-only fuzzy matches on common query terms.
const SKIP_HEADING_RE = /^see also$/iu;

function stripMarkdown(s: string): string {
  return s
    .replaceAll(/`([^`]+)`/gu, '$1')
    .replaceAll(/\*\*([^*]+)\*\*/gu, '$1')
    .replaceAll(/\*([^*]+)\*/gu, '$1')
    .replaceAll(/_([^_]+)_/gu, '$1')
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/gu, '$1')
    .replaceAll(/<[^>]+>/gu, '')
    .replaceAll(/\s+/gu, ' ')
    .trim();
}

type RawSection = { level: 1 | 2 | 3; heading: string; bodyLines: string[] };

function parseSections(source: string): RawSection[] {
  const lines = source.split(/\r?\n/u);
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inCode = !inCode;
    }
    const m = inCode ? null : HEADING_RE.exec(line);
    if (m) {
      if (current) sections.push(current);
      const level = m[1]!.length as 1 | 2 | 3;
      current = { level, heading: m[2]!.trim(), bodyLines: [] };
    } else if (current && !inCode) {
      // Skip lines inside code fences so mermaid sources don't pollute the
      // search index / excerpts (was indexing `graph LR`, node labels, etc.).
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

// `hidden: true` in a page's leading `---\n…\n---` frontmatter opts it out of
// the search index. We scan raw markdown (not the unplugin-extracted
// frontmatter) so the filter stays in this module — cheap line-by-line check
// on the first ~30 lines.
function hasHiddenFrontmatter(source: string): boolean {
  if (!source.startsWith('---')) return false;
  const lines = source.split(/\r?\n/u);
  if (lines[0]?.trim() !== '---') return false;
  // Scan the whole leading block for the closing delimiter — a `layout: home`
  // page's hero/features frontmatter easily exceeds an arbitrary line cap.
  const limit = lines.length;
  let end = -1;
  for (let i = 1; i < limit; i++) {
    if (lines[i]?.trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return false;
  for (let i = 1; i < end; i++) {
    if (/^\s*hidden\s*:\s*true\s*$/u.test(lines[i] ?? '')) return true;
  }
  return false;
}

// Mirrors markdown-it-anchor's default dedup: same heading text on a page produces
// `slug`, `slug-1`, `slug-2`, ... with per-page state. Keeps search-result anchors
// aligned with rendered heading IDs even when headings repeat.
function uniqueSlug(base: string, seen: Set<string>): string {
  if (!seen.has(base)) {
    seen.add(base);
    return base;
  }
  let i = 1;
  let candidate = `${base}-${i}`;
  while (seen.has(candidate)) {
    i++;
    candidate = `${base}-${i}`;
  }
  seen.add(candidate);
  return candidate;
}

function buildEntries(rawPages: Record<string, string>, config: FrameworkConfig): SearchEntry[] {
  const titleBySlug = new Map(buildAllItems(config).map((i) => [i.slug, i.title]));
  const entries: SearchEntry[] = [];
  for (const [path, source] of Object.entries(rawPages)) {
    const slug = path.replace(/^.*\/([^/]+)\.md$/u, '$1');
    if (slug === 'NotFound') continue;
    if (hasHiddenFrontmatter(source)) continue;
    const pageTitle = titleBySlug.get(slug) ?? slug;
    const seen = new Set<string>();
    let added = 0;
    for (const sec of parseSections(source)) {
      if (SKIP_HEADING_RE.test(sec.heading)) continue;
      const fullId = uniqueSlug(slugify(sec.heading), seen);
      entries.push({
        slug,
        pageTitle,
        heading: sec.heading,
        headingId: sec.level === 1 ? '' : fullId,
        level: sec.level,
        body: stripMarkdown(sec.bodyLines.join('\n')),
      });
      added++;
    }
    if (added === 0) {
      console.warn(`useSearch: "${slug}" yielded zero sections — missing a leading "# H1"?`);
    }
  }
  return entries;
}

function prepare(e: SearchEntry): IndexedEntry {
  return {
    ...e,
    headingTarget: fuzzysort.prepare(e.heading),
    bodyTarget: fuzzysort.prepare(e.body),
  };
}

// ---- Index singleton ----

let index: IndexedEntry[] = [];

/**
 * Build the in-memory fuzzysort index from the consumer's raw `?raw` page glob.
 * Called once by `createSSGApp`. SSR-inert: search is a client-only UI, so on the
 * server we skip building (the consumer also passes `{}` under SSR), keeping the
 * index payload out of every prerendered route's HTML.
 */
export function createSearchIndex(rawPages: Record<string, string>, config: FrameworkConfig): void {
  if (import.meta.env.SSR) return;
  index = buildEntries(rawPages, config).map((e) => prepare(e));
}

// ---- Search ----

const BODY_WEIGHT = 0.6;
const SCORE_THRESHOLD = 0.3;
const RESULT_LIMIT = 10;

function scoreFn(r: Fuzzysort.KeysResult<IndexedEntry>): number {
  // r[0] / r[1] mirror the `keys: ['headingTarget', 'bodyTarget']` order below.
  // Body matches count as BODY_WEIGHT of a same-numerical heading match.
  const heading = r[0] ? r[0].score : 0;
  const body = r[1] ? r[1].score * BODY_WEIGHT : 0;
  return Math.max(heading, body);
}

function searchFor(q: string): readonly SearchResult[] {
  if (!q) return [];
  return fuzzysort.go(q, index, {
    keys: ['headingTarget', 'bodyTarget'],
    scoreFn,
    threshold: SCORE_THRESHOLD,
    limit: RESULT_LIMIT,
  });
}

// ---- Search UI state (module-scoped singleton) ----

const open = ref(false);
const query = ref('');
const selectedIndex = ref(0);
const results = computed(() => searchFor(query.value.trim()));

function openSearch(): void {
  open.value = true;
  query.value = '';
  selectedIndex.value = 0;
}
function closeSearch(): void {
  open.value = false;
}
function setQuery(q: string): void {
  query.value = q;
  selectedIndex.value = 0;
}
function moveSelection(delta: number): void {
  const n = results.value.length;
  selectedIndex.value = n === 0 ? 0 : (selectedIndex.value + delta + n) % n;
}
function setSelection(i: number): void {
  const n = results.value.length;
  if (n === 0) {
    selectedIndex.value = 0;
    return;
  }
  selectedIndex.value = Math.max(0, Math.min(n - 1, i));
}

export function targetFor(entry: IndexedEntry): string {
  return entry.headingId ? `/${entry.slug}#${entry.headingId}` : `/${entry.slug}`;
}

export function useSearch() {
  return {
    open,
    query,
    selectedIndex,
    results,
    openSearch,
    closeSearch,
    setQuery,
    moveSelection,
    setSelection,
  };
}
