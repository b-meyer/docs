import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { slugify } from './runtime/slugify.ts';
import {
  hasHiddenFrontmatter,
  parseSections,
  SKIP_HEADING_RE,
  stripMarkdown,
  uniqueSlug,
  type SearchEntry,
} from './searchParse.ts';

// Resolution order for the sitemap hostname: a CI/CD env var wins (so a pipeline
// can override without touching config), then `options.hostname` passed by the
// consumer's vite.config.ts, then a local placeholder (whose sitemap is never published).
const DEFAULT_HOSTNAME = 'http://localhost:5173';

// Dynamic-segment / wildcard paths from vue-router (e.g. `/:pathMatch(.*)*`,
// `/foo/:id`) can't be prerendered. Match any path vue-router would parameterize.
const DYNAMIC_PATH_RE = /[:*]/u;

function pageFilePath(path: string, pagesDir: string): string | null {
  const slug = path === '/' ? 'index' : path.replace(/^\//u, '').replace(/\/$/u, '');
  for (const candidate of [
    join(pagesDir, `${slug}.md`),
    join(pagesDir, `${slug}.vue`),
    join(pagesDir, slug, 'index.md'),
    join(pagesDir, slug, 'index.vue'),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Applied to candidate route paths to skip routes that should not land in the SSG output:
 * dynamic/wildcard routes (catch-all 404, param segments), and any page whose frontmatter sets
 * `hidden: true`. Vue pages (.vue) have no frontmatter mechanism and are always included.
 */
export function filterPublicRoutes(paths: string[], pagesDir: string): string[] {
  return paths.filter((p) => {
    if (DYNAMIC_PATH_RE.test(p)) return false;
    const filePath = pageFilePath(p, pagesDir);
    if (!filePath) return false;
    if (filePath.endsWith('.vue')) return true;
    let source = '';
    try {
      source = readFileSync(filePath, 'utf8');
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

/**
 * After the SSG build, call this to replace `'unsafe-inline'` in `script-src` with a SHA-256 hash
 * of each inline script in the built `index.html`. The hash is computed from the _built_ output
 * (after any minification), so it matches what the browser actually receives.
 *
 * The source `staticwebapp.config.json` retains `'unsafe-inline'` as a placeholder; this function
 * patches the _dist_ copy only.
 */
export function patchCspScriptHash(distDir: string): void {
  let indexHtml: string;
  try {
    indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
  } catch {
    return;
  }

  const scriptRe = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/giu;
  const hashes: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(indexHtml)) !== null) {
    const content = match[1]?.trim();
    if (content) {
      hashes.push(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
    }
  }

  if (hashes.length === 0) return;

  const configPath = join(distDir, 'staticwebapp.config.json');
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf8');
  } catch {
    return;
  }

  const config = JSON.parse(raw) as { globalHeaders?: Record<string, string> };
  const csp = config.globalHeaders?.['Content-Security-Policy'];
  if (!csp) return;

  const patched = csp.replace(
    "script-src 'self' 'unsafe-inline'",
    `script-src 'self' ${hashes.join(' ')}`,
  );
  if (patched === csp) return;

  config.globalHeaders!['Content-Security-Policy'] = patched;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

// PUBLIC_SITE_URL (and options.hostname) should be the origin only (e.g. 'https://host.com')
// without a subpath — the resolved Vite base is appended automatically via options.base.
export type SitemapOptions = { hostname?: string; base?: string };

export function buildSitemap(outDir: string, paths: string[], options: SitemapOptions = {}): void {
  const hostname = (process.env.PUBLIC_SITE_URL ?? options.hostname ?? DEFAULT_HOSTNAME).replace(
    /\/$/u,
    '',
  );
  const base = (options.base ?? '/').replace(/\/$/u, '');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.map(
    (p) =>
      `  <url>\n    <loc>${escapeXml(`${hostname}${base}${p}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf8');
}

/**
 * Reads all `.md` files in `pagesDir` and returns `SearchEntry[]` — the same payload that the
 * client lazy-fetches as `search-index.json`. Used both by `buildSearchIndex` (build-time write)
 * and `qdocsPlugin`'s dev-server middleware (on-demand serve).
 */
export function buildSearchIndexEntries(pagesDir: string): SearchEntry[] {
  // Recurse only for dedicated 'pages' dirs; shallow scan prevents non-page src/ files from indexing.
  const useRecursive = basename(pagesDir) === 'pages';
  const rawFiles = useRecursive
    ? (readdirSync(pagesDir, { recursive: true }) as string[])
    : (readdirSync(pagesDir) as string[]);
  const files = rawFiles
    .map((f) => f.replaceAll('\\', '/'))
    .filter((f) => f.endsWith('.md') || f.endsWith('.vue'));
  const entries: SearchEntry[] = [];
  for (const file of files) {
    const isMd = file.endsWith('.md');
    // Strip ext, then normalise 'guide/index' → 'guide' (dir index → parent route).
    const slug = file.slice(0, isMd ? -3 : -4).replace(/\/index$/u, '') || 'index';
    // Skip catch-all and dynamic-segment pages (vue-router conventions: [, *, :).
    if (/[[*:]/u.test(slug)) continue;

    if (!isMd) {
      // Vue pages have no markdown to parse; index as a single title-only entry
      // so they appear in search results.
      entries.push({ slug, pageTitle: slug, heading: slug, headingId: '', level: 1, body: '' });
      continue;
    }

    let source: string;
    try {
      source = readFileSync(join(pagesDir, file), 'utf8');
    } catch {
      continue;
    }
    if (hasHiddenFrontmatter(source)) continue;
    const sections = parseSections(source);
    // Use the H1 heading as the page title — authoritative source in the file.
    const pageTitle = sections.find((s) => s.level === 1)?.heading ?? slug;
    const seen = new Set<string>();
    for (const sec of sections) {
      if (SKIP_HEADING_RE.test(sec.heading)) continue;
      const headingId = sec.level === 1 ? '' : uniqueSlug(slugify(sec.heading), seen);
      entries.push({
        slug,
        pageTitle,
        heading: sec.heading,
        headingId,
        level: sec.level,
        body: stripMarkdown(sec.bodyLines.join('\n')),
      });
    }
  }
  return entries;
}

/**
 * Called from each app's `ssgOptions.onFinished`. Writes `search-index.json` to `outDir` so the
 * client can lazy-fetch it when search first opens instead of bundling raw markdown in the initial
 * JS chunk.
 */
export function buildSearchIndex(pagesDir: string, outDir: string): void {
  const entries = buildSearchIndexEntries(pagesDir);
  writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(entries), 'utf8');
}
