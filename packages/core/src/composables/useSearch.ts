import fuzzysort from 'fuzzysort';
import { computed, ref, shallowRef } from 'vue';
import type { SearchEntry } from '../searchParse';

// ---- Index types ----

export type IndexedEntry = SearchEntry & {
  headingTarget: Fuzzysort.Prepared;
  bodyTarget: Fuzzysort.Prepared;
};

export type SearchResult = Fuzzysort.KeysResult<IndexedEntry>;

// Re-export so consumers can import SearchEntry from this module.
export type { SearchEntry };

// ---- Index preparation ----

function prepare(e: SearchEntry): IndexedEntry {
  return {
    ...e,
    headingTarget: fuzzysort.prepare(e.heading),
    bodyTarget: fuzzysort.prepare(e.body),
  };
}

// ---- Index singleton (lazy-fetched) ----

const index = shallowRef<IndexedEntry[]>([]);
let indexLoading = false;

/**
 * Fetches `search-index.json` (written at build time by `buildSearchIndex`, or
 * served on demand by the dev-server middleware) and populates the fuzzysort
 * index. Called once on first `openSearch()`. No-op if already loaded or
 * loading. Non-fatal if the fetch fails — search shows empty results.
 */
async function fetchSearchIndex(): Promise<void> {
  if (index.value.length > 0 || indexLoading) return;
  indexLoading = true;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`);
    if (!res.ok) return;
    const entries = (await res.json()) as SearchEntry[];
    index.value = entries.map((e) => prepare(e));
  } catch {
    // Network failure or JSON parse error — search stays empty.
  } finally {
    indexLoading = false;
  }
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
  const idx = index.value; // reactive read — results recompute when index loads
  if (!q || idx.length === 0) return [];
  return fuzzysort.go(q, idx, {
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

export function targetFor(entry: IndexedEntry): string {
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
