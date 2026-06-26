<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { type SearchResult, targetFor, useSearch } from '../composables/useSearch';

const { idPrefix = 'search-opt' } = defineProps<{ idPrefix?: string }>();

const { query, selectedIndex, results, closeSearch } = useSearch();

const listRef = ref<HTMLElement | null>(null);

type HighlightPart = { text: string; matched: boolean };

// Marks all occurrences of any matched term in text as highlighted spans.
function highlightTerms(text: string, terms: readonly string[]): HighlightPart[] {
  if (terms.length === 0) return [{ text, matched: false }];
  const escaped = terms.map((t) => t.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
  const re = new RegExp(escaped.join('|'), 'giu');
  const parts: HighlightPart[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push({ text: text.slice(last, m.index), matched: false });
    parts.push({ text: m[0], matched: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), matched: false });
  return parts;
}

// Finds first term hit in body, returns a ~140-char excerpt around it with terms highlighted.
function buildExcerpt(body: string, terms: readonly string[]): HighlightPart[] {
  const escaped = terms.map((t) => t.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
  const re = escaped.length > 0 ? new RegExp(escaped.join('|'), 'iu') : null;
  const first = re?.exec(body);
  const start = first ? Math.max(0, first.index - 40) : 0;
  const end = Math.min(body.length, start + 140);
  const parts = highlightTerms(body.slice(start, end), terms);
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
  <div v-show="results.length > 0 || query.trim()" ref="listRef" role="listbox" class="p-2">
    <template v-if="results.length > 0">
      <RouterLink
        v-for="(r, idx) in results"
        :key="`${r.slug}#${r.headingId}-${idx}`"
        :id="`${idPrefix}-${idx}`"
        :to="targetFor(r)"
        role="option"
        :aria-selected="idx === selectedIndex"
        :data-result-idx="idx"
        :class="[
          'block rounded-sm px-3 py-2.5 transition-colors',
          idx === selectedIndex ? 'bg-primary-50 text-gray-900' : 'hover:bg-primary-50/60',
        ]"
        @click="onClickResult"
        @mouseenter="selectedIndex = idx"
      >
        <div class="text-xs text-gray-600">
          {{ r.pageTitle }}
          <span v-if="r.level > 1" class="text-gray-400"> › </span>
        </div>
        <div class="text-sm font-medium text-gray-900">
          <template v-for="(p, i) in highlightTerms(r.heading, r.terms)" :key="i">
            <mark v-if="p.matched" class="bg-primary-100 text-primary-900">{{ p.text }}</mark>
            <template v-else>{{ p.text }}</template>
          </template>
        </div>
        <div class="mt-0.5 text-xs leading-relaxed text-gray-600">
          <template v-for="(p, i) in buildExcerpt(r.body, r.terms)" :key="i">
            <mark v-if="p.matched" class="bg-primary-100 text-primary-900">{{ p.text }}</mark>
            <template v-else>{{ p.text }}</template>
          </template>
        </div>
      </RouterLink>
    </template>
    <div v-else-if="query.trim()" class="p-6 text-center text-sm text-gray-600">
      No matches for
      <span class="font-medium text-gray-700">"{{ query }}"</span>.
    </div>
  </div>
</template>
