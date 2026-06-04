import { ViteSSG } from 'vite-ssg';
import type { Component } from 'vue';
import HomeLayout from './components/HomeLayout.vue';
import LayoutResolver from './components/LayoutResolver.vue';
import PageLayout from './components/PageLayout.vue';
import { createSearchIndex } from './composables/useSearch';
import { CONFIG_KEY, type FrameworkConfig } from './config';
import { createRoutes, scrollBehavior, type PagesGlob } from './routerFactory';

export type CreateSSGAppPages = {
  /** `import.meta.glob('./pages/*.md')` — lazy module loaders, one per page. */
  pages: PagesGlob;
  /** `import.meta.glob('./pages/*.md', { query: '?raw', import: 'default', eager: true })`. */
  rawPages: Record<string, string>;
};

/**
 * Framework wrapper around `ViteSSG`. Builds routes from the pages glob, seeds the
 * search index from the raw glob, registers global components, and provides the
 * config so descendants can `useConfig()`.
 *
 * Consumers call this from their entry (e.g. `src/scripts/main.ts`):
 *   `export const createApp = createSSGApp(App, config, { pages, rawPages })`
 */
export function createSSGApp(RootApp: Component, config: FrameworkConfig, opts: CreateSSGAppPages) {
  const routes = createRoutes(config, opts.pages);
  createSearchIndex(opts.rawPages, config);

  return ViteSSG(RootApp, { routes, scrollBehavior }, ({ app }) => {
    // LayoutResolver is the markdown wrapperComponent (referenced by name).
    // PageLayout/HomeLayout are imported by it directly, but are also registered
    // so consumer pages/overrides can reference them by name.
    app.component('LayoutResolver', LayoutResolver);
    app.component('PageLayout', PageLayout);
    app.component('HomeLayout', HomeLayout);
    app.provide(CONFIG_KEY, config);
  });
}
