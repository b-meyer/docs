import { defineConfig } from 'qdocs/vite';

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
    { path: 'index', title: 'Home' },
    {
      group: 'Foundation',
      items: [
        { path: 'FourNobleTruths', title: 'Four Noble Truths' },
        { path: 'EightFoldPath', title: 'Noble Eightfold Path' },
      ],
    },
    {
      group: 'Noble Eightfold Path',
      items: [
        { path: 'RightView', title: 'Right View' },
        { path: 'RightIntention', title: 'Right Intention' },
        { path: 'RightSpeech', title: 'Right Speech' },
        { path: 'RightAction', title: 'Right Action' },
        { path: 'RightLivelihood', title: 'Right Livelihood' },
        { path: 'RightEffort', title: 'Right Effort' },
        { path: 'RightMindfulness', title: 'Right Mindfulness' },
        { path: 'RightConcentration', title: 'Right Concentration' },
      ],
    },
    {
      group: 'Three Trainings',
      items: [
        { path: 'Sila', title: 'Sīla' },
        { path: 'Samadhi', title: 'Samādhi' },
        { path: 'Panna', title: 'Paññā' },
      ],
    },
    {
      group: 'Additional Reading',
      items: [{ path: 'ReadingGuide', title: 'Reading Guide' }],
    },
  ],
  // Distinct dev/preview port per app so TCM and 8fold can run side by side.
  server: { port: 48456 },
  preview: { port: 48456 },
});
