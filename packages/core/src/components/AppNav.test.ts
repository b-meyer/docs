// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vite-plus/test';
import { nextTick } from 'vue';
import { useReadingMode } from '../composables/useReadingMode';
import type { FrameworkConfig } from '../config';
import { mountWithConfig } from '../test-utils/mountWithConfig';
import AppNav from './AppNav.vue';

const config: FrameworkConfig = {
  title: 'Test',
  sidebar: [
    { group: 'Core Topics', items: [{ path: 'intro', title: 'Introduction' }] },
    { group: 'Extra Topics', extra: true, items: [{ path: 'appendix', title: 'Appendix' }] },
  ],
};

afterEach(() => {
  const { setShowAdditional } = useReadingMode();
  setShowAdditional(false);
  localStorage.clear();
});

describe('AppNav', () => {
  it('shows core group items by default', async () => {
    const wrapper = mountWithConfig(AppNav, config);
    await nextTick();
    expect(wrapper.text()).toContain('Introduction');
    expect(wrapper.text()).not.toContain('Appendix');
  });

  it('shows the "Additional Reading" toggle button when extra groups exist', async () => {
    const wrapper = mountWithConfig(AppNav, config);
    await nextTick();
    expect(wrapper.text()).toContain('Additional Reading');
  });

  it('hides the "Additional Reading" button when there are no extra groups', async () => {
    const noExtraConfig: FrameworkConfig = {
      title: 'Test',
      sidebar: [{ group: 'Core', items: [{ path: 'intro', title: 'Introduction' }] }],
    };
    const wrapper = mountWithConfig(AppNav, noExtraConfig);
    await nextTick();
    expect(wrapper.text()).not.toContain('Additional Reading');
  });

  it('shows extra groups after clicking the Additional Reading button', async () => {
    const wrapper = mountWithConfig(AppNav, config);
    await nextTick();
    const btn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text().includes('Additional Reading'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('Appendix');
    expect(wrapper.text()).not.toContain('Introduction');
  });

  it('returns to core groups after clicking the close button in extra mode', async () => {
    const { setShowAdditional } = useReadingMode();
    setShowAdditional(true);
    const wrapper = mountWithConfig(AppNav, config);
    await nextTick();
    const closeBtn = wrapper.find('button[aria-label="Hide additional reading"]');
    await closeBtn.trigger('click');
    expect(wrapper.text()).toContain('Introduction');
    expect(wrapper.text()).not.toContain('Appendix');
  });

  it('renders RouterLink hrefs for core sidebar items', async () => {
    const wrapper = mountWithConfig(AppNav, config);
    await nextTick();
    expect(wrapper.find('a[href="/intro"]').exists()).toBe(true);
  });

  it('renders an anchor (not RouterLink) for external href items', async () => {
    const externalConfig: FrameworkConfig = {
      title: 'Test',
      sidebar: [
        {
          group: 'Links',
          items: [{ href: 'https://example.com', title: 'External Site' }],
        },
      ],
    };
    const wrapper = mountWithConfig(AppNav, externalConfig);
    await nextTick();
    const anchor = wrapper.find('a[href="https://example.com"]');
    expect(anchor.exists()).toBe(true);
    expect(anchor.attributes('target')).toBe('_blank');
    expect(anchor.attributes('rel')).toBe('noopener noreferrer');
  });

  it('toggles a collapsible group open and closed', async () => {
    const collapsibleConfig: FrameworkConfig = {
      title: 'Test',
      sidebar: [
        {
          group: 'Collapsible',
          collapsed: true,
          items: [{ path: 'page', title: 'Hidden Page' }],
        },
      ],
    };
    const wrapper = mountWithConfig(AppNav, collapsibleConfig);
    await nextTick();
    // Starts collapsed — items not visible
    expect(wrapper.text()).not.toContain('Hidden Page');
    // Click the group header button to expand
    const groupBtn = wrapper.find('button[aria-expanded="false"]');
    await groupBtn.trigger('click');
    await nextTick();
    expect(wrapper.text()).toContain('Hidden Page');
    // Click again to collapse
    await groupBtn.trigger('click');
    await nextTick();
    expect(wrapper.text()).not.toContain('Hidden Page');
  });
});
