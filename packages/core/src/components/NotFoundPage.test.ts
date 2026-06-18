// @vitest-environment jsdom

import { vi } from 'vite-plus/test';

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }));

import { describe, expect, it } from 'vite-plus/test';
import { mountWithConfig } from '../test-utils/mountWithConfig';
import NotFoundPage from './NotFoundPage.vue';

describe('NotFoundPage', () => {
  it('renders the "Page not found" heading', () => {
    const wrapper = mountWithConfig(NotFoundPage);
    expect(wrapper.find('h1').text()).toBe('Page not found');
  });

  it('renders a link back to the home page', () => {
    const wrapper = mountWithConfig(NotFoundPage);
    const link = wrapper.find('a[href="/"]');
    expect(link.exists()).toBe(true);
  });
});
