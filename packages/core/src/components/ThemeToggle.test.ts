// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vite-plus/test';
import { nextTick } from 'vue';
import { mountWithConfig } from '../test-utils/mountWithConfig';
import ThemeToggle from './ThemeToggle.vue';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.removeProperty('--brand-hue');
  document.documentElement.style.removeProperty('--brand-intensity');
  localStorage.clear();
});

describe('ThemeToggle — simple toggle (default)', () => {
  it('renders the dark mode toggle button', () => {
    const wrapper = mountWithConfig(ThemeToggle);
    expect(wrapper.find('[aria-label="Toggle dark mode"]').exists()).toBe(true);
  });

  it('does not render the theme settings popover', () => {
    const wrapper = mountWithConfig(ThemeToggle);
    expect(wrapper.find('[aria-label="Theme settings"]').exists()).toBe(false);
  });

  it('toggles to dark when clicked in light mode', async () => {
    document.documentElement.classList.remove('dark');
    const wrapper = mountWithConfig(ThemeToggle);
    await nextTick(); // wait for mounted gate to render SwitchRoot
    await wrapper.find('[aria-label="Toggle dark mode"]').trigger('click');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to light when clicked in dark mode', async () => {
    document.documentElement.classList.add('dark');
    const wrapper = mountWithConfig(ThemeToggle);
    await nextTick(); // wait for mounted gate to render SwitchRoot
    await wrapper.find('[aria-label="Toggle dark mode"]').trigger('click');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('mounts without throwing', () => {
    expect(() => mountWithConfig(ThemeToggle)).not.toThrow();
  });
});

describe('ThemeToggle — full controls (colorControls prop)', () => {
  it('renders the theme settings popover trigger', () => {
    const wrapper = mountWithConfig(ThemeToggle, {}, { props: { colorControls: true } });
    expect(wrapper.find('[aria-label="Theme settings"]').exists()).toBe(true);
  });

  it('does not render the simple toggle button', () => {
    const wrapper = mountWithConfig(ThemeToggle, {}, { props: { colorControls: true } });
    expect(wrapper.find('[aria-label="Toggle dark mode"]').exists()).toBe(false);
  });

  it('mounts without throwing', () => {
    expect(() => mountWithConfig(ThemeToggle, { props: { colorControls: true } })).not.toThrow();
  });
});
