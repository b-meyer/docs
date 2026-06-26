<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useConfig } from '../composables/useConfig';
import { useReadingMode } from '../composables/useReadingMode';
import type { SidebarItem } from '../config';
import { homeItem, pathFromRoute, resolveSidebar } from '../routerFactory';

const config = useConfig();
const home = homeItem(config);

const route = useRoute();
const activeSidebar = computed(() => resolveSidebar(config, route.path));
const coreGroups = computed(() => activeSidebar.value.filter((g) => !g.extra));
const extraGroups = computed(() => activeSidebar.value.filter((g) => g.extra));
const extraPaths = computed(
  () => new Set(extraGroups.value.flatMap((g) => g.items.map((i) => i.path))),
);

const { showAdditional, setShowAdditional, syncFromStorage } = useReadingMode();

// Collapsible group state — config-driven initial state, component-local (no persistence).
// Initialised from coreGroups at setup time; safe for SSR because it derives from config.
const collapsedGroups = ref<Set<string>>(
  new Set(coreGroups.value.filter((g) => g.collapsed).map((g) => g.group)),
);
function toggleGroup(name: string): void {
  if (collapsedGroups.value.has(name)) {
    collapsedGroups.value.delete(name);
  } else {
    collapsedGroups.value.add(name);
  }
  // Trigger reactivity on the Set by reassigning
  collapsedGroups.value = new Set(collapsedGroups.value);
}

// All client-only (onMounted): `showAdditional` is a module-scoped singleton, so mutating
// it during SSG prerender would leak into every subsequently-rendered route. Deferring to
// mount keeps the server output deterministic and avoids hydration mismatches.
onMounted(() => {
  syncFromStorage();
  if (extraPaths.value.has(pathFromRoute(route.path)) && !showAdditional.value) {
    setShowAdditional(true);
  }
});

function itemLink(item: SidebarItem): string {
  if (item.path === 'index') return '/';
  return `/${item.path}`;
}
</script>

<template>
  <nav class="text-sm" aria-label="Sidebar">
    <div v-if="!showAdditional" class="contents space-y-5">
      <div v-for="group in coreGroups" :key="group.group">
        <button
          type="button"
          class="eyebrow mb-2 flex w-full items-center justify-between px-1"
          :aria-expanded="!collapsedGroups.has(group.group)"
          @click="toggleGroup(group.group)"
        >
          {{ group.group }}
          <ChevronDownIcon
            class="size-3.5 shrink-0 text-gray-400 transition-transform"
            :class="{ '-rotate-90': collapsedGroups.has(group.group) }"
            aria-hidden="true"
          />
        </button>
        <ul v-if="!collapsedGroups.has(group.group)" class="space-y-1">
          <li v-for="item in group.items" :key="item.path ?? item.href">
            <a
              v-if="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="nav-link"
              >{{ item.title }}</a
            >
            <RouterLink
              v-else-if="item.path"
              :to="itemLink(item)"
              class="nav-link"
              active-class="active"
            >
              {{ item.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
      <button
        v-if="extraGroups.length > 0"
        type="button"
        class="nav-link mt-6 w-full text-left text-gray-700 italic"
        @click="setShowAdditional(true)"
      >
        Additional Reading →
      </button>
    </div>
    <div v-else class="contents">
      <div class="flex items-center justify-between gap-2 px-3">
        <h3 class="eyebrow">Additional Reading</h3>
        <button
          type="button"
          aria-label="Hide additional reading"
          title="Hide additional reading"
          class="hover:bg-primary-50 -mr-1 inline-flex size-6 items-center justify-center rounded text-gray-500 hover:text-gray-900"
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
          <li v-for="item in group.items" :key="item.path ?? item.href">
            <a
              v-if="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="nav-link"
              >{{ item.title }}</a
            >
            <RouterLink
              v-else-if="item.path"
              :to="itemLink(item)"
              class="nav-link"
              active-class="active"
            >
              {{ item.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
