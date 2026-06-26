import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderDOMHead } from '@unhead/dom';
import { renderToString } from '@vue/server-renderer';
import { JSDOM } from 'jsdom';
import { build, resolveConfig, type HtmlTagDescriptor } from 'vite';
import type { QDocsConfig } from './config.ts';
import { buildHeadTags } from './plugin.ts';
import {
  buildSearchIndex,
  buildSitemap,
  filterPublicRoutes,
  patchCspScriptHash,
} from './sitemap.ts';

const ENTRY = 'virtual:qdocs-entry';
const TEMP_DIR = '.qdocs-ssg-temp';
const CONCURRENCY = 20;

type AppFactory = (
  route: string,
) => Promise<{ app: unknown; router: import('vue-router').Router; head: unknown }>;

type RenderOpts = {
  routePath: string;
  createApp: AppFactory;
  outDir: string;
  ssrManifest: Record<string, string[]>;
  routeModuleMap: Map<string, string>;
  mainJs: string;
  mainCss: string[];
  staticHead: string;
};

async function buildClientBundle(root: string, outDir: string): Promise<void> {
  console.info('[qdocs-ssg] Building for client...');
  await build({
    root,
    build: {
      outDir,
      ssrManifest: true,
      manifest: true,
      rollupOptions: { input: { app: ENTRY } },
    },
  });
}

async function buildServerBundle(root: string, tempDir: string): Promise<void> {
  console.info('[qdocs-ssg] Building for server...');
  mkdirSync(tempDir, { recursive: true });
  await build({
    root,
    build: {
      outDir: tempDir,
      ssr: true,
      ssrManifest: false,
      manifest: false,
      minify: false,
      rollupOptions: {
        input: { app: ENTRY },
        output: { entryFileNames: '[name].mjs', format: 'esm' },
      },
    },
  });
}

