// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { ref } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { FRONTMATTER_KEY } from '../composables/useFrontmatter';
import PageNav from './PageNav.vue';

function makeArticle(...levels: number[]): HTMLElement {
  const article = document.createElement('article');
  levels.forEach((level, i) => {
    const el = document.createElement(`h${level}`);
    el.id = `heading-${i}`;
    el.textContent = `Heading ${i}`;
    article.append(el);
  });
  return article;
}

function mountPageNav(article: HTMLElement, frontmatter = {}, mobile = false) {
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  const articleEl = ref<HTMLElement | null>(article);
  return mount(PageNav, {
    props: { mobile },
    global: {
      plugins: [router],
      provide: {
        'article-el': articleEl,
        [FRONTMATTER_KEY]: frontmatter,
      },
    },
  });
}

describe('PageNav', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(function (this: IntersectionObserver) {
        this.observe = vi.fn();
        this.disconnect = vi.fn();
        this.unobserve = vi.fn();
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing when outline is false', async () => {
    const wrapper = mountPageNav(makeArticle(2, 3), { outline: false });
    await flushPromises();
    expect(wrapper.find('details').exists()).toBe(false);
    expect(wrapper.find('aside').exists()).toBe(false);
  });

  it('renders an aside with headings when mobile is false', async () => {
    const wrapper = mountPageNav(makeArticle(2, 3));
    await flushPromises();
    expect(wrapper.find('aside').exists()).toBe(true);
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('renders a details element when mobile is true', async () => {
    const wrapper = mountPageNav(makeArticle(2), {}, true);
    await flushPromises();
    expect(wrapper.find('details').exists()).toBe(true);
  });

  it('collects only H2 and H3 by default (H1 is skipped)', async () => {
    const wrapper = mountPageNav(makeArticle(1, 2, 3));
    await flushPromises();
    // Only H2 and H3 appear in the outline
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('renders nothing when the article has no headings matching the outline', async () => {
    const wrapper = mountPageNav(makeArticle(1)); // Only H1, outline defaults to [2,3]
    await flushPromises();
    expect(wrapper.find('aside').exists()).toBe(false);
    expect(wrapper.find('details').exists()).toBe(false);
  });
});
