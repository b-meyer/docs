<script setup lang="ts">
import { computed, nextTick, onMounted, provide, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/components/AppNav.vue';
import PageNav from '@/components/PageNav.vue';
import { headFromFrontmatter } from '@/scripts/head';
import { runMermaid } from '@/scripts/mermaid';
import { FRONTMATTER_KEY, type PageFrontmatter } from '@/scripts/page';
import { neighbors, slugFromPath } from '@/scripts/router';

const props = defineProps<{ frontmatter?: PageFrontmatter }>();

headFromFrontmatter(props.frontmatter);

const route = useRoute();
const pair = computed(() => neighbors(slugFromPath(route.path)));

const articleEl = useTemplateRef<HTMLElement>('articleEl');
provide('article-el', articleEl);
provide(FRONTMATTER_KEY, props.frontmatter ?? {});

async function renderDiagrams(): Promise<void> {
  await nextTick();
  if (articleEl.value) await runMermaid(articleEl.value);
}

onMounted(renderDiagrams);
watch(() => route.path, renderDiagrams);
</script>

<template>
  <div
    class="mx-auto grid w-full max-w-[1440px] gap-6 px-8 pb-12 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[220px_minmax(0,1fr)_200px] *:py-12"
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
          :to="pair.prev.slug === 'index' ? '/' : `/${pair.prev.slug}`"
          class="group rounded-lg border border-gray-200 p-4 hover:border-primary-400"
        >
          <div class="text-xs text-gray-500">Previous</div>
          <div class="mt-1 font-medium text-gray-900 group-hover:underline">
            ← {{ pair.prev.title }}
          </div>
        </RouterLink>
        <span v-else />
        <RouterLink
          v-if="pair.next"
          :to="pair.next.slug === 'index' ? '/' : `/${pair.next.slug}`"
          class="group rounded-lg border border-gray-200 p-4 text-right hover:border-primary-400 md:col-start-2"
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
