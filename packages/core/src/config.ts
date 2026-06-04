import type { AsyncComponentLoader, InjectionKey } from 'vue';

export type SidebarItem = { slug: string; title: string };
export type SidebarGroup = { group: string; items: SidebarItem[]; extra?: boolean };

export type FrameworkConfig = {
  /** Document <title> default and OG/meta title base. */
  title: string;
  description?: string;
  /** Base public path (e.g. '/'); reserved for future router/base wiring. */
  base?: string;
  /** Home entry shown at `/`. Defaults to `{ slug: 'index', title: 'Home' }`. */
  home?: SidebarItem;
  /** Nav manifest — drives the sidebar groups, reading order, and prev/next. */
  sidebar: SidebarGroup[];
  branding?: {
    /** Short site name shown in the header / mobile drawer. Falls back to `title`. */
    siteTitle?: string;
    /** Async loader for a brand logo SFC, e.g. `() => import('./Logo.vue')`. */
    logoComponent?: AsyncComponentLoader;
  };
  markdown?: {
    /** Enable the mermaid fence transform + runtime. Off by default. */
    mermaid?: boolean;
  };
  sitemap?: {
    /** Production hostname for sitemap URLs (e.g. 'https://example.com'). */
    hostname?: string;
  };
  themeDefaults?: {
    /** 0–360. Also set as the CSS `--brand-hue` default by the consumer's tokens/index.html. */
    brandHue?: number;
    /** 0–100. */
    brandIntensity?: number;
  };
};

export const CONFIG_KEY: InjectionKey<FrameworkConfig> = Symbol('framework-config');

/** Identity helper that gives consumer `framework.config.ts` files full TS completion. */
export function defineConfig(config: FrameworkConfig): FrameworkConfig {
  return config;
}
