import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { CONFIG_KEY, type FrameworkConfig } from '../config';

export function mountWithConfig(
  component: Parameters<typeof mount>[0],
  config: Partial<FrameworkConfig> = {},
  options: Omit<Parameters<typeof mount>[1], 'global'> & {
    global?: Record<string, unknown>;
  } = {},
) {
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  const resolved: FrameworkConfig = { title: 'Test', sidebar: [], ...config };
  const { global: extraGlobal = {}, ...restOptions } = options;
  return mount(component, {
    global: {
      plugins: [router],
      provide: { [CONFIG_KEY as symbol]: resolved },
      ...extraGlobal,
    },
    ...restOptions,
  });
}
