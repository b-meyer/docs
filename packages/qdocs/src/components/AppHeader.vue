<script setup lang="ts">
import {
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
const mounted = ref(false);
import { useRoute, useRouter } from 'vue-router';
import { useConfig } from '../composables/useConfig';
import { targetFor, useSearch } from '../composables/useSearch';
import AppNav from './AppNav.vue';
import AppSocialLinks from './AppSocialLinks.vue';
import AppTopNav from './AppTopNav.vue';
import SearchResults from './SearchResults.vue';
import ThemeToggle from './ThemeToggle.vue';

const config = useConfig();
const siteTitle = computed(() => config.branding?.siteTitle ?? config.title);
const base = computed(() => config.base ?? '/');
const logoSrc = computed<string | undefined>(() => {
  const logoOverride = config.branding?.logo;
  const favicon = config.favicon ?? 'favicon.svg';
  if (typeof logoOverride === 'string') return `${base.value}${logoOverride}`;
  return logoOverride !== false && favicon.endsWith('.svg') ? `${base.value}${favicon}` : undefined;
});

const {
  open,
  query,
  results,
  selectedIndex,
  openSearch,
  closeSearch,
  setQuery,
  moveSelection,
  setSelection,
} = useSearch();

const route = useRoute();
const router = useRouter();
const isMac = computed(() => mounted.value && /Mac/iu.test(navigator.platform));

const headerEl = useTemplateRef<HTMLElement>('headerEl');
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef');
const navOpen = ref(false);
let resizeObserver: ResizeObserver | null = null;

watch(
  () => route.path,
  () => {
    navOpen.value = false;
    closeSearch();
  },
);

function matchesNavActive(activeMatch: string | undefined): boolean {
  if (!activeMatch) return false;
  return new RegExp(activeMatch, 'u').test(route.path);
}

function navigateToSelected(): void {
  const r = results.value[selectedIndex.value];
  if (!r) return;
  void router.push(targetFor(r));
  closeSearch();
}

function escapeSearch(): void {
  setQuery('');
  closeSearch();
}

function onKey(e: KeyboardEvent): void {
  if (e.isComposing) return;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (open.value) {
      escapeSearch();
      return;
    }
    openSearch();
  }
}

