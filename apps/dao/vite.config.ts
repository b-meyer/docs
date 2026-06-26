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
    brandHue: 260,
    brandIntensity: 30,
  },
  sidebar: [
    { path: 'index', title: 'Home' },
    // --- Core ---
    {
      group: 'Foundation',
      items: [
        { path: 'DaojiaDaojiao', title: 'Daojia and Daojiao' },
        { path: 'Cosmogony', title: 'The Dao and Creation' },
      ],
    },
    {
      group: 'Core Concepts',
      items: [
        { path: 'Dao', title: 'The Dao' },
        { path: 'De', title: 'De' },
        { path: 'WuWei', title: 'Wu Wei' },
        { path: 'Ziran', title: 'Ziran' },
        { path: 'Pu', title: 'Pu' },
        { path: 'YinYang', title: 'Yin and Yang' },
        { path: 'Qi', title: 'Qi' },
        { path: 'WuXing', title: 'Wu Xing' },
        { path: 'ThreeTreasures', title: 'The Three Treasures' },
        { path: 'JingQiShen', title: 'Jing, Qi, Shen' },
      ],
    },
    {
      group: 'Texts & Teachers',
      items: [
        { path: 'Daodejing', title: 'The Daodejing' },
        { path: 'Laozi', title: 'Laozi' },
        { path: 'Zhuangzi', title: 'The Zhuangzi' },
        { path: 'Liezi', title: 'The Liezi' },
        { path: 'EarlyTexts', title: 'Other Early Texts' },
      ],
    },
    {
      group: 'Ethics & Society',
      items: [
        { path: 'Ethics', title: 'Daoist Ethics' },
        { path: 'Governance', title: 'Governing by Wu Wei' },
        { path: 'SanJiao', title: 'The Three Teachings' },
      ],
    },
    // --- Additional Reading (extra: true) ---
    {
      group: 'Schools & Movements',
      extra: true,
      items: [
        { path: 'HuangLao', title: 'Huang-Lao' },
        { path: 'CelestialMasters', title: 'The Celestial Masters' },
        { path: 'ShangqingLingbao', title: 'Shangqing and Lingbao' },
        { path: 'Zhengyi', title: 'Zhengyi' },
        { path: 'Quanzhen', title: 'Quanzhen' },
        { path: 'Daozang', title: 'The Daozang' },
      ],
    },
    {
      group: 'Cosmology & Pantheon',
      extra: true,
      items: [
        { path: 'SanQing', title: 'The Three Pure Ones' },
        { path: 'JadeEmperor', title: 'The Jade Emperor' },
        { path: 'Xian', title: 'Immortals (Xian)' },
      ],
    },
    {
      group: 'Practice & Cultivation',
      extra: true,
      items: [
        { path: 'Meditation', title: 'Daoist Meditation' },
        { path: 'Neidan', title: 'Alchemy: Neidan & Waidan' },
        { path: 'Qigong', title: 'Qigong' },
        { path: 'Taijiquan', title: 'Taijiquan' },
        { path: 'OtherPractices', title: 'Daoyin, Bigu, and More' },
        { path: 'FengShui', title: 'Feng Shui' },
        { path: 'Ritual', title: 'Ritual and Liturgy' },
      ],
    },
    {
      group: 'History',
      extra: true,
      items: [{ path: 'History', title: 'A History of Daoism' }],
    },
  ],
  // Distinct dev/preview port per app so TCM and 8fold can run side by side.
  server: { port: 48457 },
  preview: { port: 48457 },
});
