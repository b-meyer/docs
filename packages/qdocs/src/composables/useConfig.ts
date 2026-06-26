import { inject } from 'vue';
import { CONFIG_KEY, type QDocsConfig } from '../config';

/**
 * Read the QDocsConfig provided by `createApp`. Throws if absent.
 */
export function useConfig(): QDocsConfig {
  const config = inject(CONFIG_KEY);
  if (!config) {
    throw new Error(
      'useConfig(): no QDocsConfig was provided. Render inside an app created by createApp().',
    );
  }
  return config;
}
