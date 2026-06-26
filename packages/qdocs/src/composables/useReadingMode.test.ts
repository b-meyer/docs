// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vite-plus/test';
import { useReadingMode } from './useReadingMode';

describe('useReadingMode', () => {
  afterEach(() => {
    const { setShowAdditional } = useReadingMode();
    setShowAdditional(false);
    localStorage.clear();
  });

  it('showAdditional starts as false', () => {
    const { showAdditional } = useReadingMode();
    expect(showAdditional.value).toBe(false);
  });

  it('setShowAdditional(true) updates the ref', () => {
    const { showAdditional, setShowAdditional } = useReadingMode();
    setShowAdditional(true);
    expect(showAdditional.value).toBe(true);
  });

  it('setShowAdditional persists to localStorage', () => {
    const { setShowAdditional } = useReadingMode();
    setShowAdditional(true);
    expect(localStorage.getItem('show-additional')).toBe('true');
  });

  it('syncFromStorage reads the persisted value from localStorage', () => {
    localStorage.setItem('show-additional', 'true');
    const { showAdditional, syncFromStorage } = useReadingMode();
    syncFromStorage();
    expect(showAdditional.value).toBe(true);
  });

  it('syncFromStorage defaults to false when no entry exists', () => {
    const { showAdditional, syncFromStorage } = useReadingMode();
    syncFromStorage();
    expect(showAdditional.value).toBe(false);
  });
});
