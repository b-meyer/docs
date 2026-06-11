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
    shiki: true,
    html: true,
  },
  themeDefaults: {
    brandHue: 153,
    brandIntensity: 60,
  },
  nav: [
    { text: 'Features', link: '/', activeMatch: '^/(?!guide)' },
    { text: 'Guide', link: '/guide/', activeMatch: '^/guide' },
    {
      text: 'Resources',
      items: [
        {
          text: 'Community',
          items: [
            { text: 'GitHub', link: 'https://github.com/example/framework' },
            { text: 'Discord', link: 'https://discord.gg/example' },
          ],
        },
        {
          text: 'Releases',
          items: [{ text: 'Changelog', link: 'https://github.com/example/framework/releases' }],
        },
      ],
    },
  ],
  socialLinks: [
    { icon: 'github', link: 'https://github.com/example/framework', ariaLabel: 'GitHub' },
    { icon: 'discord', link: 'https://discord.gg/example', ariaLabel: 'Discord' },
    { icon: 'bluesky', link: 'https://bsky.app/profile/example.bsky.social', ariaLabel: 'Bluesky' },
  ],
  sidebar: {
    '/': [
      {
        group: 'Framework Features',
        items: [{ path: 'CodeBlocks', title: 'Code Blocks' }],
      },
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
