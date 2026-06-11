<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui';
import { useRoute } from 'vue-router';
import { useConfig } from '../composables/useConfig';
import type { NavDropdownGroup, NavItem } from '../config';

const config = useConfig();
const route = useRoute();

function isExternal(link: string): boolean {
  return /^https?:\/\//u.test(link);
}

function matchesActive(item: NavItem): boolean {
  if (!item.activeMatch) return false;
  return new RegExp(item.activeMatch, 'u').test(route.path);
}

function isDropdownActive(groups: NavDropdownGroup[]): boolean {
  return groups.some((g) =>
    g.items.some((child) => {
      if (child.activeMatch) return new RegExp(child.activeMatch, 'u').test(route.path);
      if (child.link && !isExternal(child.link)) {
        return child.link !== '/' && route.path.startsWith(child.link);
      }
      return false;
    }),
  );
}

const NAV_LINK_BASE = 'px-3 py-2 text-sm font-medium rounded transition-colors';
const NAV_LINK_INACTIVE =
  'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100';
const NAV_LINK_ACTIVE = 'text-primary-600';
</script>

<template>
  <nav class="hidden md:flex items-center">
    <template v-for="item in config.nav ?? []" :key="item.text">
      <!-- External simple link -->
      <a
        v-if="item.link && isExternal(item.link)"
        :href="item.link"
        :target="item.target ?? '_blank'"
        rel="noopener noreferrer"
        :class="[NAV_LINK_BASE, NAV_LINK_INACTIVE]"
      >
        {{ item.text }}
      </a>

      <!-- Internal simple link — use RouterLink v-slot for precise active control -->
      <RouterLink
        v-else-if="item.link"
        :to="item.link"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <a
          :href="href"
          :class="[
            NAV_LINK_BASE,
            (item.activeMatch ? matchesActive(item) : isActive)
              ? NAV_LINK_ACTIVE
              : NAV_LINK_INACTIVE,
          ]"
          @click="navigate"
        >
          {{ item.text }}
        </a>
      </RouterLink>

      <!-- Dropdown -->
      <PopoverRoot v-else-if="item.items">
        <PopoverTrigger
          class="group"
          :class="[
            NAV_LINK_BASE,
            'inline-flex items-center gap-1',
            isDropdownActive(item.items) ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE,
          ]"
        >
          {{ item.text }}
          <ChevronDownIcon
            class="size-3.5 transition-transform duration-150 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            :side-offset="8"
            align="start"
            class="z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-125"
          >
            <template v-for="(group, gi) in item.items" :key="group.text ?? gi">
              <hr v-if="gi > 0" class="my-1 border-gray-100 dark:border-gray-700" />
              <p v-if="group.text" class="eyebrow px-3 pt-1.5 pb-0.5 text-gray-500">
                {{ group.text }}
              </p>
              <template v-for="child in group.items" :key="child.text">
                <a
                  v-if="child.link && isExternal(child.link)"
                  :href="child.link"
                  :target="child.target ?? '_blank'"
                  rel="noopener noreferrer"
                  class="flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-175 dark:hover:text-gray-100"
                >
                  {{ child.text }}
                  <svg
                    class="size-3 shrink-0 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <RouterLink
                  v-else-if="child.link"
                  :to="child.link"
                  class="block px-3 py-1.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-175 dark:hover:text-gray-100"
                >
                  {{ child.text }}
                </RouterLink>
              </template>
            </template>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </template>
  </nav>
</template>
