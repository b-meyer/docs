import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import type { Highlighter } from 'shiki';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import {
  mdAlerts,
  mdCodeGroup,
  mdContainers,
  mdLinkRewriter,
  mdLinkTitles,
  mdMermaid,
  mdShiki,
  mdTableWrapper,
} from '.';
import { processSnippets } from './snippets';

function buildLinkRewriter(): MarkdownIt {
  const md = new MarkdownIt();
  md.use(mdLinkRewriter);
  return md;
}

describe('mdLinkRewriter', () => {
  it('rewrites .md extension to SPA route', () => {
    const out = buildLinkRewriter().render('[Page](./page.md)');
    expect(out).toContain('href="/page"');
  });

  it('maps index.md to the root route /', () => {
    const out = buildLinkRewriter().render('[Home](./index.md)');
    expect(out).toContain('href="/"');
  });

  it('preserves query string and hash fragment', () => {
    const out = buildLinkRewriter().render('[Page](./page.md?tab=2#section)');
    expect(out).toContain('href="/page?tab=2#section"');
  });

  it('leaves absolute URLs unchanged', () => {
    const out = buildLinkRewriter().render('[External](https://example.com)');
    expect(out).toContain('href="https://example.com"');
  });

  it('leaves non-.md relative links unchanged', () => {
    const out = buildLinkRewriter().render('[Asset](./image.png)');
    expect(out).toContain('href="./image.png"');
  });

  it('preserves directory segments in nested .md paths', () => {
    const out = buildLinkRewriter().render('[Page](./foo/bar/baz.md)');
    expect(out).toContain('href="/foo/bar/baz"');
  });

  it('maps a directory index to the parent route', () => {
    const out = buildLinkRewriter().render('[Guide](./guide/index.md)');
    expect(out).toContain('href="/guide"');
  });

  it('prepends base when a getBase function is provided', () => {
    const md = new MarkdownIt();
    md.use(mdLinkRewriter, () => '/docs/');
    const out = md.render('[Page](./page.md)');
    expect(out).toContain('href="/docs/page"');
  });
});

describe('mdMermaid', () => {
  it('emits a pre.mermaid.not-prose block for ```mermaid fences', () => {
    const md = new MarkdownIt();
    md.use(mdMermaid);
    const out = md.render('```mermaid\ngraph TD; A-->B;\n```');
    expect(out).toContain('<pre class="mermaid not-prose">');
    expect(out).toContain('graph TD; A--&gt;B;');
  });

  it('leaves non-mermaid fences alone', () => {
    const md = new MarkdownIt();
    md.use(mdMermaid);
    const out = md.render('```ts\nconst x = 1;\n```');
    expect(out).not.toContain('class="mermaid');
    expect(out).toContain('<code');
  });
});

function buildTableWrapper(): MarkdownIt {
  const md = new MarkdownIt();
  md.use(mdTableWrapper);
  return md;
}

describe('mdTableWrapper', () => {
  it('wraps a table in a div.table-wrap', () => {
    const out = buildTableWrapper().render('| A | B |\n| - | - |\n| 1 | 2 |');
    expect(out).toContain('<div class="table-wrap">');
    expect(out).toContain('<table>');
    expect(out).toContain('</table>');
    expect(out).toContain('</div>');
  });

  it('produces balanced open and close wrapper tags', () => {
    const out = buildTableWrapper().render('| A |\n| - |\n| 1 |');
    const opens = (out.match(/<div class="table-wrap">/gu) ?? []).length;
    const closes = (out.match(/<\/div>/gu) ?? []).length;
    expect(opens).toBe(closes);
  });
});

function buildContainers(): MarkdownIt {
  const md = new MarkdownIt();
  md.use(mdContainers);
  return md;
}

function buildAlerts(): MarkdownIt {
  const md = new MarkdownIt();
  md.use(mdAlerts);
  return md;
}

describe('mdContainers', () => {
  it('renders :::tip with the default title and callout-tip class', () => {
    const out = buildContainers().render(':::tip\nGood idea.\n:::');
    expect(out).toContain('<div class="callout callout-tip">');
    expect(out).toContain('<p class="callout-title">TIP</p>');
    expect(out).toContain('Good idea.');
  });

  it('honors a custom title after the type', () => {
    const out = buildContainers().render(':::warning Heads up\nBe careful.\n:::');
    expect(out).toContain('<div class="callout callout-warning">');
    expect(out).toContain('<p class="callout-title">Heads up</p>');
  });

  it('renders :::details as a collapsible <details>', () => {
    const out = buildContainers().render(':::details\nMore info.\n:::');
    expect(out).toContain('<details class="callout callout-details">');
    expect(out).toContain('<summary class="callout-title">Details</summary>');
    expect(out).toContain('</details>');
  });

  it('renders all four standard callout types', () => {
    const md = buildContainers();
    for (const type of ['tip', 'info', 'warning', 'danger']) {
      const out = md.render(`:::${type}\nbody\n:::`);
      expect(out).toContain(`callout-${type}`);
    }
  });
});

