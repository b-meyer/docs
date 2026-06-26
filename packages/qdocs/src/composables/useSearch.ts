import MiniSearch, { type MatchInfo } from 'minisearch';
import { computed, ref, shallowRef } from 'vue';
import type { SearchEntry } from '../searchParse';

// ---- Types ----

export type { SearchEntry };

// Flat result — storeFields land directly on the object, no r.obj.* nesting.
export type SearchResult = SearchEntry & {
  id: number;
  score: number;
  terms: string[]; // document words that matched — used for highlighting
  queryTerms: string[];
  match: MatchInfo;
};

// ---- Index singleton ----

type IndexedEntry = SearchEntry & { id: number };

const miniSearch = shallowRef<MiniSearch<IndexedEntry> | null>(null);
let indexLoading = false;

async function fetchSearchIndex(): Promise<void> {
  if (miniSearch.value || indexLoading) return;
  indexLoading = true;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`);
    if (!res.ok) return;
    const entries = (await res.json()) as SearchEntry[];
    const ms = new MiniSearch<IndexedEntry>({
      idField: 'id',
      fields: ['heading', 'body'],
      storeFields: ['slug', 'pageTitle', 'heading', 'headingId', 'level', 'body'],
    });
    ms.addAll(entries.map((e, i) => Object.assign(e as IndexedEntry, { id: i })));
    miniSearch.value = ms; // triggers results recompute
  } catch {
    // Network failure or parse error — search stays empty.
  } finally {
    indexLoading = false;
  }
}

// ---- Search ----

const RESULT_LIMIT = 10;
const MIN_QUERY_LENGTH = 2;

function searchFor(q: string): readonly SearchResult[] {
  const ms = miniSearch.value;
  if (q.length < MIN_QUERY_LENGTH || !ms) return [];

  const opts = {
    boost: { heading: 3 },
    // ≤4 chars: exact only — avoids noise for short technical tokens ("ts", "ci", "vm")
    // ≥5 chars: 0.2 fraction → 1 edit distance — handles "guthub" → "github"
    fuzzy: (term: string) => (term.length >= 5 ? 0.2 : false),
    prefix: true,
  };

  // AND first — all terms must appear (best precision for multi-word queries).
  // Fall back to OR if AND produces nothing.
  const andResults = ms.search(q, { ...opts, combineWith: 'AND' });
  return (andResults.length > 0 ? andResults : ms.search(q, { ...opts, combineWith: 'OR' })).slice(
    0,
    RESULT_LIMIT,
  ) as SearchResult[];
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
  void fetchSearchIndex();
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

export function targetFor(entry: Pick<SearchResult, 'slug' | 'headingId'>): string {
  // index.md maps to /, not /index — use the empty-string base to match the route.
  const path = entry.slug === 'index' ? '/' : `/${entry.slug}`;
  return entry.headingId ? `${path}#${entry.headingId}` : path;
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
