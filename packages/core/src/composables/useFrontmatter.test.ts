// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vite-plus/test';
import { defineComponent } from 'vue';
import { FRONTMATTER_KEY, type PageFrontmatter, useFrontmatter } from './useFrontmatter';

function mountWithFrontmatter(fm?: PageFrontmatter) {
  let captured: PageFrontmatter | undefined;
  const TestComponent = defineComponent({
    setup() {
      captured = useFrontmatter();
    },
    template: '<div/>',
  });
  const opts = fm === undefined ? {} : { global: { provide: { [FRONTMATTER_KEY]: fm } } };
  mount(TestComponent, opts);
  return captured;
}

describe('useFrontmatter', () => {
  it('returns the provided frontmatter', () => {
    const fm: PageFrontmatter = { title: 'My Page', layout: 'home' };
    expect(mountWithFrontmatter(fm)).toBe(fm);
  });

  it('returns an empty object when no frontmatter is provided', () => {
    expect(mountWithFrontmatter()).toEqual({});
  });
});
