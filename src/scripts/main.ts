import { ViteSSG } from 'vite-ssg';
import App from '@/components/App.vue';
import PageLayout from '@/components/PageLayout.vue';
import { routes, scrollBehavior } from '@/scripts/router';
import '@/styles/main.css';

export const createApp = ViteSSG(App, { routes, scrollBehavior }, ({ app }) => {
  app.component('PageLayout', PageLayout);
});
