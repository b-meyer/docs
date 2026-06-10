import { describe, expect, it } from 'vite-plus/test';
import { hasHiddenFrontmatter, parseSections, stripMarkdown, uniqueSlug } from './searchParse';

describe('hasHiddenFrontmatter', () => {
  it('returns false for content with no frontmatter', () => {
    expect(hasHiddenFrontmatter('# Hello\nworld')).toBe(false);
  });

  it('returns false when content does not start with ---', () => {
    expect(hasHiddenFrontmatter('title: Foo\n---')).toBe(false);
  });

  it('returns false for an unclosed frontmatter block', () => {
    expect(hasHiddenFrontmatter('---\nhidden: true\nno closing')).toBe(false);
  });

  it('returns false when frontmatter exists but hidden is absent', () => {
    expect(hasHiddenFrontmatter('---\ntitle: Foo\n---\n# Page')).toBe(false);
  });

  it('returns true when hidden: true appears in frontmatter', () => {
    expect(hasHiddenFrontmatter('---\nhidden: true\n---\n# Page')).toBe(true);
  });

  it('returns true when hidden: true has surrounding whitespace', () => {
    expect(hasHiddenFrontmatter('---\n  hidden  :  true  \n---')).toBe(true);
  });

  it('returns false when hidden: false appears in frontmatter', () => {
    expect(hasHiddenFrontmatter('---\nhidden: false\n---\n# Page')).toBe(false);
  });

  it('returns true when hidden: true appears among other keys', () => {
    expect(hasHiddenFrontmatter('---\ntitle: Foo\nhidden: true\nlayout: home\n---')).toBe(true);
  });
});

describe('stripMarkdown', () => {
  it('removes backtick code spans', () => {
    expect(stripMarkdown('use `code` here')).toBe('use code here');
  });

  it('removes bold markers', () => {
    expect(stripMarkdown('**bold** text')).toBe('bold text');
  });

  it('removes italic star markers', () => {
    expect(stripMarkdown('*italic* text')).toBe('italic text');
  });

  it('removes italic underscore markers', () => {
    expect(stripMarkdown('_italic_ text')).toBe('italic text');
  });

  it('removes link syntax keeping display text', () => {
    expect(stripMarkdown('[link](https://example.com)')).toBe('link');
  });

  it('removes HTML tags', () => {
    expect(stripMarkdown('<strong>bold</strong>')).toBe('bold');
  });

  it('collapses multiple spaces', () => {
    expect(stripMarkdown('hello  world')).toBe('hello world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(stripMarkdown('  text  ')).toBe('text');
  });

  it('returns empty string for empty input', () => {
    expect(stripMarkdown('')).toBe('');
  });

  it('leaves plain text unchanged', () => {
    expect(stripMarkdown('plain text')).toBe('plain text');
  });
});

describe('parseSections', () => {
  it('returns empty array for content with no headings', () => {
    expect(parseSections('just some text\nand more text')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseSections('')).toEqual([]);
  });

  it('extracts a single H1 with its body', () => {
    const sections = parseSections('# Title\nSome content.');
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ level: 1, heading: 'Title' });
    expect(sections[0]?.bodyLines).toContain('Some content.');
  });

  it('extracts multiple headings in order', () => {
    const sections = parseSections('# H1\n## H2\n### H3');
    expect(sections.map((s) => s.level)).toEqual([1, 2, 3]);
    expect(sections.map((s) => s.heading)).toEqual(['H1', 'H2', 'H3']);
  });

  it('suppresses headings inside code fences', () => {
    const source = '# Real\n```\n# Fake\n```\n## Also Real';
    const sections = parseSections(source);
    expect(sections.map((s) => s.heading)).not.toContain('Fake');
    expect(sections.map((s) => s.heading)).toContain('Real');
    expect(sections.map((s) => s.heading)).toContain('Also Real');
  });

  it('excludes body lines that are inside a code fence', () => {
    const source = '# Title\nBefore\n```\nInside\n```\nAfter';
    const sections = parseSections(source);
    expect(sections[0]?.bodyLines).not.toContain('Inside');
    expect(sections[0]?.bodyLines).toContain('Before');
  });

  it('ignores H4 and deeper headings', () => {
    const sections = parseSections('#### Deep\ntext');
    expect(sections).toHaveLength(0);
  });

  it('trims trailing whitespace from heading text', () => {
    const sections = parseSections('# Title   ');
    expect(sections[0]?.heading).toBe('Title');
  });
});

describe('uniqueSlug', () => {
  it('returns base slug when not yet seen', () => {
    const seen = new Set<string>();
    expect(uniqueSlug('foo', seen)).toBe('foo');
    expect(seen.has('foo')).toBe(true);
  });

  it('appends -1 on first collision', () => {
    const seen = new Set(['foo']);
    expect(uniqueSlug('foo', seen)).toBe('foo-1');
    expect(seen.has('foo-1')).toBe(true);
  });

  it('increments counter past -1 on further collisions', () => {
    const seen = new Set(['foo', 'foo-1']);
    expect(uniqueSlug('foo', seen)).toBe('foo-2');
  });

  it('adds the returned slug to the seen set', () => {
    const seen = new Set<string>();
    const result = uniqueSlug('bar', seen);
    expect(seen.has(result)).toBe(true);
  });

  it('handles non-colliding slugs independently', () => {
    const seen = new Set<string>();
    expect(uniqueSlug('a', seen)).toBe('a');
    expect(uniqueSlug('b', seen)).toBe('b');
    expect(seen.size).toBe(2);
  });
});
