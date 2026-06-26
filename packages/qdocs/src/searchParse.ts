// Pure string-processing utilities shared between the Node.js build step
// (sitemap.ts → buildSearchIndex) and the browser composable (useSearch.ts).
// No imports — safe in both execution contexts with no Node-ESM concerns.

const HEADING_RE = /^(#{1,3})\s+(.+)$/u;
const HIDDEN_RE = /^\s*hidden\s*:\s*true\s*$/u;

// Headings matching this regex are excluded from the search index.
// "See also" sections are link bullets, not content.
export const SKIP_HEADING_RE = /^see also$/iu;

export type SearchEntry = {
  slug: string;
  pageTitle: string;
  heading: string;
  headingId: string;
  level: 1 | 2 | 3;
  body: string;
};

export type RawSection = { level: 1 | 2 | 3; heading: string; bodyLines: string[] };

export function hasHiddenFrontmatter(source: string): boolean {
  if (!source.startsWith('---')) return false;
  const lines = source.split(/\r?\n/u);
  if (lines[0]?.trim() !== '---') return false;
  // Scan the whole leading block — a `layout: home` page's frontmatter can be long.
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

export function stripMarkdown(s: string): string {
  return s
    .replaceAll(/`([^`]+)`/gu, '$1')
    .replaceAll(/\*\*([^*]+)\*\*/gu, '$1')
    .replaceAll(/\*([^*]+)\*/gu, '$1')
    .replaceAll(/_([^_]+)_/gu, '$1')
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/gu, '$1')
    .replaceAll(/<[^>]+>/gu, '')
    .replaceAll(/\s+/gu, ' ')
    .trim();
}

export function parseSections(source: string): RawSection[] {
  const lines = source.split(/\r?\n/u);
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inCode = !inCode;
    }
    const m = inCode ? null : HEADING_RE.exec(line);
    if (m) {
      if (current) sections.push(current);
      const level = m[1]!.length as 1 | 2 | 3;
      current = { level, heading: m[2]!.trim(), bodyLines: [] };
    } else if (current && !inCode) {
      // Skip lines inside code fences so mermaid sources don't pollute the index.
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

// Mirrors markdown-it-anchor's dedup: same heading text → `slug`, `slug-1`, `slug-2`, …
export function uniqueSlug(base: string, seen: Set<string>): string {
  if (!seen.has(base)) {
    seen.add(base);
    return base;
  }
  let i = 1;
  let candidate = `${base}-${i}`;
  while (seen.has(candidate)) {
    i++;
    candidate = `${base}-${i}`;
  }
  seen.add(candidate);
  return candidate;
}
