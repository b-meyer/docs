import { defineConfig } from '@framework/core/vite';

export default defineConfig({
  title: '8fold',
  description: 'A primer on the Noble Eightfold Path.',
  base: '/',
  branding: {
    siteTitle: '8fold',
  },
  markdown: {
    mermaid: false,
  },
  themeDefaults: {
    brandHue: 35,
    brandIntensity: 55,
  },
  sidebar: [
    {
      group: 'Wisdom',
      items: [
        { path: 'RightView', title: 'Right View' },
        { path: 'RightIntention', title: 'Right Intention' },
      ],
    },
    {
      group: 'Ethical Conduct',
      items: [{ path: 'RightSpeech', title: 'Right Speech' }],
    },
  ],
  // Distinct dev/preview port per app so TCM and 8fold can run side by side.
  server: { port: 48456 },
  preview: { port: 48456 },
});