describe('mdAlerts', () => {
  it('converts `> [!NOTE]` blockquotes into alert divs', () => {
    const out = buildAlerts().render('> [!NOTE]\n> Heads up.');
    expect(out).toContain('<div class="alert alert-note">');
    expect(out).toContain('<p class="alert-title">Note</p>');
    expect(out).toContain('Heads up.');
    expect(out).not.toContain('<blockquote');
    expect(out).not.toContain('[!NOTE]');
  });

  it('supports all five alert types', () => {
    const md = buildAlerts();
    const expected: Record<string, string> = {
      NOTE: 'note',
      TIP: 'tip',
      IMPORTANT: 'important',
      WARNING: 'warning',
      CAUTION: 'caution',
    };
    for (const [raw, type] of Object.entries(expected)) {
      const out = md.render(`> [!${raw}]\n> body`);
      expect(out).toContain(`alert-${type}`);
    }
  });

  it('leaves plain blockquotes unchanged', () => {
    const out = buildAlerts().render('> Just a quote.');
    expect(out).toContain('<blockquote>');
    expect(out).not.toContain('alert-');
  });
});

// ── mdLinkTitles ─────────────────────────────────────────────────────────────

const TITLES = new Map([
  ['YinYang', 'Yin & Yang (Dao)'],
  ['Qi', 'Qi (Vital Energy)'],
]);

function buildLinkTitles(): MarkdownIt {
  const md = new MarkdownIt();
  md.use(mdLinkRewriter);
  md.use(mdLinkTitles, () => TITLES);
  return md;
}

describe('mdLinkTitles', () => {
  it('replaces bare filename link text with the sidebar title', () => {
    const out = buildLinkTitles().render('[YinYang.md](YinYang.md)');
    expect(out).toContain('>Yin &amp; Yang (Dao)<');
    expect(out).not.toContain('YinYang.md');
  });

  it('preserves custom display text that is not the filename', () => {
    const out = buildLinkTitles().render('[Yin and Yang](YinYang.md)');
    expect(out).toContain('>Yin and Yang<');
  });

  it('leaves text unchanged when slug is not in the title map', () => {
    const out = buildLinkTitles().render('[Unknown.md](Unknown.md)');
    expect(out).toContain('>Unknown.md<');
  });

  it('replaces inside bold markup', () => {
    const out = buildLinkTitles().render('**[YinYang.md](YinYang.md)**');
    expect(out).toContain('>Yin &amp; Yang (Dao)<');
    expect(out).not.toContain('YinYang.md');
  });

  it('handles optional ./ prefix on the href', () => {
    const out = buildLinkTitles().render('[YinYang.md](./YinYang.md)');
    expect(out).toContain('>Yin &amp; Yang (Dao)<');
  });

  it('leaves external URLs unchanged', () => {
    const out = buildLinkTitles().render('[Site](https://example.com)');
    expect(out).toContain('>Site<');
    expect(out).toContain('href="https://example.com"');
  });

  it('leaves slug-only text unchanged (no .md extension in text)', () => {
    const out = buildLinkTitles().render('[YinYang](YinYang.md)');
    expect(out).toContain('>YinYang<');
  });

  it('rewrites href to SPA route alongside the title replacement', () => {
    const out = buildLinkTitles().render('[YinYang.md](YinYang.md)');
    expect(out).toContain('href="/YinYang"');
    expect(out).toContain('>Yin &amp; Yang (Dao)<');
  });
});

// ── processSnippets ──────────────────────────────────────────────────────────

describe('processSnippets', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'snippets-test-'));
    writeFileSync(
      join(tmpDir, 'example.ts'),
      [
        'export const PI = 3.14',
        '// #region greet',
        'export function greet(name: string): string {',
        '  return `Hello, ${name}!`',
        '}',
        '// #endregion greet',
        'export const E = 2.71',
      ].join('\n'),
    );
  });

  it('replaces a <<< line with a fenced code block', () => {
    const out = processSnippets(`<<< ./example.ts`, join(tmpDir, 'doc.md'));
    expect(out).toMatch(/^```ts\n/u);
    expect(out).toContain('export const PI');
    expect(out).toContain('export const E');
  });

  it('extracts only the named region', () => {
    const out = processSnippets(`<<< ./example.ts#greet`, join(tmpDir, 'doc.md'));
    expect(out).toContain('function greet');
    expect(out).not.toContain('export const PI');
    expect(out).not.toContain('// #region');
  });

  it('emits a comment fence for a missing file without throwing', () => {
    const out = processSnippets(`<<< ./missing.ts`, join(tmpDir, 'doc.md'));
    expect(out).toContain('Snippet not found');
    expect(out).toMatch(/^```\n/u);
  });

  it('replaces multiple <<< lines in one document', () => {
    const src = '<<< ./example.ts\n\n<<< ./example.ts#greet';
    const out = processSnippets(src, join(tmpDir, 'doc.md'));
    const matches = out.match(/^```/gmu) ?? [];
    expect(matches.length).toBe(4); // two opening + two closing fences
    expect(out).not.toContain('<<<');
  });

  it('leaves markdown without <<< unchanged', () => {
    const md = '# Title\n\nSome prose.';
    expect(processSnippets(md, join(tmpDir, 'doc.md'))).toBe(md);
  });

  it('cleans up temp dir after tests', () => {
    rmSync(tmpDir, { recursive: true, force: true });
  });
});

