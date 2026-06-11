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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
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
const headerEl = useTemplateRef<HTMLElement>('headerEl');
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInputRef');
const mobileSearchInputRef = useTemplateRef<HTMLInputElement>('mobileSearchInputRef');
const navOpen = ref(false);
const mobileSearchOpen = ref(false);
let resizeObserver: ResizeObserver | null = null;

watch(
  () => route.path,
  () => {
    navOpen.value = false;
    if (mobileSearchOpen.value) closeMobileSearch();
  },
);

function matchesNavActive(activeMatch: string | undefined): boolean {
  if (!activeMatch) return false;
  return new RegExp(activeMatch, 'u').test(route.path);
}

function navigateToSelected(): void {
  const r = results.value[selectedIndex.value];
  if (!r) return;
  void router.push(targetFor(r.obj));
  closeSearch();
  if (mobileSearchOpen.value) closeMobileSearch();
}

function escapeSearch(): void {
  setQuery('');
  closeSearch();
  if (mobileSearchOpen.value) {
    closeMobileSearch();
  } else {
    searchInputRef.value?.blur();
  }
}

function onFocusOut(e: FocusEvent): void {
  const next = e.relatedTarget as Node | null;
  const root = e.currentTarget as HTMLElement;
  if (!next || !root.contains(next)) closeSearch();
}

function openMobileSearch(): void {
  mobileSearchOpen.value = true;
  openSearch();
  void nextTick(() => mobileSearchInputRef.value?.focus());
}

function closeMobileSearch(): void {
  mobileSearchOpen.value = false;
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
    const isDesktop =
      typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches;
    if (isDesktop) {
      searchInputRef.value?.focus();
      openSearch();
    } else {
      openMobileSearch();
    }
  }
}

onMounted(() => {
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
    class="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur dark:bg-gray-125/85"
  >
    <div
      class="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:grid md:grid-cols-[220px_minmax(0,1fr)_auto_auto] md:gap-8 md:px-8 xl:grid-cols-[220px_minmax(0,1fr)_auto_auto]"
    >
      <DialogRoot v-model:open="navOpen">
        <DialogTrigger
          aria-label="Open navigation"
          class="-ml-2 inline-flex size-10 items-center justify-center rounded text-gray-700 hover:bg-primary-50 md:hidden"
        >
          <Bars3Icon class="size-5" aria-hidden="true" />
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay
            class="fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
          />
          <DialogContent
            class="scrollbar fixed top-0 left-0 z-50 h-[100dvh] w-[280px] max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-200 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 dark:bg-gray-125"
          >
            <DialogTitle class="sr-only">Navigation</DialogTitle>
            <div class="mb-4 flex items-center justify-between">
              <span class="text-lg font-semibold text-gray-900">
                <slot name="site-title">{{ siteTitle }}</slot>
              </span>
              <DialogClose
                aria-label="Close navigation"
                class="inline-flex size-8 items-center justify-center rounded text-gray-700 hover:bg-primary-50"
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
                    <div class="ml-3 mt-0.5 space-y-0.5">
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
              <hr class="mb-4 border-gray-200 dark:border-gray-700" />
            </template>

            <AppNav />

            <!-- Social links at the bottom of the mobile drawer -->
            <template v-if="config.socialLinks?.length">
              <hr class="mt-4 border-gray-200 dark:border-gray-700" />
              <div class="mt-3">
                <AppSocialLinks />
              </div>
            </template>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>

      <RouterLink to="/" class="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <slot name="site-title">{{ siteTitle }}</slot>
      </RouterLink>

      <div
        class="relative hidden max-w-[88ch] sm:ml-auto sm:block sm:flex-auto md:mx-auto md:w-full"
        @focusout="onFocusOut"
      >
        <MagnifyingGlassIcon
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          ref="searchInputRef"
          :value="query"
          type="text"
          placeholder="Search..."
          aria-label="Search (Ctrl+K)"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          :aria-expanded="open"
          aria-controls="search-results"
          :aria-activedescendant="
            open && results.length ? `search-opt-${selectedIndex}` : undefined
          "
          class="border-input h-9 w-full rounded bg-white pr-2 pl-9 text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-175"
          autocomplete="off"
          spellcheck="false"
          @focus="openSearch()"
          @input="setQuery(($event.target as HTMLInputElement).value)"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
          @keydown.home.prevent="setSelection(0)"
          @keydown.end.prevent="setSelection(results.length - 1)"
          @keydown.page-down.prevent="moveSelection(5)"
          @keydown.page-up.prevent="moveSelection(-5)"
          @keydown.enter.prevent="navigateToSelected"
          @keydown.esc.prevent="escapeSearch"
        />
        <SearchResults
          v-show="open"
          id="search-results"
          id-prefix="search-opt"
          class="scrollbar absolute inset-x-0 top-full z-40 mt-1 max-h-[60vh] overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-125"
        />
      </div>

      <AppTopNav />

      <div class="flex items-center justify-end">
        <AppSocialLinks class="hidden md:flex" />
        <slot name="nav-actions" />
        <ThemeToggle class="justify-self-end" />
        <button
          type="button"
          aria-label="Search"
          class="inline-flex size-10 items-center justify-center rounded text-gray-700 hover:bg-primary-50 sm:hidden"
          @click="openMobileSearch"
        >
          <MagnifyingGlassIcon class="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div
      v-if="mobileSearchOpen"
      class="absolute inset-x-0 top-0 z-50 bg-white sm:hidden dark:bg-gray-125"
      @focusout="onFocusOut"
    >
      <div class="flex items-center gap-2 border-b border-gray-200 px-3 py-3">
        <div class="relative flex-auto">
          <MagnifyingGlassIcon
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            ref="mobileSearchInputRef"
            :value="query"
            type="text"
            placeholder="Search..."
            aria-label="Search"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            :aria-expanded="open"
            aria-controls="mobile-search-results"
            :aria-activedescendant="
              open && results.length ? `msearch-opt-${selectedIndex}` : undefined
            "
            class="border-input h-9 w-full rounded bg-white pr-2 pl-9 text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-175"
            autocomplete="off"
            spellcheck="false"
            @input="setQuery(($event.target as HTMLInputElement).value)"
            @keydown.down.prevent="moveSelection(1)"
            @keydown.up.prevent="moveSelection(-1)"
            @keydown.home.prevent="setSelection(0)"
            @keydown.end.prevent="setSelection(results.length - 1)"
            @keydown.page-down.prevent="moveSelection(5)"
            @keydown.page-up.prevent="moveSelection(-5)"
            @keydown.enter.prevent="navigateToSelected"
            @keydown.esc.prevent="escapeSearch"
          />
        </div>
        <button
          type="button"
          aria-label="Close search"
          class="inline-flex size-10 shrink-0 items-center justify-center rounded text-gray-700 hover:bg-primary-50"
          @click="closeMobileSearch"
        >
          <XMarkIcon class="size-5" aria-hidden="true" />
        </button>
      </div>
      <SearchResults
        id="mobile-search-results"
        id-prefix="msearch-opt"
        class="scrollbar max-h-[calc(100dvh-var(--header-h,4rem))] overflow-y-auto bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-125"
      />
    </div>
  </header>
</template>
