import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import anchor from 'markdown-it-anchor';
import Markdown from 'unplugin-vue-markdown/vite';
import { defineConfig } from 'vite-plus';
import {
  mdAlerts,
  mdContainers,
  mdLinkRewriter,
  mdMermaid,
  mdTableWrapper,
} from './src/scripts/markdown.ts';
import { buildSitemap, filterPublicRoutes } from './src/scripts/sitemap.ts';
import { slugify } from './src/scripts/utils.ts';

const IGNORE_PATTERNS: string[] = [
  '.vite-ssg-temp',
  'dist',
  'dist-baseline',
  'docs',
  'node_modules',
];
const PAGES_DIR = fileURLToPath(new URL('./src/pages', import.meta.url));
const DIST_DIR = fileURLToPath(new URL('./dist', import.meta.url));
let renderedPaths: string[] = [];

export default defineConfig({
  plugins: [
    vue({ include: [/\.vue$/u, /\.md$/u] }),
    Markdown({
      wrapperComponent: 'PageLayout',
      markdownItOptions: { html: true, linkify: true, typographer: true },
      markdownItSetup(md) {
        md.use(anchor, { permalink: false, slugify });
        md.use(mdLinkRewriter);
        md.use(mdTableWrapper);
        md.use(mdMermaid);
        md.use(mdContainers);
        md.use(mdAlerts);
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  lint: {
    plugins: ['eslint', 'typescript', 'oxc', 'unicorn', 'import', 'vue', 'promise'],
    categories: {
      correctness: 'error',
      suspicious: 'error',
      perf: 'error',
      pedantic: 'error',
    },
    env: {
      browser: true,
      node: true,
      vue: true,
    },
    ignorePatterns: IGNORE_PATTERNS,
    rules: {
      'eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'smart'],
      'import/no-default-export': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'no-inline-comments': 'off',
      'no-warning-comments': 'off',
      'import/no-unassigned-import': ['error', { allow: ['**/*.css', '**/*.scss'] }],
    },
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      internalPattern: ['@/'],
      newlinesBetween: false,
    },
    ignorePatterns: IGNORE_PATTERNS,
  },
  run: {
    tasks: {
      build: {
        command: 'vite-ssg build',
        dependsOn: ['check'],
      },
    },
  },
  // @ts-expect-error — ssgOptions is a vite-ssg extension not declared on Vite+'s UserConfig
  ssgOptions: {
    dirStyle: 'nested',
    formatting: 'minify',
    includedRoutes(paths: string[]) {
      const kept = filterPublicRoutes(paths, PAGES_DIR);
      renderedPaths = kept;
      return kept;
    },
    onFinished: () => buildSitemap(DIST_DIR, renderedPaths),
  },
});
