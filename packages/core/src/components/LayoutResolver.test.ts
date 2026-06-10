// @vitest-environment jsdom

import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vite-plus/test';
import HomeLayout from './HomeLayout.vue';
import LayoutResolver from './LayoutResolver.vue';
import PageLayout from './PageLayout.vue';

describe('LayoutResolver', () => {
  it('renders PageLayout when no layout is specified', () => {
    const wrapper = shallowMount(LayoutResolver, { props: { frontmatter: {} } });
    expect(wrapper.findComponent(PageLayout).exists()).toBe(true);
    expect(wrapper.findComponent(HomeLayout).exists()).toBe(false);
  });

  it('renders HomeLayout when layout is "home"', () => {
    const wrapper = shallowMount(LayoutResolver, { props: { frontmatter: { layout: 'home' } } });
    expect(wrapper.findComponent(HomeLayout).exists()).toBe(true);
    expect(wrapper.findComponent(PageLayout).exists()).toBe(false);
  });

  it('renders PageLayout when frontmatter is absent', () => {
    const wrapper = shallowMount(LayoutResolver);
    expect(wrapper.findComponent(PageLayout).exists()).toBe(true);
  });
});
