import { describe, expect, it } from 'vite-plus/test';
import type { IndexedEntry } from '../src/composables/useSearch';
import { targetFor } from '../src/composables/useSearch';

function entry(slug: string, headingId: string): IndexedEntry {
  return {
    slug,
    headingId,
    pageTitle: slug,
    heading: slug,
    level: headingId ? 2 : 1,
    body: '',
    headingTarget: { target: slug, score: 0, indexes: [] } as unknown as Fuzzysort.Prepared,
    bodyTarget: { target: '', score: 0, indexes: [] } as unknown as Fuzzysort.Prepared,
  };
}

describe('targetFor', () => {
  it('maps index H1 to /', () => {
    expect(targetFor(entry('index', ''))).toBe('/');
  });

  it('maps index sub-heading to /#heading', () => {
    expect(targetFor(entry('index', 'overview'))).toBe('/#overview');
  });

  it('maps other page H1 to /slug', () => {
    expect(targetFor(entry('about', ''))).toBe('/about');
  });

  it('maps other page sub-heading to /slug#heading', () => {
    expect(targetFor(entry('about', 'section'))).toBe('/about#section');
  });
});
