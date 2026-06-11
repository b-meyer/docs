import type { InjectionKey } from 'vue';

export type SidebarItem = {
  title: string;
  /** Internal route path, no leading slash: 'YinYang', 'guide/intro'. Required for internal pages. */
  path?: string;
  /** External URL. Renders as a plain anchor when set. */
  href?: string;
};
export type SidebarGroup = {
  group: string;
  items: SidebarItem[];
  /** Marks this group as supplemental — hidden by default, shown via the "Additional Reading" toggle. */
  extra?: boolean;
  /** Whether this group starts collapsed. Defaults to false (expanded). */
  collapsed?: boolean;
};

export type NavItem = {
  text: string;
  /** Internal path ('/guide/') or full external URL. Mutually exclusive with items. */
  link?: string;
  /** Dropdown groups. Mutually exclusive with link. */
  items?: NavDropdownGroup[];
  /** Regex string for custom active-state matching, e.g. '^/$'. */
  activeMatch?: string;
  /** Link target. Defaults to '_blank' for external URLs. */
  target?: '_blank' | '_self';
};

export type NavDropdownGroup = {
  /** Optional section heading rendered inside the dropdown panel. */
  text?: string;
  items: NavItem[];
};

export type SocialLinkIcon =
  | 'github'
  | 'twitter'
  | 'x'
  | 'discord'
  | 'bluesky'
  | 'mastodon'
  | 'linkedin'
  | 'youtube'
  | { svg: string };

export type SocialLink = {
  icon: SocialLinkIcon;
  link: string;
  /** Accessible label. Falls back to the capitalized icon name. */
  ariaLabel?: string;
};

export type FrameworkConfig = {
  /** Document <title> default and OG/meta title base. */
  title: string;
  description?: string;
  /** Favicon filename relative to the public directory (e.g. 'favicon.svg', 'favicon.ico'). Defaults to 'favicon.svg'. */
  favicon?: string;
  /** Base public path (e.g. '/'); reserved for future router/base wiring. */
  base?: string;
  /** Home entry shown at `/`. Defaults to `{ path: 'index', title: 'Home' }`. */
  home?: SidebarItem;
  /**
   * Nav manifest — drives the sidebar groups, reading order, and prev/next.
   *
   * **Single tree**: pass a `SidebarGroup[]` array directly.
   *
   * **Multi-tree**: pass a `Record<string, SidebarGroup[]>` keyed by URL prefix
   * (e.g. `{ '/guide/': [...], '/api/': [...] }`). The active tree is selected by
   * longest-prefix match on the current route path.
   */
  sidebar: SidebarGroup[] | Record<string, SidebarGroup[]>;
  /** Top navbar links and dropdowns, rendered in the site header. */
  nav?: NavItem[];
  /** Social platform icon links, rendered in the site header. */
  socialLinks?: SocialLink[];
  branding?: {
    /** Short site name shown in the header / mobile drawer. Falls back to `title`. */
    siteTitle?: string;
  };
  markdown?: {
    /** Enable the mermaid fence transform + runtime. Off by default. */
    mermaid?: boolean;
    /** Enable Shiki syntax highlighting + code groups. Off by default. */
    shiki?: boolean;
    /** Allow raw HTML tags in markdown prose. Off by default. */
    html?: boolean;
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
