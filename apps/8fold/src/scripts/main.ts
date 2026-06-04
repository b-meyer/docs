import App from '@framework/core/App.vue';
import { createSSGApp } from '@framework/core/ssg';
import config from '../../framework.config';
import '@/styles/main.css';

const pages = import.meta.glob('../pages/*.md');
const rawPages = import.meta.env.SSR
  ? {}
  : (import.meta.glob('../pages/*.md', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>);

export const createApp = createSSGApp(App, config, { pages, rawPages });
