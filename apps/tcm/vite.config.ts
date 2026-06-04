import { fileURLToPath, URL } from 'node:url';
import { buildSitemap, filterPublicRoutes } from '@framework/core/sitemap';
import { frameworkPlugin } from '@framework/core/vite';
import { defineConfig } from 'vite-plus';

// Build settings only. Lint + format live in the repo-root vite.config.ts (one
// canonical standard for the whole workspace); run `vp check` / `vp run ready`
// from the root. `vp check` is a separate step now, so `build` no longer
// `dependsOn` it.
const PAGES_DIR = fileURLToPath(new URL('./src/pages', import.meta.url));
const DIST_DIR = fileURLToPath(new URL('./dist', import.meta.url));
let renderedPaths: string[] = [];

export default defineConfig({
  plugins: [frameworkPlugin({ markdown: { mermaid: true } })],
  // Distinct dev/preview port per app so TCM and 8fold can run side by side.
  server: { port: 48455 },
  preview: { port: 48455 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  run: {
    tasks: {
      build: {
        command: 'vite-ssg build',
      },
    },
  },
  // @ts-expect-error — ssgOptions is a vite-ssg extension not declared on Vite+'s UserConfig
  ssgOptions: {
    dirStyle: 'nested',
    formatting: 'minify',
    includedRoutes(paths: string[]) {
      const kept = filterPublicRoutes(paths, PAGES_DIR);
      renderedPaths = kept;
      return kept;
    },
    onFinished: () => buildSitemap(DIST_DIR, renderedPaths),
  },
});
