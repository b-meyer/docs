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
