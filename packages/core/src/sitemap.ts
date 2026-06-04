import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Resolution order for the sitemap hostname: a CI/CD env var wins (so a pipeline
// can override without touching config), then `config.sitemap.hostname` passed by
// the consumer, then a local placeholder (whose sitemap is never published).
const DEFAULT_HOSTNAME = 'http://localhost:5173';

const HIDDEN_RE = /^\s*hidden\s*:\s*true\s*$/u;
// Dynamic-segment / wildcard paths from vue-router (e.g. `/:pathMatch(.*)*`,
// `/foo/:id`) can't be prerendered. Match any path vue-router would parameterize.
const DYNAMIC_PATH_RE = /[:*]/u;

function pathToMd(path: string, pagesDir: string): string {
  const slug = path === '/' ? 'index' : path.replace(/^\//u, '').replace(/\/$/u, '');
  return join(pagesDir, `${slug}.md`);
}

function hasHiddenFrontmatter(source: string): boolean {
  if (!source.startsWith('---')) return false;
  const lines = source.split(/\r?\n/u);
  if (lines[0]?.trim() !== '---') return false;
  // Scan the whole leading block for the closing delimiter — a `layout: home`
  // page's hero/features frontmatter easily exceeds an arbitrary line cap.
  const limit = lines.length;
  let end = -1;
  for (let i = 1; i < limit; i++) {
    if (lines[i]?.trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return false;
  for (let i = 1; i < end; i++) {
    if (HIDDEN_RE.test(lines[i] ?? '')) return true;
  }
  return false;
}

/**
 * Applied to `vite-ssg`'s candidate route paths to skip routes that should not
 * land in the SSG output: dynamic/wildcard routes (catch-all 404, param
 * segments), and any page whose frontmatter sets `hidden: true`.
 */
export function filterPublicRoutes(paths: string[], pagesDir: string): string[] {
  return paths.filter((p) => {
    if (DYNAMIC_PATH_RE.test(p)) return false;
    const mdPath = pathToMd(p, pagesDir);
    let source = '';
    try {
      source = readFileSync(mdPath, 'utf8');
    } catch {
      return false;
    }
    return !hasHiddenFrontmatter(source);
  });
}

function escapeXml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export type SitemapOptions = { hostname?: string };

export function buildSitemap(outDir: string, paths: string[], options: SitemapOptions = {}): void {
  const hostname = (process.env.PUBLIC_SITE_URL ?? options.hostname ?? DEFAULT_HOSTNAME).replace(
    /\/$/u,
    '',
  );
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.map(
    (p) =>
      `  <url>\n    <loc>${escapeXml(`${hostname}${p}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf8');
}
