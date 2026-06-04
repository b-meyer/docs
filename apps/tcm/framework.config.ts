import { defineConfig } from '@framework/core/config';

export default defineConfig({
  title: 'TCM Primer',
  description: 'A reader for a Traditional Chinese Medicine primer.',
  base: '/',
  branding: {
    siteTitle: 'TCM',
    // Resolved at runtime by the framework header (browser only), so the .vue
    // import never reaches the Node config loader. Path is relative to this file.
    logoComponent: () => import('./src/Logo.vue'),
  },
  markdown: {
    mermaid: true,
  },
  sitemap: {
    hostname: 'https://tcm-primer.example.com',
  },
  themeDefaults: {
    brandHue: 210,
    brandIntensity: 50,
  },
  sidebar: [
    {
      group: 'Foundation',
      items: [
        { slug: 'YinYang', title: 'Yin & Yang (Dao)' },
        { slug: 'WuXing', title: 'Wu Xing (Five Phases)' },
      ],
    },
    {
      group: 'Substances',
      items: [
        { slug: 'Qi', title: 'Qi (Vital Energy)' },
        { slug: 'Jing', title: 'Jing (Essence)' },
        { slug: 'Shen', title: 'Shen (Spirit)' },
        { slug: 'Xue', title: 'Xue (Blood)' },
        { slug: 'JinYe', title: 'Jin Ye (Body Fluids)' },
      ],
    },
    {
      group: 'Synthesis & Practice',
      items: [
        { slug: 'ZangFu', title: 'Zang-Fu (Organs)' },
        { slug: 'Jingmai', title: 'Jingmai (Meridians)' },
        { slug: 'Qigong', title: 'Qigong (Energy Work)' },
      ],
    },
    {
      group: 'Causes of Disease',
      extra: true,
      items: [
        { slug: 'LiuYin', title: 'Liu Yin (Six Pathogens)' },
        { slug: 'QiQing', title: 'Qi Qing (Seven Emotions)' },
      ],
    },
    {
      group: 'Diagnostic Apparatus',
      extra: true,
      items: [
        { slug: 'BaGang', title: 'Ba Gang (Eight Principles)' },
        { slug: 'SiZhen', title: 'Si Zhen (Four Examinations)' },
      ],
    },
    {
      group: 'Treatment',
      extra: true,
      items: [
        { slug: 'Acupuncture', title: 'Acupuncture & Moxibustion' },
        { slug: 'Herbs', title: 'Herbal Medicine' },
        { slug: 'TuiNa', title: 'Tui Na (Massage)' },
        { slug: 'Dietary', title: 'Dietary Therapy' },
      ],
    },
    {
      group: 'Zang-Fu Organs',
      extra: true,
      items: [
        { slug: 'Liver', title: 'Liver (Gan)' },
        { slug: 'Gallbladder', title: 'Gallbladder (Dan)' },
        { slug: 'Heart', title: 'Heart (Xin)' },
        { slug: 'SmallIntestine', title: 'Small Intestine' },
        { slug: 'Pericardium', title: 'Pericardium (Xin Bao)' },
        { slug: 'SanJiao', title: 'San Jiao (Triple Burner)' },
        { slug: 'Spleen', title: 'Spleen (Pi)' },
        { slug: 'Stomach', title: 'Stomach (Wei)' },
        { slug: 'Lung', title: 'Lung (Fei)' },
        { slug: 'LargeIntestine', title: 'Large Intestine' },
        { slug: 'Kidney', title: 'Kidney (Shen)' },
        { slug: 'Bladder', title: 'Bladder (Pang Guang)' },
      ],
    },
  ],
});