// ── mdShiki ──────────────────────────────────────────────────────────────────

describe('mdShiki', () => {
  let hl: Highlighter;

  beforeAll(async () => {
    const { createHighlighter } = await import('shiki');
    hl = await createHighlighter({
      themes: ['github-light', 'github-dark-dimmed'],
      langs: ['typescript', 'javascript', 'text'],
    });
  });

  it('wraps a ts fence in a shiki block with v-pre', () => {
    const md = new MarkdownIt();
    md.use(mdShiki, hl, []);
    const out = md.render('```ts\nconst x: string = "hello";\n```');
    expect(out).toContain('class="shiki');
    expect(out).toContain('v-pre');
  });

  it('adds not-prose class', () => {
    const md = new MarkdownIt();
    md.use(mdShiki, hl, []);
    const out = md.render('```ts\nconst x = 1;\n```');
    expect(out).toContain('not-prose');
  });

  it('delegates mermaid fences to the default renderer', () => {
    const md = new MarkdownIt();
    md.use(mdMermaid);
    md.use(mdShiki, hl, []);
    const out = md.render('```mermaid\ngraph TD; A-->B;\n```');
    expect(out).toContain('class="mermaid');
    expect(out).not.toContain('class="shiki');
  });

  it('ts and mermaid fences coexist in one document', () => {
    const md = new MarkdownIt();
    md.use(mdMermaid);
    md.use(mdShiki, hl, []);
    const out = md.render('```ts\nconst x = 1;\n```\n\n```mermaid\ngraph TD;\n```');
    expect(out).toContain('class="shiki');
    expect(out).toContain('class="mermaid');
  });

  it('falls back gracefully for an unknown language', () => {
    const md = new MarkdownIt();
    md.use(mdShiki, hl, []);
    expect(() => md.render('```unknownlang9999\nhello\n```')).not.toThrow();
  });
});

// ── mdCodeGroup ──────────────────────────────────────────────────────────────

describe('mdCodeGroup', () => {
  let hl: Highlighter;

  beforeAll(async () => {
    const { createHighlighter } = await import('shiki');
    hl = await createHighlighter({
      themes: ['github-light', 'github-dark-dimmed'],
      langs: ['typescript', 'javascript', 'text'],
    });
  });

  function buildCodeGroup(): MarkdownIt {
    const md = new MarkdownIt();
    md.use(mdCodeGroup, hl, []);
    return md;
  }

  it('renders :::code-group as a <CodeGroup> component', () => {
    const src =
      '::: code-group\n```ts [TypeScript]\nconst x = 1\n```\n```js [JavaScript]\nconst x = 1\n```\n:::';
    const out = buildCodeGroup().render(src);
    expect(out).toContain('<CodeGroup');
    expect(out).toContain('TypeScript');
    expect(out).toContain('JavaScript');
  });

  it('includes named template slots', () => {
    const src = '::: code-group\n```ts [TS]\nconst x = 1\n```\n```js [JS]\nconst y = 2\n```\n:::';
    const out = buildCodeGroup().render(src);
    expect(out).toContain('#tab-0');
    expect(out).toContain('#tab-1');
  });

  it('encodes labels in the :tabs prop', () => {
    const src = '::: code-group\n```ts [Alpha]\nconst x = 1\n```\n:::';
    const out = buildCodeGroup().render(src);
    expect(out).toContain('"label":"Alpha"');
  });

  it('coexists with a plain ts fence in the same document', () => {
    const md = new MarkdownIt();
    md.use(mdShiki, hl, []);
    md.use(mdCodeGroup, hl, []);
    const src = '```ts\nconst x = 1;\n```\n\n::: code-group\n```ts [Tab]\nconst y = 2;\n```\n:::';
    const out = md.render(src);
    expect(out).toContain('class="shiki');
    expect(out).toContain('<CodeGroup');
  });
});
