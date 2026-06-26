<script setup lang="ts">
import { useConfig } from '../composables/useConfig';
import { SOCIAL_ICONS } from './socialIcons';

const config = useConfig();

function iconLabel(icon: string | { svg: string }): string {
  if (typeof icon === 'object') return 'Link';
  return icon.charAt(0).toUpperCase() + icon.slice(1);
}
</script>

<template>
  <div v-if="config.socialLinks?.length" class="flex items-center">
    <a
      v-for="link in config.socialLinks"
      :key="link.link"
      :href="link.link"
      :aria-label="link.ariaLabel ?? iconLabel(link.icon)"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:bg-primary-50 dark:hover:bg-gray-175 inline-flex size-10 items-center justify-center rounded text-gray-700 dark:text-gray-400 dark:hover:text-gray-100"
    >
      <!-- Custom SVG passthrough -->
      <span
        v-if="typeof link.icon === 'object'"
        aria-hidden="true"
        class="flex size-4 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        v-html="link.icon.svg"
      />
      <!-- Built-in icon -->
      <svg
        v-else
        aria-hidden="true"
        class="size-4"
        :viewBox="SOCIAL_ICONS[link.icon]?.viewBox ?? '0 0 24 24'"
        fill="currentColor"
      >
        <path :d="SOCIAL_ICONS[link.icon]?.d ?? ''" />
      </svg>
    </a>
  </div>
</template>
