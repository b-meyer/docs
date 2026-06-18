declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module '*.md' {
  import type { Component } from 'vue';
  const component: Component;
  export default component;
}

// Build-time flag injected by frameworkPlugin (Vite `define`).
// eslint-disable-next-line no-underscore-dangle -- dunder is the Vite define convention
declare const __FRAMEWORK_MERMAID__: boolean;

declare module 'virtual:@framework/config' {
  import type { FrameworkConfig } from '@framework/core/config';
  const config: FrameworkConfig;
  export default config;
}

declare module 'virtual:framework-entry' {
  import type { createApp } from '@framework/core/ssg';
  export { createApp };
}

declare module 'vue-router/auto-routes' {
  import type { RouteRecordRaw } from 'vue-router';
  export const routes: RouteRecordRaw[];
}
