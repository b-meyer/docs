import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { prefersReducedMotion } from './reducedMotion';

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false in SSR / node environment (window undefined)', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns true when matchMedia reports reduced motion preferred', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: true })),
    });
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when matchMedia reports no preference', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: false })),
    });
    expect(prefersReducedMotion()).toBe(false);
  });
});