onMounted(() => {
  mounted.value = true;
  window.addEventListener('keydown', onKey);
  if (!headerEl.value || typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const h = entry.contentRect.height + 1; // include the 1px bottom border
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  });
  resizeObserver.observe(headerEl.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <header
    ref="headerEl"
    class="dark:bg-gray-125/85 sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur"
  >
    <div class="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-8">
      <div class="flex items-center gap-4 md:gap-8">
        <DialogRoot v-if="mounted" v-model:open="navOpen">
          <DialogTrigger
            aria-label="Open navigation"
            class="hover:bg-primary-50 -ml-2 inline-flex size-10 items-center justify-center rounded text-gray-700 md:hidden"
          >
            <Bars3Icon class="size-5" aria-hidden="true" />
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay
              class="fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
            />
            <DialogContent
              class="scrollbar dark:bg-gray-125 fixed top-0 left-0 z-50 h-[100dvh] w-[280px] max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-200 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0"
            >
              <DialogTitle class="sr-only">Navigation</DialogTitle>
              <div class="mb-4 flex items-center justify-between">
                <span class="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <img
                    v-if="logoSrc"
                    :src="logoSrc"
                    :alt="siteTitle"
                    class="h-7 w-7 shrink-0"
                    aria-hidden="true"
                  />
                  <slot name="site-title">{{ siteTitle }}</slot>
                </span>
                <DialogClose
                  aria-label="Close navigation"
                  class="hover:bg-primary-50 inline-flex size-8 items-center justify-center rounded text-gray-700"
                >
                  <XMarkIcon class="size-4" aria-hidden="true" />
                </DialogClose>
              </div>

              <!-- Top nav links in mobile drawer -->
              <template v-if="config.nav?.length">
                <nav class="mb-3 space-y-0.5 text-sm" aria-label="Site navigation">
                  <template v-for="item in config.nav" :key="item.text">
                    <a
                      v-if="item.link && /^https?:\/\//u.test(item.link)"
                      :href="item.link"
                      :target="item.target ?? '_blank'"
                      rel="noopener noreferrer"
                      class="nav-link"
                    >
                      {{ item.text }}
                    </a>
                    <RouterLink
                      v-else-if="item.link"
                      :to="item.link"
                      custom
                      v-slot="{ href, navigate, isActive }"
                    >
                      <a
                        :href="href"
                        class="nav-link"
                        :class="{
                          active:
                            matchesNavActive(item.activeMatch) || (!item.activeMatch && isActive),
                        }"
                        @click="navigate"
                      >
                        {{ item.text }}
                      </a>
                    </RouterLink>
                    <details v-else-if="item.items" class="group/details">
                      <summary
                        class="nav-link flex cursor-pointer list-none items-center justify-between"
                      >
                        {{ item.text }}
                        <ChevronDownIcon
                          class="size-3.5 text-gray-400 transition-transform group-open/details:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <div class="mt-0.5 ml-3 space-y-0.5">
                        <template v-for="group in item.items" :key="group.text">
                          <p v-if="group.text" class="eyebrow mt-2 mb-0.5 px-3 text-gray-500">
                            {{ group.text }}
                          </p>
                          <template v-for="child in group.items" :key="child.text">
                            <a
                              v-if="child.link && /^https?:\/\//u.test(child.link)"
                              :href="child.link"
                              :target="child.target ?? '_blank'"
                              rel="noopener noreferrer"
                              class="nav-link"
                            >
                              {{ child.text }}
                            </a>
                            <RouterLink
                              v-else-if="child.link"
                              :to="child.link"
                              class="nav-link"
                              active-class="active"
                            >
                              {{ child.text }}
                            </RouterLink>
                          </template>
                        </template>
                      </div>
                    </details>
                  </template>
                </nav>
                <hr class="mb-4 border-gray-200" />
              </template>

              <AppNav />

              <!-- Social links at the bottom of the mobile drawer -->
              <template v-if="config.socialLinks?.length">
                <hr class="mt-4 border-gray-200" />
                <div class="mt-3">
                  <AppSocialLinks />
                </div>
              </template>
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
        <button
          v-else
          aria-label="Open navigation"
          class="hover:bg-primary-50 -ml-2 inline-flex size-10 items-center justify-center rounded text-gray-700 md:hidden"
          disabled
        >
          <Bars3Icon class="size-5" aria-hidden="true" />
        </button>

        <RouterLink to="/" class="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="siteTitle"
            class="h-7 w-7 shrink-0"
            aria-hidden="true"
          />
          <slot name="site-title">{{ siteTitle }}</slot>
        </RouterLink>

        <button
          type="button"
          aria-label="Open search"
          @click="openSearch()"
          class="dark:bg-gray-175 hidden items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 sm:flex dark:border-gray-200"
        >
          <MagnifyingGlassIcon class="size-4 shrink-0" aria-hidden="true" />
          <span>Search</span>
          <kbd class="ml-1">{{ isMac ? '⌘K' : 'Ctrl K' }}</kbd>
        </button>
      </div>

      <div class="flex items-center gap-4 md:gap-8">
        <AppTopNav />
        <div class="flex items-center gap-1">
          <AppSocialLinks class="hidden md:flex" />
          <ThemeToggle :color-controls="config.themeControls" />
          <button
            type="button"
            aria-label="Search"
            class="hover:bg-primary-50 inline-flex size-10 items-center justify-center rounded text-gray-700 sm:hidden"
            @click="openSearch()"
          >
            <MagnifyingGlassIcon class="size-5" aria-hidden="true" />
          </button>
        </div>
        <slot name="header-end" />
      </div>
    </div>

    <DialogRoot
      v-if="mounted"
      :open="open"
      @update:open="
        (v) => {
          if (!v) escapeSearch();
        }
      "
    >
      <DialogPortal>
        <DialogOverlay
          class="fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
        />
        <DialogContent
          class="scrollbar dark:bg-gray-125 fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
          @keydown.home.prevent="setSelection(0)"
          @keydown.end.prevent="setSelection(results.length - 1)"
          @keydown.page-down.prevent="moveSelection(5)"
          @keydown.page-up.prevent="moveSelection(-5)"
          @keydown.enter.prevent="navigateToSelected"
        >
          <DialogTitle class="sr-only">Search</DialogTitle>
          <div class="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
            <MagnifyingGlassIcon class="size-5 shrink-0 text-gray-400" aria-hidden="true" />
            <input
              ref="searchInputRef"
              :value="query"
              type="text"
              placeholder="Search..."
              aria-label="Search"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              :aria-expanded="open"
              aria-controls="search-modal-results"
              :aria-activedescendant="
                open && results.length ? `modal-opt-${selectedIndex}` : undefined
              "
              class="flex-auto bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
              autocomplete="off"
              spellcheck="false"
              @input="setQuery(($event.target as HTMLInputElement).value)"
            />
          </div>
          <SearchResults
            id="search-modal-results"
            id-prefix="modal-opt"
            class="scrollbar max-h-[60vh] overflow-y-auto"
          />
          <div
            :class="[
              'flex items-center gap-3.5 px-4 py-2 text-xs text-gray-400',
              (results.length > 0 || query.trim()) && 'border-t border-gray-200',
            ]"
          >
            <span class="flex items-center gap-1">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              Navigate
            </span>
            <span class="flex items-center gap-1">
              <kbd>Enter</kbd>
              Select
            </span>
            <span class="flex items-center gap-1">
              <kbd>Esc</kbd>
              Close
            </span>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </header>
</template>
