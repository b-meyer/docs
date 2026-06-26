<script setup lang="ts">
import HeaderEnd from 'virtual:@qdocs/header-end';
import { onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import { syncTheme } from './composables/useTheme';

let disposeColorScheme: (() => void) | undefined;
onMounted(async () => {
  syncTheme();
  // `__QDOCS_MERMAID__` is a build-time literal injected by qdocsPlugin.
  // When false, this whole branch (and the mermaid chunk) is tree-shaken away —
  // consumers with mermaid disabled never ship the dep.
  if (!__QDOCS_MERMAID__) return;
  const { watchColorScheme } = await import('./runtime/mermaid');
  disposeColorScheme = watchColorScheme();
});
onUnmounted(() => disposeColorScheme?.());
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      href="#main-content"
      class="dark:focus:bg-gray-125 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
    >
      Skip to content
    </a>
    <AppHeader>
      <template v-if="HeaderEnd" #header-end>
        <component :is="HeaderEnd" />
      </template>
    </AppHeader>
    <main id="main-content" tabindex="-1" class="w-full flex-auto focus:outline-none">
      <RouterView :key="$route.fullPath" />
    </main>
  </div>
</template>
