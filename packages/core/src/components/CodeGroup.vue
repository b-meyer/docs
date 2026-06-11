<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

defineProps<{ tabs: Array<{ label: string }> }>();
</script>

<template>
  <TabsRoot :default-value="tabs[0]?.label ?? ''" class="code-group not-prose my-6">
    <TabsList
      class="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg overflow-hidden"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.label"
        :value="tab.label"
        class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 data-[state=active]:border-primary-500 transition-colors"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="(tab, i) in tabs"
      :key="tab.label"
      :value="tab.label"
      class="[&_.shiki]:rounded-t-none [&_.shiki]:my-0"
    >
      <slot :name="`tab-${i}`" />
    </TabsContent>
  </TabsRoot>
</template>
