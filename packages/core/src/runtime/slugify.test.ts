import { describe, expect, it } from 'vite-plus/test';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and joins words with a dash', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles already lowercase input', () => {
    expect(slugify('foo bar')).toBe('foo-bar');
  });

  it('preserves Unicode letters', () => {
    expect(slugify('café niño')).toBe('café-niño');
  });

  it('preserves Unicode numbers', () => {
    expect(slugify('section 2')).toBe('section-2');
  });

  it('removes special characters', () => {
    expect(slugify('hello! world?')).toBe('hello-world');
  });

  it('collapses multiple spaces into a single dash', () => {
    expect(slugify('a  b   c')).toBe('a-b-c');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  foo  ')).toBe('foo');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('returns empty string for all-whitespace input', () => {
    expect(slugify('   ')).toBe('');
  });

  it('preserves dashes already in the input', () => {
    expect(slugify('foo-bar')).toBe('foo-bar');
  });
});
