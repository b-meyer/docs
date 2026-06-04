import { inject } from 'vue';
import { CONFIG_KEY, type FrameworkConfig } from '../config';

/** Read the FrameworkConfig provided by `createSSGApp`. Throws if absent. */
export function useConfig(): FrameworkConfig {
  const config = inject(CONFIG_KEY);
  if (!config) {
    throw new Error(
      'useConfig(): no FrameworkConfig was provided. Render inside an app created by createSSGApp().',
    );
  }
  return config;
}
