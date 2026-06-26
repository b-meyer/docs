<script setup lang="ts">
import { computed, nextTick, onMounted, provide, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useConfig } from '../composables/useConfig';
import { FRONTMATTER_KEY, type PageFrontmatter } from '../composables/useFrontmatter';
import { neighborsOf, pathFromRoute } from '../routerFactory';
import { headFromFrontmatter } from '../runtime/headFromFrontmatter';
import AppNav from './AppNav.vue';
import PageNav from './PageNav.vue';

const props = defineProps<{ frontmatter?: PageFrontmatter }>();

const config = useConfig();

headFromFrontmatter(props.frontmatter);

const route = useRoute();
const pair = computed(() => neighborsOf(config, pathFromRoute(route.path)));

const articleEl = useTemplateRef<HTMLElement>('articleEl');
provide('article-el', articleEl);
provide(FRONTMATTER_KEY, props.frontmatter ?? {});

async function renderDiagrams(): Promise<void> {
  // `__QDOCS_MERMAID__` is a build-time literal (see plugin.ts / App.vue):
  // when false, this branch and the mermaid chunk are tree-shaken from the bundle.
  if (!__QDOCS_MERMAID__) return;
  await nextTick();
  if (!articleEl.value) return;
  const { runMermaid } = await import('../runtime/mermaid');
  await runMermaid(articleEl.value);
}

onMounted(renderDiagrams);
watch(() => route.path, renderDiagrams);
</script>

<template>
  <div
    class="mx-auto grid w-full max-w-[1440px] gap-6 px-8 pb-12 *:py-12 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[220px_minmax(0,1fr)_200px]"
  >
    <aside class="hidden md:block">
      <div
        class="scrollbar sticky top-[calc(var(--header-h,4rem)+3rem)] max-h-[calc(100vh-var(--header-h,4rem)-3rem)] overflow-y-auto pr-2"
      >
        <AppNav />
      </div>
    </aside>
    <div class="min-w-0">
      <PageNav mobile />
      <article ref="articleEl" class="prose mx-auto max-w-[88ch]">
        <slot />
      </article>
      <nav
        v-if="pair.prev || pair.next"
        aria-label="Previous and next page"
        class="mt-12 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 md:grid-cols-2"
      >
        <RouterLink
          v-if="pair.prev"
          :to="pair.prev.path === 'index' ? '/' : `/${pair.prev.path}`"
          class="group hover:border-primary-400 rounded-lg border border-gray-200 p-4"
        >
          <div class="text-xs text-gray-500">Previous</div>
          <div class="mt-1 font-medium text-gray-900 group-hover:underline">
            ← {{ pair.prev.title }}
          </div>
        </RouterLink>
        <span v-else />
        <RouterLink
          v-if="pair.next"
          :to="pair.next.path === 'index' ? '/' : `/${pair.next.path}`"
          class="group hover:border-primary-400 rounded-lg border border-gray-200 p-4 text-right md:col-start-2"
        >
          <div class="text-xs text-gray-500">Next</div>
          <div class="mt-1 font-medium text-gray-900 group-hover:underline">
            {{ pair.next.title }} →
          </div>
        </RouterLink>
      </nav>
    </div>
    <aside class="hidden xl:block">
      <div
        class="scrollbar sticky top-[calc(var(--header-h,4rem)+3rem)] max-h-[calc(100vh-var(--header-h,4rem)-3rem)] overflow-y-auto pl-2"
      >
        <PageNav />
      </div>
    </aside>
  </div>
</template>