async function renderPage({
  routePath,
  createApp,
  outDir,
  ssrManifest,
  routeModuleMap,
  mainJs,
  mainCss,
  staticHead,
}: RenderOpts): Promise<void> {
  const { app, head } = await createApp(routePath);
  const appHtml = await renderToString(app as Parameters<typeof renderToString>[0]);
  const preloadLinks = buildPreloadLinks(routePath, ssrManifest, routeModuleMap);
  const fullHtml = buildPageHtml({ appHtml, mainJs, mainCss, preloadLinks, staticHead });
  const dom = new JSDOM(fullHtml, { url: 'http://localhost' });
  await renderDOMHead(head as Parameters<typeof renderDOMHead>[0], {
    document: dom.window.document,
  });
  const outPath =
    routePath === '/'
      ? join(outDir, 'index.html')
      : join(outDir, routePath.replace(/^\//u, ''), 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, minifyHtml(dom.serialize()), 'utf8');
  console.info(`  ${outPath.replace(outDir, '')}`);
}

type RouteDiscovery = { renderedPaths: string[]; pagesDir: string; createApp: AppFactory };

async function discoverRoutes(root: string, tempDir: string): Promise<RouteDiscovery> {
  const serverEntry = join(tempDir, 'app.mjs');
  const { createApp } = (await import(pathToFileURL(serverEntry).href)) as {
    createApp: AppFactory;
  };
  const { router } = await createApp('/');
  const allPaths = router
    .getRoutes()
    .map((r) => r.path)
    .filter((p) => p && !p.includes(':') && !p.includes('*') && !p.includes('['));
  const pagesDir = existsSync(join(root, 'src', 'pages'))
    ? join(root, 'src', 'pages')
    : join(root, 'src');
  return { renderedPaths: filterPublicRoutes(allPaths, pagesDir), pagesDir, createApp };
}

async function runBuild(): Promise<void> {
  const viteConfig = await resolveConfig({}, 'build', 'production');
  const root = viteConfig.root;
  const outDir = resolve(root, viteConfig.build.outDir ?? 'dist');
  const tempDir = join(root, TEMP_DIR);
  const qdocsConfig = (viteConfig as Record<string, unknown>)[
    '__qdocsConfig'
  ] as QDocsConfig | null;

  await buildClientBundle(root, outDir);
  await buildServerBundle(root, tempDir);

  const { renderedPaths, pagesDir, createApp } = await discoverRoutes(root, tempDir);
  console.info(`[qdocs-ssg] Rendering ${renderedPaths.length} pages...`);

  const base = viteConfig.base ?? '/';
  const { ssrManifest, mainJs, mainCss } = loadBuildArtifacts(outDir, base);
  const staticHead = buildStaticHead(qdocsConfig, base);

  // Build route→module-id map from the filesystem — same source of truth as unplugin-vue-router,
  // so SSG never guesses module IDs from URL paths.
  const pagesRelDir = relative(root, pagesDir).replaceAll('\\', '/');
  const routeModuleMap = buildRouteModuleMap(renderedPaths, pagesDir, pagesRelDir);

  const sharedOpts = {
    createApp,
    outDir,
    ssrManifest,
    routeModuleMap,
    mainJs,
    mainCss,
    staticHead,
  };
  await runConcurrent(
    renderedPaths.map((routePath) => () => renderPage({ routePath, ...sharedOpts })),
    CONCURRENCY,
  );

  buildSearchIndex(pagesDir, outDir);
  buildSitemap(outDir, renderedPaths, { hostname: process.env['PUBLIC_SITE_URL'], base });
  patchCspScriptHash(outDir);
  rmSync(tempDir, { recursive: true, force: true });
  console.info('[qdocs-ssg] Build finished.');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type BuildArtifacts = { ssrManifest: Record<string, string[]>; mainJs: string; mainCss: string[] };
type ManifestEntry = { file: string; css?: string[]; isEntry?: boolean };

function loadBuildArtifacts(outDir: string, base: string): BuildArtifacts {
  const ssrManifest = JSON.parse(
    readFileSync(join(outDir, '.vite', 'ssr-manifest.json'), 'utf8'),
  ) as Record<string, string[]>;
  const manifest = JSON.parse(
    readFileSync(join(outDir, '.vite', 'manifest.json'), 'utf8'),
  ) as Record<string, ManifestEntry>;
  // Vite keys virtual-module entries by their module ID, not the rollup input alias.
  const appEntry =
    manifest[ENTRY] ?? Object.values(manifest).find((e) => e.isEntry && e.file.endsWith('.js'));
  return {
    ssrManifest,
    mainJs: appEntry ? `${base}${appEntry.file}` : '',
    mainCss: appEntry?.css?.map((f) => `${base}${f}`) ?? [],
  };
}

function escAttr(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function serializeTag({ tag, attrs = {}, children }: HtmlTagDescriptor): string {
  const attrStr = Object.entries(attrs)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${escAttr(String(v))}"`))
    .join(' ');
  const open = attrStr ? `<${tag} ${attrStr}>` : `<${tag}>`;
  if (typeof children !== 'string') return open;
  // Script content is emitted raw; all other text is entity-escaped.
  const body = tag === 'script' ? children : escAttr(children);
  return `${open}${body}</${tag}>`;
}

function buildStaticHead(config: QDocsConfig | null, base: string): string {
  return buildHeadTags(config, base)
    .map((t) => serializeTag(t))
    .join('\n    ');
}

// Maps each rendered route to its source module ID (e.g. 'src/pages/Watchers.vue') by
// consulting the filesystem — the same source of truth unplugin-vue-router uses to generate
// routes. Built once before the render loop so buildPreloadLinks never guesses module IDs.
function buildRouteModuleMap(
  paths: string[],
  pagesDir: string,
  pagesRelDir: string,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const routePath of paths) {
    const slug = routePath === '/' ? 'index' : routePath.replace(/^\//u, '');
    outer: for (const ext of ['.md', '.vue']) {
      for (const rel of [`${slug}${ext}`, `${slug}/index${ext}`]) {
        if (existsSync(join(pagesDir, rel))) {
          map.set(routePath, `${pagesRelDir}/${rel}`);
          break outer;
        }
      }
    }
  }
  return map;
}

function buildPreloadLinks(
  routePath: string,
  ssrManifest: Record<string, string[]>,
  routeModuleMap: Map<string, string>,
): string {
  const moduleId = routeModuleMap.get(routePath);
  const seen = new Set<string>();
  const links: string[] = [];
  for (const file of (moduleId === undefined ? undefined : ssrManifest[moduleId]) ?? []) {
    if (seen.has(file)) continue;
    seen.add(file);
    if (file.endsWith('.js')) links.push(`<link rel="modulepreload" crossorigin href="${file}">`);
    else if (file.endsWith('.css')) links.push(`<link rel="stylesheet" href="${file}">`);
  }
  return links.join('\n    ');
}

function buildPageHtml(opts: {
  appHtml: string;
  mainJs: string;
  mainCss: string[];
  preloadLinks: string;
  staticHead: string;
}): string {
  const { appHtml, mainJs, mainCss, preloadLinks, staticHead } = opts;
  const cssLinks = mainCss.map((f) => `<link rel="stylesheet" href="${f}">`).join('\n    ');
  return `<!doctype html>
<html lang="en">
  <head>
    ${staticHead}
    ${cssLinks}
    ${preloadLinks}
    ${mainJs ? `<script type="module" src="${mainJs}"></script>` : ''}
  </head>
  <body class="bg-gray-25 font-sans text-gray-900 antialiased dark:bg-gray-50">
    <div id="app" data-server-rendered="true">${appHtml}</div>
  </body>
</html>`;
}

function minifyHtml(html: string): string {
  // Preserve <pre> content (code fences, mermaid) before whitespace collapse.
  // \uE000 is a Unicode PUA character — guaranteed absent from well-formed HTML.
  const pres: string[] = [];
  const safe = html.replaceAll(/<pre[\s\S]*?<\/pre>/giu, (match) => {
    pres.push(match);
    return `\uE000${pres.length - 1}\uE000`;
  });
  const out = safe
    .replaceAll(/\s+/gu, ' ')
    // '> <' removal intentionally absent: renderToString preserves inline text-node spaces
    // (e.g. </strong> <a>); stripping them breaks Vue SSR hydration.
    // Preserve Vue SSR hydration anchors: <!--v-if--> (empty conditional), <!----> (empty node),
    // and <!--[--> / <!--]--> (Fragment start/end). All other comments are stripped.
    .replaceAll(/<!--(?!\s*\[if|\s*<!\[endif|-->|v-if-->|\[-->|\]-->)[\s\S]*?-->/gu, '')
    .trim();
  return out.replaceAll(/\uE000(\d+)\uE000/gu, (_, i) => pres[Number(i)] ?? '');
}

async function runConcurrent(tasks: Array<() => Promise<void>>, limit: number): Promise<void> {
  const running = new Set<Promise<void>>();
  for (const task of tasks) {
    const p = task().finally(() => running.delete(p));
    running.add(p);
    // eslint-disable-next-line no-await-in-loop -- intentional throttle: drain when the pool is full
    if (running.size >= limit) await Promise.race(running);
  }
  await Promise.all(running);
}

try {
  await runBuild();
} catch (err: unknown) {
  console.error('[qdocs-ssg] Build failed:', err);
  process.exit(1);
}
