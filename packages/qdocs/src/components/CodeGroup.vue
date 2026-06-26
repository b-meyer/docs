<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

defineProps<{ tabs: Array<{ label: string }> }>();
</script>

<template>
  <TabsRoot
    :default-value="tabs[0]?.label ?? ''"
    class="code-group not-prose my-6 overflow-hidden rounded-lg border border-gray-200"
  >
    <TabsList class="flex bg-gray-800 dark:bg-gray-200">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.label"
        :value="tab.label"
        class="data-[state=active]:border-primary-400 dark:data-[state=active]:border-primary-500 cursor-pointer border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-400 transition-colors hover:text-white data-[state=active]:text-white dark:text-gray-600 dark:hover:text-gray-900 dark:data-[state=active]:text-gray-900"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="(tab, i) in tabs"
      :key="tab.label"
      :value="tab.label"
      class="[&_.shiki]:my-0 [&_.shiki]:rounded-none"
    >
      <slot :name="`tab-${i}`" />
    </TabsContent>
  </TabsRoot>
</template>
