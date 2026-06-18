<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';

// --- Debounced search watcher ---
const query = ref('');
const committed = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

watch(query, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    committed.value = val;
  }, 400);
});

// --- watchEffect activity log ---
const count = ref(0);
const log = ref<string[]>([]);

watchEffect(() => {
  if (count.value > 0) {
    log.value = [`Fired: count is now ${count.value}`, ...log.value].slice(0, 6);
  }
});
</script>

<template>
  <PageLayout :frontmatter="{ title: 'Watchers' }">
    <h1>Watchers</h1>
    <p>
      Watchers let you run side effects in response to reactive state changes. Vue 3 provides two
      primitives: <code>watch</code> for explicit source tracking with access to old and new values,
      and <code>watchEffect</code> for automatic dependency tracking that re-runs whenever any
      reactive dependency it reads changes.
    </p>

    <h2><code>watch</code> — explicit source, lazy by default</h2>
    <p>
      <code>watch(source, callback)</code> only fires when <em>source</em> changes. The callback
      receives <code>(newValue, oldValue)</code>, making it ideal for comparing before/after state
      or performing async work like debounced API calls.
    </p>
    <p>The input below debounces updates to the committed value by 400 ms:</p>
    <div
      class="not-prose my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
    >
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Type something
      </label>
      <input
        v-model="query"
        type="text"
        placeholder="Start typing…"
        class="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Live:
        <code class="text-primary-600 dark:text-primary-400">{{ query || '—' }}</code> &nbsp;·&nbsp;
        Committed (400 ms):
        <code class="text-primary-600 dark:text-primary-400">{{ committed || '—' }}</code>
      </p>
    </div>

    <h2><code>watchEffect</code> — automatic tracking, eager</h2>
    <p>
      <code>watchEffect(fn)</code> runs <em>fn</em> immediately and re-runs it whenever any reactive
      value read inside <em>fn</em> changes. There is no explicit source list — Vue records
      dependencies automatically during each run.
    </p>
    <p>Increment the counter; each change is appended to the log below:</p>
    <div
      class="not-prose my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
    >
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="rounded bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          @click="count++"
        >
          Increment ({{ count }})
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="
            count = 0;
            log = [];
          "
        >
          Reset
        </button>
      </div>
      <ul class="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <li v-if="log.length === 0" class="italic">No activity yet.</li>
        <li v-for="entry in log" :key="entry">{{ entry }}</li>
      </ul>
    </div>

    <h2>Choosing between them</h2>
    <table>
      <thead>
        <tr>
          <th>Concern</th>
          <th><code>watch</code></th>
          <th><code>watchEffect</code></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Source tracking</td>
          <td>Explicit</td>
          <td>Automatic</td>
        </tr>
        <tr>
          <td>Runs on mount</td>
          <td>No (unless <code>immediate: true</code>)</td>
          <td>Yes</td>
        </tr>
        <tr>
          <td>Old value access</td>
          <td>Yes</td>
          <td>No</td>
        </tr>
        <tr>
          <td>Best for</td>
          <td>Async calls, before/after comparisons</td>
          <td>Syncing DOM, subscriptions</td>
        </tr>
      </tbody>
    </table>
  </PageLayout>
</template>
