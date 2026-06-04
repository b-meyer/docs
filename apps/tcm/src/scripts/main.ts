import App from '@framework/core/App.vue';
import { createSSGApp } from '@framework/core/ssg';
import config from '../../framework.config';
import '@/styles/main.css';

// Literal, consumer-local globs (Vite's static analyzer can't follow variables).
const pages = import.meta.glob('../pages/*.md');
// Search is a client-only UI; skip the eager raw glob under SSR so each rendered
// route's HTML stays free of the index payload (see createSearchIndex).
const rawPages = import.meta.env.SSR
  ? {}
  : (import.meta.glob('../pages/*.md', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>);

export const createApp = createSSGApp(App, config, { pages, rawPages });
