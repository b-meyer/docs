/* eslint-disable import/max-dependencies, eslint/max-lines, eslint/max-lines-per-function --
   this is the plugin-wiring module: it intentionally centralises Vite plugins, markdown-it
   plugins, and feature-gate logic in one place. markdown plugins are imported individually
   (not via a barrel) for config-loader ESM safety (see the note below). */
import { existsSync } from 'node:fs';
import { join, resolve as pathResolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import anchor from 'markdown-it-anchor';
import Markdown from 'unplugin-vue-markdown/vite';
import type { HtmlTagDescriptor, Plugin, PluginOption, ViteDevServer } from 'vite';
import VueRouter from 'vue-router/vite';
import type { FrameworkConfig } from './config';
// NOTE: explicit `.ts` extensions and no barrel import here, deliberately.
// `plugin.ts` is loaded by Vite's Node config loader (a `.ts`-transpiling but
// Node-style ES resolver), which rejects directory imports (`./markdown`) and
// extensionless specifiers. This file is never in the browser/app import graph,
// so the unusual extensions stay isolated to the config-load path.
import { mdAlerts } from './markdown/alerts.ts';
import { mdCodeGroup } from './markdown/codeGroup.ts';
import { mdContainers } from './markdown/containers.ts';
import { mdLinkRewriter } from './markdown/linkRewriter.ts';
import { mdMermaid } from './markdown/mermaid.ts';
import { mdShiki } from './markdown/shiki.ts';
import { processSnippets } from './markdown/snippets.ts';
import { mdTableWrapper } from './markdown/tableWrapper.ts';
import { slugify } from './runtime/slugify.ts';
import { buildSearchIndexEntries } from './sitemap.ts';

export type FrameworkPluginOptions = Pick<FrameworkConfig, 'markdown'> & {
  /**
   * Absolute path to the consumer's pages directory. When provided, the dev
   * server serves `GET /search-index.json` on demand so that the lazy-fetch
   * search works in dev without a prior build step. Derived from rootDir when
   * omitted (set automatically by defineConfig).
   */
  pagesDir?: string;
};

// Module-level state set by defineConfig before Vite processes plugins.
let frameworkConfigStore: FrameworkConfig | null = null;
let rootDir: string = process.cwd();
let resolvedBase: string = '/';
let detectedRoutesFolder = 'src'; // updated by the config() hook once userConfig.root is known

export function setFrameworkConfig(config: FrameworkConfig): void {
  frameworkConfigStore = config;
}

export function getAppRoot(): string {
  return rootDir;
}

const VIRTUAL_CONFIG_ID = 'virtual:@framework/config';
const RESOLVED_VIRTUAL_CONFIG_ID = '\0virtual:@framework/config';

const VIRTUAL_ENTRY_ID = 'virtual:framework-entry';
const RESOLVED_VIRTUAL_ENTRY_ID = '\0virtual:framework-entry';

// Inline pre-paint script — runs before Vue hydrates to apply .dark and brand CSS vars.
// themeDefaults are baked in as the baseline; localStorage overrides win on top.
// Using inline setProperty() means these win over any stylesheet regardless of load order.
export function buildPrePaintScript(config: FrameworkConfig | null): string {
  const hue = config?.themeDefaults?.brandHue ?? 210;
  const intensity = (config?.themeDefaults?.brandIntensity ?? 50) / 100;
  return `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');document.documentElement.style.setProperty('--brand-hue','${hue}');var hRaw=localStorage.getItem('brand-hue');if(hRaw!==null){var h=Number(hRaw);if(Number.isFinite(h)&&h>=0&&h<=360){document.documentElement.style.setProperty('--brand-hue',String(h));}}document.documentElement.style.setProperty('--brand-intensity','${intensity}');var iRaw=localStorage.getItem('brand-intensity');if(iRaw!==null){var i=Number(iRaw);if(Number.isFinite(i)&&i>=0&&i<=100){document.documentElement.style.setProperty('--brand-intensity',String(i/100));}}}catch(e){}})();`;
}

function makeSearchIndexPlugin(explicitPagesDir: string | undefined): Plugin {
  return {
    name: 'framework:dev-search-index',
    configureServer(server: ViteDevServer) {
      const dir = explicitPagesDir ?? join(rootDir, detectedRoutesFolder);
      server.middlewares.use(`${resolvedBase}search-index.json`, (req, res, next) => {
        if (req.method !== 'GET') {
          next();
          return;
        }
        try {
          const entries = buildSearchIndexEntries(dir);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(entries));
        } catch {
          next();
        }
      });
    },
  };
}

