// @vitest-environment jsdom

import { vi } from 'vite-plus/test';

vi.mock('../runtime/headFromFrontmatter', () => ({ headFromFrontmatter: vi.fn() }));

import { describe, expect, it } from 'vite-plus/test';
import { mountWithConfig } from '../test-utils/mountWithConfig';
import HomeLayout from './HomeLayout.vue';

describe('HomeLayout', () => {
  it('renders hero name when provided', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: { frontmatter: { hero: { name: 'My Project' } } },
      },
    );
    expect(wrapper.find('h1').text()).toBe('My Project');
  });

  it('does not render the hero image when absent', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: { frontmatter: { hero: { name: 'Only Name' } } },
      },
    );
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('renders hero tagline text', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: { frontmatter: { hero: { tagline: 'Build fast.' } } },
      },
    );
    expect(wrapper.text()).toContain('Build fast.');
  });

  it('renders the correct number of feature cards', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: {
          frontmatter: {
            features: [
              { title: 'Fast', details: 'Very fast' },
              { title: 'Safe', details: 'Very safe' },
              { title: 'Easy', details: 'Very easy' },
            ],
          },
        },
      },
    );
    const titles = wrapper.findAll('h2');
    expect(titles).toHaveLength(3);
  });

  it('renders no feature section when features array is empty', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: { frontmatter: { features: [] } },
      },
    );
    expect(wrapper.find('h2').exists()).toBe(false);
  });

  it('renders a RouterLink for features with a link', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: {
          frontmatter: {
            features: [{ title: 'Linked', link: '/guide' }],
          },
        },
      },
    );
    expect(wrapper.find('a[href="/guide"]').exists()).toBe(true);
  });

  it('renders a div (not a link) for features without a link', () => {
    const wrapper = mountWithConfig(
      HomeLayout,
      {},
      {
        props: {
          frontmatter: {
            features: [{ title: 'Plain', details: 'No link here' }],
          },
        },
      },
    );
    // No <a> tag wrapping the feature card
    const featureTitle = wrapper.findAll('h2').find((h) => h.text() === 'Plain');
    expect(featureTitle).toBeDefined();
    expect(wrapper.find('a[href]').exists()).toBe(false);
  });
});
