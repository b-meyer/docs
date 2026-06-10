// @vitest-environment jsdom

import { vi } from 'vite-plus/test';

vi.mock('../runtime/headFromFrontmatter', () => ({ headFromFrontmatter: vi.fn() }));

import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vite-plus/test';
import { createMemoryHistory, createRouter } from 'vue-router';
import { CONFIG_KEY, type FrameworkConfig } from '../config';
import PageLayout from './PageLayout.vue';

// Provides config + router at the initial path (before router.isReady()).
// route.path starts at '/' regardless of initialPath until navigation completes;
// tests that rely on a specific route should push via the returned wrapper's router.
function mountPageLayout(config: FrameworkConfig) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [],
  });
  return shallowMount(PageLayout, {
    global: {
      plugins: [router],
      provide: { [CONFIG_KEY as symbol]: config },
    },
  });
}

const threeItemConfig: FrameworkConfig = {
  title: 'Test',
  sidebar: [
    {
      group: 'Main',
      items: [
        { path: 'a', title: 'Page A' },
        { path: 'b', title: 'Page B' },
      ],
    },
  ],
};

describe('PageLayout', () => {
  it('shows the prev/next nav when there is a neighboring page', () => {
    // route.path starts at '/' → pathFromRoute('/') = 'index'
    // neighborsOf returns { prev: null, next: { path: 'a' } }
    const wrapper = mountPageLayout(threeItemConfig);
    expect(wrapper.find('[aria-label="Previous and next page"]').exists()).toBe(true);
  });

  it('includes a RouterLink pointing to the next page', () => {
    const wrapper = mountPageLayout(threeItemConfig);
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.some((l) => l.props('to') === '/a')).toBe(true);
  });

  it('does not include a prev RouterLink when at the first item', () => {
    const wrapper = mountPageLayout(threeItemConfig);
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    // Only 1 link (next), since prev is null → <span v-else />
    expect(links).toHaveLength(1);
  });

  it('renders no prev/next nav when sidebar is empty', () => {
    const emptyConfig: FrameworkConfig = { title: 'Test', sidebar: [] };
    const wrapper = mountPageLayout(emptyConfig);
    expect(wrapper.find('[aria-label="Previous and next page"]').exists()).toBe(false);
  });
});