function virtualModulesPlugin(): Plugin {
  return {
    name: 'framework:virtual-modules',
    resolveId(id) {
      if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
      if (id === VIRTUAL_ENTRY_ID) return RESOLVED_VIRTUAL_ENTRY_ID;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_CONFIG_ID) {
        if (!frameworkConfigStore)
          throw new Error(
            'framework: defineConfig must be called before this virtual module resolves',
          );
        return `export default ${JSON.stringify(frameworkConfigStore)};`;
      }
      if (id === RESOLVED_VIRTUAL_ENTRY_ID) {
        return [
          `import { createApp } from '@framework/core/ssg';`,
          `export { createApp };`,
          `if (!import.meta.env.SSR) { createApp(); }`,
        ].join('\n');
      }
    },
    configResolved(cfg) {
      rootDir = cfg.root;
      resolvedBase = cfg.base ?? '/';
      // Expose framework config so build.ts can read it after resolveConfig().
      (cfg as Record<string, unknown>)['__frameworkConfig'] = frameworkConfigStore;
    },
  };
}

function faviconMimeType(filename: string): string | undefined {
  if (filename.endsWith('.svg')) return 'image/svg+xml';
  if (filename.endsWith('.ico')) return 'image/x-icon';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.webp')) return 'image/webp';
  return undefined;
}

function buildConfigMetaTags(config: FrameworkConfig): HtmlTagDescriptor[] {
  const tags: HtmlTagDescriptor[] = [
    { tag: 'title', children: config.title, injectTo: 'head-prepend' },
    {
      tag: 'meta',
      attrs: { property: 'og:title', content: config.title },
      injectTo: 'head-prepend',
    },
  ];
  if (config.description) {
    tags.push(
      {
        tag: 'meta',
        attrs: { name: 'description', content: config.description },
        injectTo: 'head-prepend',
      },
      {
        tag: 'meta',
        attrs: { property: 'og:description', content: config.description },
        injectTo: 'head-prepend',
      },
    );
  }
  return tags;
}

/** Builds the ordered head tag list for one page. Used by both the dev plugin and SSG. */
export function buildHeadTags(config: FrameworkConfig | null, base: string): HtmlTagDescriptor[] {
  const favicon = config?.favicon ?? 'favicon.svg';
  const mimeType = faviconMimeType(favicon);
  const tags: HtmlTagDescriptor[] = [
    { tag: 'meta', attrs: { charset: 'UTF-8' }, injectTo: 'head-prepend' },
    {
      tag: 'link',
      attrs: { rel: 'icon', ...(mimeType ? { type: mimeType } : {}), href: `${base}${favicon}` },
      injectTo: 'head-prepend',
    },
    {
      tag: 'meta',
      attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      injectTo: 'head-prepend',
    },
    {
      tag: 'meta',
      attrs: { name: 'color-scheme', content: 'light dark' },
      injectTo: 'head-prepend',
    },
    {
      tag: 'meta',
      attrs: { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
      injectTo: 'head-prepend',
    },
    {
      tag: 'meta',
      attrs: { name: 'theme-color', content: '#1a1f24', media: '(prefers-color-scheme: dark)' },
      injectTo: 'head-prepend',
    },
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head-prepend' },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' }, injectTo: 'head-prepend' },
    { tag: 'script', children: buildPrePaintScript(config), injectTo: 'head-prepend' },
  ];
  if (config) tags.push(...buildConfigMetaTags(config));
  return tags;
}

const BODY_CLASS = 'bg-gray-25 font-sans text-gray-900 antialiased dark:bg-gray-50';

// Minimal HTML template: the virtual entry is the sole script; transformIndexHtml
// injects all meta tags and the pre-paint script before serving.
const DEV_HTML = `<!doctype html>
<html lang="en">
  <head>
    <script type="module" src="/@id/virtual:framework-entry"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`;

function injectHtmlPlugin(): Plugin {
  return {
    name: 'framework:inject-html',
    transformIndexHtml(html) {
      const patched = /<body(?![^>]*class)/iu.test(html)
        ? html.replace(/<body/iu, `<body class="${BODY_CLASS}"`)
        : html;
      return { html: patched, tags: buildHeadTags(frameworkConfigStore, resolvedBase) };
    },
  };
}

