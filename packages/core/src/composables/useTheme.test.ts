// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vite-plus/test';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.removeProperty('--brand-hue');
    document.documentElement.style.removeProperty('--brand-intensity');
    localStorage.clear();
  });

  it('sets the dark class on <html> when switching to dark mode', () => {
    const { setTheme } = useTheme();
    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the dark class from <html> when switching to light mode', () => {
    const { setTheme } = useTheme();
    setTheme('dark');
    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage', () => {
    const { setTheme } = useTheme();
    setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('sets the --brand-hue CSS custom property', () => {
    const { setHue } = useTheme();
    setHue(200);
    expect(document.documentElement.style.getPropertyValue('--brand-hue')).toBe('200');
  });

  it('persists hue to localStorage', () => {
    const { setHue } = useTheme();
    setHue(200);
    expect(localStorage.getItem('brand-hue')).toBe('200');
  });

  it('sets --brand-intensity as a 0–1 fraction', () => {
    const { setIntensity } = useTheme();
    setIntensity(80);
    expect(document.documentElement.style.getPropertyValue('--brand-intensity')).toBe('0.8');
  });

  it('persists intensity to localStorage', () => {
    const { setIntensity } = useTheme();
    setIntensity(80);
    expect(localStorage.getItem('brand-intensity')).toBe('80');
  });
});
