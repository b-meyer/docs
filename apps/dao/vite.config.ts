import { defineConfig } from 'qdocs/vite';

export default defineConfig({
  title: 'Dao Primer',
  description: 'A primer on the Dao.',
  base: '/',
  branding: {
    siteTitle: 'Dao',
  },
  markdown: {
    mermaid: true,
  },
  themeDefaults: {
    brandHue: 300,
    brandIntensity: 50,
  },
  themeControls: true,
  sidebar: [],
  // Distinct dev/preview port per app so TCM and 8fold can run side by side.
  server: { port: 48457 },
  preview: { port: 48457 },
});
