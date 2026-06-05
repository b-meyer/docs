import MarkdownIt from 'markdown-it';
import { describe, expect, it } from 'vite-plus/test';
import { mdAlerts, mdContainers, mdLinkRewriter, mdMermaid } from '../src/markdown';

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
