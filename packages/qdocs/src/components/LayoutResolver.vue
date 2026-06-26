<script setup lang="ts">
import { computed } from 'vue';
import type { PageFrontmatter } from '../composables/useFrontmatter';
import HomeLayout from './HomeLayout.vue';
import PageLayout from './PageLayout.vue';

// Registered as the markdown `wrapperComponent`, so unplugin-vue-markdown passes
// the page's frontmatter here as a prop and the rendered body as the default slot.
// Dispatches on `frontmatter.layout`: `home` → HomeLayout, otherwise → PageLayout.
// Adding a third layout later is one more branch in `resolved`.
const props = defineProps<{ frontmatter?: PageFrontmatter }>();

const resolved = computed(() => (props.frontmatter?.layout === 'home' ? HomeLayout : PageLayout));
</script>

<template>
  <component :is="resolved" :frontmatter="frontmatter">
    <slot />
  </component>
</template>
