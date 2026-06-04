/* eslint-disable import/max-dependencies -- this is the plugin-wiring module: it
   intentionally pulls in the Vite plugins + every markdown-it plugin, and the
   markdown plugins are imported individually (not via a barrel) for config-loader
   ESM safety (see the note below). */
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import anchor from 'markdown-it-anchor';
import Markdown from 'unplugin-vue-markdown/vite';
import type { PluginOption } from 'vite';
import type { FrameworkConfig } from './config';
// NOTE: explicit `.ts` extensions and no barrel import here, deliberately.
// `plugin.ts` is loaded by Vite's Node config loader (a `.ts`-transpiling but
// Node-style ES resolver), which rejects directory imports (`./markdown`) and
// extensionless specifiers. This file is never in the browser/app import graph,
// so the unusual extensions stay isolated to the config-load path.
import { mdAlerts } from './markdown/alerts.ts';
import { mdContainers } from './markdown/containers.ts';
import { mdLinkRewriter } from './markdown/linkRewriter.ts';
import { mdMermaid } from './markdown/mermaid.ts';
import { mdTableWrapper } from './markdown/tableWrapper.ts';
import { slugify } from './runtime/slugify.ts';

// The build plugin only needs the markdown options — deliberately NOT the whole
// FrameworkConfig. That keeps `vite.config.ts` (loaded by a Node bundler that
// can't process `.vue`) from having to import the full runtime config, which
// references a `logoComponent: () => import('./Logo.vue')`. The runtime config
// (sidebar, branding, logo) goes to `createSSGApp` in the browser entry instead.
export type FrameworkPluginOptions = Pick<FrameworkConfig, 'markdown'>;

/**
 * The framework's single Vite-plugin entry. Consumers do:
 *   `plugins: [frameworkPlugin({ markdown: { mermaid: true } })]`
 * (Vite flattens the nested array.) The markdown-it plugin order is load-bearing:
 * anchor → linkRewriter → tableWrapper → mermaid → containers → alerts. `mdMermaid`
 * is gated on `markdown.mermaid` so non-diagram consumers don't ship mermaid.
 */
export function frameworkPlugin(options: FrameworkPluginOptions = {}): PluginOption[] {
  const mermaidEnabled = Boolean(options.markdown?.mermaid);
  return [
    {
      // Build-time flag. Components gate their `import('./runtime/mermaid')` on
      // this literal so that when mermaid is disabled the dead branch — and the
      // entire mermaid chunk — is tree-shaken out of the consumer's bundle.
      // (A runtime `if (config.markdown.mermaid)` would NOT remove the chunk:
      // a statically-present dynamic import is always emitted.)
      name: 'framework:define-flags',
      config() {
        return { define: { __FRAMEWORK_MERMAID__: JSON.stringify(mermaidEnabled) } };
      },
    },
    vue({ include: [/\.vue$/u, /\.md$/u] }),
    Markdown({
      wrapperComponent: 'LayoutResolver',
      markdownItOptions: { html: true, linkify: true, typographer: true },
      markdownItSetup(md) {
        md.use(anchor, { permalink: false, slugify });
        md.use(mdLinkRewriter);
        md.use(mdTableWrapper);
        if (options.markdown?.mermaid) md.use(mdMermaid);
        md.use(mdContainers);
        md.use(mdAlerts);
      },
    }),
    tailwindcss(),
  ];
}

export default frameworkPlugin;
