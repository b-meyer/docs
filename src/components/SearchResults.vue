<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { type SearchResult, targetFor, useSearch } from '@/scripts/search';

const { idPrefix = 'search-opt' } = defineProps<{ idPrefix?: string }>();

const { query, selectedIndex, results, closeSearch } = useSearch();

const listRef = ref<HTMLElement | null>(null);

type HighlightPart = { text: string; matched: boolean };

function highlightParts(
  text: string,
  indexes: ReadonlyArray<number> | undefined,
  start = 0,
  end = text.length,
): HighlightPart[] {
  const matched = new Set(indexes ?? []);
  const parts: HighlightPart[] = [];
  let buf = '';
  let bufMatched = false;
  for (let i = start; i < end; i++) {
    const ch = text[i]!;
    const m = matched.has(i);
    if (i === start) {
      buf = ch;
      bufMatched = m;
    } else if (m === bufMatched) {
      buf += ch;
    } else {
      parts.push({ text: buf, matched: bufMatched });
      buf = ch;
      bufMatched = m;
    }
  }
  if (buf) parts.push({ text: buf, matched: bufMatched });
  return parts;
}

function headingParts(r: SearchResult): HighlightPart[] {
  const head = r.obj.heading;
  const sub = r[0];
  return highlightParts(head, sub?.indexes);
}

function excerptParts(r: SearchResult): HighlightPart[] {
  const body = r.obj.body;
  const sub = r[1];
  if (!sub || sub.indexes.length === 0) {
    const slice = body.slice(0, 140);
    return [{ text: slice + (body.length > 140 ? '…' : ''), matched: false }];
  }
  const first = sub.indexes[0]!;
  const start = Math.max(0, first - 40);
  const end = Math.min(body.length, start + 140);
  const parts = highlightParts(body, sub.indexes, start, end);
  if (start > 0) parts.unshift({ text: '…', matched: false });
  if (end < body.length) parts.push({ text: '…', matched: false });
  return parts;
}

function onClickResult(): void {
  closeSearch();
}

watch(selectedIndex, (idx) => {
  void nextTick(() => {
    const el = listRef.value?.querySelector<HTMLElement>(`[data-result-idx="${idx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  });
});

watch(query, () => {
  if (listRef.value) listRef.value.scrollTop = 0;
});
</script>

<template>
  <div ref="listRef">
    <template v-if="results.length > 0">
      <ul class="p-2" role="listbox">
        <li
          v-for="(r, idx) in results"
          :key="`${r.obj.slug}#${r.obj.headingId}-${idx}`"
          :data-result-idx="idx"
        >
          <RouterLink
            :id="`${idPrefix}-${idx}`"
            :to="targetFor(r.obj)"
            role="option"
            :aria-selected="idx === selectedIndex"
            :class="[
              'block rounded-md px-3 py-2.5 transition-colors',
              idx === selectedIndex ? 'bg-primary-50 text-gray-900' : 'hover:bg-primary-50/60',
            ]"
            @click="onClickResult"
            @mouseenter="selectedIndex = idx"
          >
            <div class="text-xs text-gray-600">
              {{ r.obj.pageTitle }}
              <span v-if="r.obj.level > 1" class="text-gray-400"> › </span>
            </div>
            <div class="text-sm font-medium text-gray-900">
              <template v-for="(p, i) in headingParts(r)" :key="i">
                <mark v-if="p.matched" class="bg-primary-100 text-primary-900">{{ p.text }}</mark>
                <template v-else>{{ p.text }}</template>
              </template>
            </div>
            <div class="mt-0.5 text-xs leading-relaxed text-gray-600">
              <template v-for="(p, i) in excerptParts(r)" :key="i">
                <mark v-if="p.matched" class="bg-primary-100 text-primary-900">{{ p.text }}</mark>
                <template v-else>{{ p.text }}</template>
              </template>
            </div>
          </RouterLink>
        </li>
      </ul>
    </template>
    <div v-else-if="query.trim()" class="p-6 text-center text-sm text-gray-600">
      No matches for
      <span class="font-medium text-gray-700">"{{ query }}"</span>.
    </div>
    <div v-else class="space-y-3 p-6 text-xs text-gray-600">
      <p>Search across topics and their sections.</p>
      <ul class="space-y-1.5">
        <li>
          <kbd class="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">⌘K</kbd>
          <kbd class="ml-0.5 rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono"
            >Ctrl+K</kbd
          >
          to open
        </li>
        <li>
          <kbd class="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">↑</kbd>
          <kbd class="ml-0.5 rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono"
            >↓</kbd
          >
          to navigate
        </li>
        <li>
          <kbd class="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">Enter</kbd>
          to jump to a section
        </li>
        <li>
          <kbd class="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">Esc</kbd>
          to close
        </li>
      </ul>
    </div>
  </div>
</template>
