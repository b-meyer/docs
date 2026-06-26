<script setup lang="ts">
import { useHead } from '@unhead/vue';

useHead({ title: 'Page not found' });
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
    <p class="text-8xl font-bold text-gray-200" aria-hidden="true">404</p>
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p class="text-gray-600">That page doesn't exist.</p>
    </div>
    <RouterLink
      to="/"
      class="bg-primary-500 hover:bg-primary-600 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors"
    >
      Back to home
    </RouterLink>
  </div>
</template>
