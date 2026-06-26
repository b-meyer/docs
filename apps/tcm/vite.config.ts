import { defineConfig } from 'qdocs/vite';

export default defineConfig({
  title: 'TCM Primer',
  description: 'A reader for a Traditional Chinese Medicine primer.',
  base: '/',
  branding: {
    siteTitle: 'TCM',
  },
  markdown: {
    mermaid: true,
  },
  themeDefaults: {
    brandHue: 210,
    brandIntensity: 50,
  },
  sidebar: [
    {
      group: 'Foundation',
      items: [
        { path: 'YinYang', title: 'Yin & Yang (Dao)' },
        { path: 'WuXing', title: 'Wu Xing (Five Phases)' },
      ],
    },
    {
      group: 'Substances',
      items: [
        { path: 'Qi', title: 'Qi (Vital Energy)' },
        { path: 'Jing', title: 'Jing (Essence)' },
        { path: 'Shen', title: 'Shen (Spirit)' },
        { path: 'Xue', title: 'Xue (Blood)' },
        { path: 'JinYe', title: 'Jin Ye (Body Fluids)' },
      ],
    },
    {
      group: 'Synthesis & Practice',
      items: [
        { path: 'ZangFu', title: 'Zang-Fu (Organs)' },
        { path: 'Jingmai', title: 'Jingmai (Meridians)' },
        { path: 'Qigong', title: 'Qigong (Energy Work)' },
      ],
    },
    {
      group: 'Causes of Disease',
      extra: true,
      items: [
        { path: 'LiuYin', title: 'Liu Yin (Six Pathogens)' },
        { path: 'QiQing', title: 'Qi Qing (Seven Emotions)' },
      ],
    },
    {
      group: 'Diagnostic Apparatus',
      extra: true,
      items: [
        { path: 'BaGang', title: 'Ba Gang (Eight Principles)' },
        { path: 'SiZhen', title: 'Si Zhen (Four Examinations)' },
      ],
    },
    {
      group: 'Treatment',
      extra: true,
      items: [
        { path: 'Acupuncture', title: 'Acupuncture & Moxibustion' },
        { path: 'Herbs', title: 'Herbal Medicine' },
        { path: 'TuiNa', title: 'Tui Na (Massage)' },
        { path: 'Dietary', title: 'Dietary Therapy' },
      ],
    },
    {
      group: 'Zang-Fu Organs',
      extra: true,
      items: [
        { path: 'Liver', title: 'Liver (Gan)' },
        { path: 'Gallbladder', title: 'Gallbladder (Dan)' },
        { path: 'Heart', title: 'Heart (Xin)' },
        { path: 'SmallIntestine', title: 'Small Intestine' },
        { path: 'Pericardium', title: 'Pericardium (Xin Bao)' },
        { path: 'SanJiao', title: 'San Jiao (Triple Burner)' },
        { path: 'Spleen', title: 'Spleen (Pi)' },
        { path: 'Stomach', title: 'Stomach (Wei)' },
        { path: 'Lung', title: 'Lung (Fei)' },
        { path: 'LargeIntestine', title: 'Large Intestine' },
        { path: 'Kidney', title: 'Kidney (Shen)' },
        { path: 'Bladder', title: 'Bladder (Pang Guang)' },
      ],
    },
  ],
  // Distinct dev/preview port per app so TCM and 8fold can run side by side.
  server: { port: 48455 },
  preview: { port: 48455 },
});
