import './styles/entry.css';
import { createUnhead, headSymbol } from '@unhead/vue';
import config from 'virtual:@qdocs/config';
import { createSSRApp, nextTick } from 'vue';
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';
import App from './App.vue';
import { CodeGroup, HomeLayout, LayoutResolver, NotFoundPage, PageLayout } from './components';
import { CONFIG_KEY } from './config';
import { scrollBehavior } from './routerFactory';

/**
 * Creates the Vue app instance. Called once by the browser entry (no routePath — mounts to #app
 * after the router is ready) and once per route by the SSG build script (with routePath — navigates
 * then returns for renderToString).
 */
export async function createApp(routePath?: string) {
  // createSSRApp on both sides: server rendering works either way, but the client
  // side requires it to trigger hydration against the pre-rendered HTML.
  const app = createSSRApp(App);
  const head = createUnhead();
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
    routes: [...routes, { path: '/:pathMatch(.*)*', component: NotFoundPage }],
    scrollBehavior,
  });

  app.use(router);
  app.provide(headSymbol, head);
  app.component('CodeGroup', CodeGroup);
  app.component('LayoutResolver', LayoutResolver);
  app.component('PageLayout', PageLayout);
  app.component('HomeLayout', HomeLayout);
  app.provide(CONFIG_KEY, config);
  head.push({ titleTemplate: (title) => (title ? `${title} — ${config.title}` : config.title) });

  if (!import.meta.env.SSR) {
    // Move focus to #main-content on every client-side route change so keyboard
    // and screen-reader users don't need to re-navigate past the header on each page.
    router.afterEach(async () => {
      await nextTick();
      document.querySelector<HTMLElement>('#main-content')?.focus();
    });
    await router.isReady();
    app.mount('#app');
  } else if (routePath !== undefined) {
    await router.push(routePath);
    await router.isReady();
  }

  return { app, router, head };
}
