import { defineConfig } from '@framework/core/vite';

export default defineConfig({
  title: 'Framework Showcase',
  description: 'Every rendering feature of the framework, demonstrated with Vue 3 guide content.',
  base: '/',
  branding: {
    siteTitle: 'Showcase',
  },
  markdown: {
    mermaid: true,
    html: true,
  },
  themeDefaults: {
    brandHue: 120,
    brandIntensity: 60,
  },
  sidebar: {
    '/': [
      {
        group: 'Vue Guide — Essentials',
        items: [
          { path: 'TemplateSyntax', title: 'Template Syntax' },
          { path: 'ReactivityFundamentals', title: 'Reactivity Fundamentals' },
          { path: 'ComponentBasics', title: 'Component Basics' },
          { path: 'LifecycleHooks', title: 'Lifecycle Hooks' },
          { path: 'ComputedProperties', title: 'Computed Properties' },
          { path: 'Watchers', title: 'Watchers' },
        ],
      },
    ],
    '/guide/': [
      {
        group: 'Guide',
        items: [{ path: 'guide/intro', title: 'Introduction' }],
      },
    ],
  },
  // Distinct dev/preview port per app so all three apps can run side by side.
  server: { port: 48457 },
  preview: { port: 48457 },
});
