import { ViteSSG } from 'vite-ssg';
import { nextTick, type Component } from 'vue';
import HomeLayout from './components/HomeLayout.vue';
import LayoutResolver from './components/LayoutResolver.vue';
import PageLayout from './components/PageLayout.vue';
import { CONFIG_KEY, type FrameworkConfig } from './config';
import { createRoutes, scrollBehavior, type PagesGlob } from './routerFactory';

export type CreateSSGAppPages = {
  /** `import.meta.glob('./pages/*.md')` — lazy module loaders, one per page. */
  pages: PagesGlob;
};

/**
 * Framework wrapper around `ViteSSG`. Builds routes from the pages glob,
 * registers global components, and provides the config so descendants can
 * `useConfig()`. The search index is built at SSG time (`buildSearchIndex` in
 * `onFinished`) and lazy-fetched by the client when search first opens.
 *
 * Consumers call this from their entry (e.g. `src/scripts/main.ts`):
 *   `export const createApp = createSSGApp(App, config, { pages })`
 */
export function createSSGApp(RootApp: Component, config: FrameworkConfig, opts: CreateSSGAppPages) {
  const routes = createRoutes(config, opts.pages);

  return ViteSSG(RootApp, { routes, scrollBehavior }, ({ app, router, head, isClient }) => {
    // LayoutResolver is the markdown wrapperComponent (referenced by name).
    // PageLayout/HomeLayout are imported by it directly, but are also registered
    // so consumer pages/overrides can reference them by name.
    app.component('LayoutResolver', LayoutResolver);
    app.component('PageLayout', PageLayout);
    app.component('HomeLayout', HomeLayout);
    app.provide(CONFIG_KEY, config);
    // Set a global title template so routes without frontmatter `title` still
    // produce a distinct <title> (WCAG SC 2.4.2). Falls back to the site title
    // alone when the page has no title of its own.
    head?.push({ titleTemplate: (title) => (title ? `${title} — ${config.title}` : config.title) });
    // Move focus to #main-content on every client-side route change so keyboard
    // and screen-reader users don't need to re-navigate past the header on each
    // page. Gated on isClient — document is unavailable during SSG rendering.
    if (isClient) {
      router.afterEach(async () => {
        await nextTick();
        document.querySelector<HTMLElement>('#main-content')?.focus();
      });
    }
  });
}