function devHtmlPlugin(): Plugin {
  return {
    name: 'framework:dev-html',
    configureServer(server: ViteDevServer) {
      // Pre-middleware (no return): must run BEFORE Vite's internal HTML middleware,
      // which sends a 404 when no index.html exists. Post-middleware (return () => {})
      // is too late — Vite already responded.
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '/';
        const accept = (req.headers.accept as string | undefined) ?? '';
        // SPA fallback: serve the app shell for any HTML navigation request.
        // Skip requests for static assets (URLs with a file extension) and
        // non-HTML requests (e.g. Vite HMR, API calls).
        if (!accept.includes('text/html') || (url !== '/' && /\.[^/]+$/u.test(url))) {
          next();
          return;
        }
        server
          .transformIndexHtml(url, DEV_HTML)
          .then((html) => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end(html);
          })
          // eslint-disable-next-line promise/no-callback-in-promise -- next() is the correct Express error propagation in Vite middleware
          .catch(next);
      });
    },
  };
}

/**
 * The framework's single Vite-plugin entry. Consumers do:
 *   `plugins: [frameworkPlugin({ markdown: { mermaid: true } })]`
 * Markdown-it plugin order is load-bearing:
 * anchor → linkRewriter → tableWrapper → mermaid → containers → alerts.
 */
export function frameworkPlugin(options: FrameworkPluginOptions = {}): PluginOption[] {
  const mermaidEnabled = Boolean(options.markdown?.mermaid);
  const shikiEnabled = Boolean(options.markdown?.shiki);
  // routesFolder must be computed here: VueRouter calls resolveOptions() immediately at
  // construction, before any config()/configResolved() hooks run. detectedRoutesFolder
  // (used by makeSearchIndexPlugin) is updated in the config() hook with the resolved root.
  const routesFolder = existsSync(join(process.cwd(), 'src', 'pages')) ? 'src/pages' : 'src';
  return [
    {
      name: 'framework:define-flags',
      config(userConfig) {
        if (!options.pagesDir) {
          const root = pathResolve(userConfig.root ?? process.cwd());
          detectedRoutesFolder = existsSync(join(root, 'src', 'pages')) ? 'src/pages' : 'src';
        }
        return { define: { __FRAMEWORK_MERMAID__: JSON.stringify(mermaidEnabled) } };
      },
    },
    virtualModulesPlugin(),
    devHtmlPlugin(),
    injectHtmlPlugin(),
    makeSearchIndexPlugin(options.pagesDir),
    VueRouter({ routesFolder, extensions: ['.md', '.vue'], dts: false }),
    vue({ include: [/\.vue$/u, /\.md$/u] }),
    Markdown({
      wrapperComponent: 'LayoutResolver',
      markdownItOptions: {
        html: options.markdown?.html ?? false,
        linkify: true,
        typographer: true,
      },
      transforms: {
        before: (code, id) => processSnippets(code, id),
      },
      async markdownItSetup(md) {
        md.use(anchor, { permalink: false, slugify });
        md.use(mdLinkRewriter, () => resolvedBase);
        md.use(mdTableWrapper);
        if (options.markdown?.mermaid) md.use(mdMermaid);
        if (shikiEnabled) {
          const [
            { createHighlighter, bundledLanguages },
            {
              transformerNotationDiff,
              transformerNotationFocus,
              transformerNotationErrorLevel,
              transformerNotationHighlight,
              transformerMetaHighlight,
            },
          ] = await Promise.all([import('shiki'), import('@shikijs/transformers')]);
          const hl = await createHighlighter({
            themes: ['github-light', 'github-dark-dimmed'],
            langs: Object.keys(bundledLanguages),
          });
          const shikiTransformers = [
            transformerNotationDiff(),
            transformerNotationFocus(),
            transformerNotationErrorLevel(),
            transformerNotationHighlight(),
            transformerMetaHighlight(),
          ];
          md.use(mdShiki, hl, shikiTransformers);
          md.use(mdCodeGroup, hl, shikiTransformers);
        }
        md.use(mdContainers);
        md.use(mdAlerts);
      },
    }),
    tailwindcss(),
  ];
}

export default frameworkPlugin;
