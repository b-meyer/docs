import { defineConfig } from '@framework/core/config';

export default defineConfig({
  title: '8fold',
  description: 'A primer on the Noble Eightfold Path.',
  base: '/',
  branding: {
    siteTitle: '8fold',
    logoComponent: () => import('./src/Logo.vue'),
  },
  // Stock-prose consumer: no mermaid (and no shiki key at all).
  markdown: {
    mermaid: false,
  },
  sitemap: {
    hostname: 'https://8fold.example.com',
  },
  // Distinct brand hue from TCM (210) so the two sites are visibly different.
  // The actual default is set in src/styles/main.css (:root --brand-hue).
  themeDefaults: {
    brandHue: 35,
    brandIntensity: 55,
  },
  sidebar: [
    {
      group: 'Wisdom',
      items: [
        { slug: 'RightView', title: 'Right View' },
        { slug: 'RightIntention', title: 'Right Intention' },
      ],
    },
    {
      group: 'Ethical Conduct',
      items: [{ slug: 'RightSpeech', title: 'Right Speech' }],
    },
  ],
});
