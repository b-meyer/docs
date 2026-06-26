import { afterEach, describe, expect, it } from 'vite-plus/test';
import type { SearchEntry } from './useSearch';
import { targetFor, useSearch } from './useSearch';

function entry(slug: string, headingId: string): SearchEntry & { id: number } {
  return {
    id: 0,
    slug,
    headingId,
    pageTitle: slug,
    heading: slug,
    level: headingId ? 2 : 1,
    body: '',
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

describe('useSearch state', () => {
  afterEach(() => {
    const { closeSearch, setQuery } = useSearch();
    closeSearch();
    setQuery('');
  });

  it('openSearch sets open to true', () => {
    const { open, openSearch } = useSearch();
    openSearch();
    expect(open.value).toBe(true);
  });

  it('closeSearch sets open to false', () => {
    const { open, openSearch, closeSearch } = useSearch();
    openSearch();
    closeSearch();
    expect(open.value).toBe(false);
  });

  it('setQuery updates query and resets selectedIndex to 0', () => {
    const { query, selectedIndex, setQuery } = useSearch();
    setQuery('hello');
    expect(query.value).toBe('hello');
    expect(selectedIndex.value).toBe(0);
  });

  it('moveSelection is a no-op when there are no results', () => {
    const { selectedIndex, moveSelection } = useSearch();
    moveSelection(1);
    expect(selectedIndex.value).toBe(0);
  });

  it('setSelection clamps to 0 when there are no results', () => {
    const { selectedIndex, setSelection } = useSearch();
    setSelection(5);
    expect(selectedIndex.value).toBe(0);
  });
});
