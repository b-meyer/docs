import { defineConfig } from 'vite-plus';

// Test task for `vp run -r test`. Build settings live in each consumer app's
// vite.config.ts; lint/format are root-owned (root vite.config.ts + `vp check`).
export default defineConfig({
  run: {
    tasks: {
      test: {
        command: 'vp test',
      },
    },
  },
});
