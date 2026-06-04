<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useConfig } from '../composables/useConfig';
import { useReadingMode } from '../composables/useReadingMode';
import { homeItem, slugFromPath } from '../routerFactory';

const config = useConfig();
const home = homeItem(config);
const sidebar = config.sidebar;

const route = useRoute();
const coreGroups = sidebar.filter((g) => !g.extra);
const extraGroups = sidebar.filter((g) => g.extra);
const extraSlugs = new Set(extraGroups.flatMap((g) => g.items.map((i) => i.slug)));

const { showAdditional, setShowAdditional, syncFromStorage } = useReadingMode();
// All client-only (onMounted): `showAdditional` is a module-scoped singleton, so mutating
// it during SSG prerender would leak into every subsequently-rendered route (and route
// order is no longer deterministic under glob-driven routing). Deferring to mount keeps the
// server output deterministic (always the core sidebar) and avoids any hydration mismatch.
// `syncFromStorage` applies the persisted preference; then landing directly on an extras
// page (e.g. /Liver) flips it on so the sidebar shows the matching list.
onMounted(() => {
  syncFromStorage();
  if (extraSlugs.has(slugFromPath(route.path)) && !showAdditional.value) {
    setShowAdditional(true);
  }
});
</script>

<template>
  <nav class="text-sm" aria-label="Sidebar">
    <template v-if="!showAdditional">
      <ul class="space-y-1">
        <li>
          <RouterLink to="/" class="nav-link" exact-active-class="active">
            {{ home.title }}
          </RouterLink>
        </li>
      </ul>
      <div v-for="group in coreGroups" :key="group.group" class="mt-5">
        <h3 class="eyebrow mb-2 px-3">
          {{ group.group }}
        </h3>
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.slug">
            <RouterLink :to="`/${item.slug}`" class="nav-link" active-class="active">
              {{ item.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
      <button
        type="button"
        class="nav-link mt-6 w-full text-left text-gray-700 italic"
        @click="setShowAdditional(true)"
      >
        Additional Reading →
      </button>
    </template>
    <template v-else>
      <div class="flex items-center justify-between gap-2 px-3">
        <h3 class="eyebrow">Additional Reading</h3>
        <button
          type="button"
          aria-label="Hide additional reading"
          title="Hide additional reading"
          class="-mr-1 inline-flex size-6 items-center justify-center rounded text-gray-500 hover:bg-primary-50 hover:text-gray-900"
          @click="setShowAdditional(false)"
        >
          <XMarkIcon class="size-4" aria-hidden="true" />
        </button>
      </div>
      <div v-for="group in extraGroups" :key="group.group" class="mt-4">
        <h3 class="mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ group.group }}
        </h3>
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.slug">
            <RouterLink :to="`/${item.slug}`" class="nav-link" active-class="active">
              {{ item.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </template>
  </nav>
</template>
