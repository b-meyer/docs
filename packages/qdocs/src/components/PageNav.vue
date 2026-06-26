<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFrontmatter } from '../composables/useFrontmatter';

type Heading = { id: string; text: string; level: number };

const props = defineProps<{ mobile?: boolean }>();

const route = useRoute();
const router = useRouter();
const articleEl = inject<Readonly<Ref<HTMLElement | null>>>('article-el');
const frontmatter = useFrontmatter();
const headings = ref<Heading[]>([]);
const activeId = ref<string>('');
let observer: IntersectionObserver | null = null;
const visibleIds = new Set<string>();

function outlineSelector(): string | null {
  const o = frontmatter.outline;
  if (o === false) return null;
  const levels = Array.isArray(o) && o.length > 0 ? o : [2, 3];
  return levels.map((n) => `h${n}[id]`).join(', ');
}

function collect() {
  const article = articleEl?.value;
  const selector = outlineSelector();
  if (!article || !selector) {
    headings.value = [];
    return;
  }
  const nodes = article.querySelectorAll<HTMLElement>(selector);
  headings.value = Array.from(nodes).map((el) => ({
    id: el.id,
    text: el.textContent?.trim() ?? '',
    level: Number(el.tagName.slice(1)),
  }));
  if (!props.mobile) setupObserver(Array.from(nodes));
}

function setupObserver(nodes: HTMLElement[]) {
  observer?.disconnect();
  visibleIds.clear();
  if (nodes.length === 0) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleIds.add(entry.target.id);
        else visibleIds.delete(entry.target.id);
      }
      // Prefer the topmost heading currently in the trigger band.
      const topVisible = headings.value.find((h) => visibleIds.has(h.id));
      if (topVisible) {
        activeId.value = topVisible.id;
        return;
      }
      // Nothing in the band — we're reading the body of a section.
      // Pick the most recently scrolled-past heading (last one above viewport top).
      let lastAbove = '';
      for (const h of headings.value) {
        const el = document.querySelector(`#${CSS.escape(h.id)}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top < 0) lastAbove = h.id;
        else break;
      }
      if (lastAbove) activeId.value = lastAbove;
    },
    { rootMargin: '0px 0px -70% 0px', threshold: 0 },
  );
  for (const node of nodes) observer.observe(node);
}

function scrollTo(id: string, ev: MouseEvent) {
  ev.preventDefault();
  void router.replace({ hash: '#' + id });
  activeId.value = id;
}

onMounted(async () => {
  await nextTick();
  collect();
});

watch(
  () => route.path,
  async () => {
    await nextTick();
    collect();
  },
);

onBeforeUnmount(() => {
  observer?.disconnect();
  visibleIds.clear();
});
</script>

<template>
  <details
    v-if="mobile && headings.length"
    class="mb-8 rounded-lg border border-gray-200 p-3 text-sm xl:hidden"
  >
    <summary class="cursor-pointer font-medium text-gray-900">On this page</summary>
    <ul class="mt-3 space-y-1.5 border-l border-gray-200">
      <li
        v-for="h in headings"
        :key="h.id"
        :class="h.level === 2 ? 'pl-3' : h.level === 3 ? 'pl-6' : 'pl-9'"
      >
        <a :href="`#${h.id}`" class="outline-link" @click="scrollTo(h.id, $event)">
          {{ h.text }}
        </a>
      </li>
    </ul>
  </details>
  <aside v-else-if="!mobile && headings.length" class="text-sm">
    <h3 class="eyebrow mb-3">On this page</h3>
    <ul class="space-y-1.5 border-l border-gray-200">
      <li
        v-for="h in headings"
        :key="h.id"
        :class="h.level === 2 ? 'pl-3' : h.level === 3 ? 'pl-6' : 'pl-9'"
      >
        <a
          :href="`#${h.id}`"
          class="outline-link"
          :class="activeId === h.id ? 'active' : ''"
          @click="scrollTo(h.id, $event)"
        >
          {{ h.text }}
        </a>
      </li>
    </ul>
  </aside>
</template>
