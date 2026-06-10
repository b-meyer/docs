// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vite-plus/test';
import { mountWithConfig } from '../test-utils/mountWithConfig';
import ThemeToggle from './ThemeToggle.vue';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.removeProperty('--brand-hue');
  document.documentElement.style.removeProperty('--brand-intensity');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('renders the theme settings trigger button', () => {
    const wrapper = mountWithConfig(ThemeToggle);
    expect(wrapper.find('[aria-label="Theme settings"]').exists()).toBe(true);
  });

  it('mounts without throwing', () => {
    expect(() => mountWithConfig(ThemeToggle)).not.toThrow();
  });
});
