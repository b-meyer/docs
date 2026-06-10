// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vite-plus/test';
import { defineComponent } from 'vue';
import { CONFIG_KEY, type FrameworkConfig } from '../config';
import { useConfig } from './useConfig';

const mockConfig: FrameworkConfig = { title: 'Test Site', sidebar: [] };

const ComponentUsingConfig = defineComponent({
  setup() {
    const config = useConfig();
    return { config };
  },
  template: '<div>{{ config.title }}</div>',
});

const ComponentThrowingWithoutConfig = defineComponent({
  setup() {
    useConfig();
  },
  template: '<div/>',
});

describe('useConfig', () => {
  it('returns the provided FrameworkConfig', () => {
    const wrapper = mount(ComponentUsingConfig, {
      global: { provide: { [CONFIG_KEY as symbol]: mockConfig } },
    });
    expect(wrapper.text()).toBe('Test Site');
  });

  it('throws a descriptive error when CONFIG_KEY is not provided', () => {
    expect(() => mount(ComponentThrowingWithoutConfig)).toThrow('no FrameworkConfig');
  });
});
