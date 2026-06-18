import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [vue()],
  define: {
    __FRAMEWORK_MERMAID__: false,
  },
  test: {
    include: ['src/**/*.test.ts'],
    pool: 'threads',
    clearMocks: true,
    restoreMocks: true,
  },
  pack: {
    entry: ['src/build.ts'],
    format: 'esm',
  },
  run: {
    tasks: {
      build: {
        command: 'vp pack',
      },
      test: {
        command: 'vp test',
      },
    },
  },
});
