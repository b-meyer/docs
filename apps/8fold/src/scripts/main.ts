import App from '@framework/core/App.vue';
import { createSSGApp } from '@framework/core/ssg';
import config from '../../framework.config';
import '@/styles/main.css';

// Literal, consumer-local glob (Vite's static analyzer can't follow variables).
const pages = import.meta.glob('../pages/*.md');

export const createApp = createSSGApp(App, config, { pages });
