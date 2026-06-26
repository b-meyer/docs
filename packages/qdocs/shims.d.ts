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

// Build-time flag injected by qdocsPlugin (Vite `define`).
// eslint-disable-next-line no-underscore-dangle -- dunder is the Vite define convention
declare const __QDOCS_MERMAID__: boolean;

declare module 'virtual:@qdocs/config' {
  import type { QDocsConfig } from 'qdocs/config';
  const config: QDocsConfig;
  export default config;
}

declare module 'virtual:qdocs-entry' {
  import type { createApp } from 'qdocs/ssg';
  export { createApp };
}

declare module 'virtual:@qdocs/header-end' {
  import type { Component } from 'vue';
  const HeaderEnd: Component | null;
  export default HeaderEnd;
}

declare module 'vue-router/auto-routes' {
  import type { RouteRecordRaw } from 'vue-router';
  export const routes: RouteRecordRaw[];
}
