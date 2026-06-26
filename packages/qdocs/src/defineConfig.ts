import { join, resolve as pathResolve } from 'node:path';
import {
  defineConfig as viteDefineConfig,
  type Alias,
  type ConfigEnv,
  type UserConfig,
} from 'vite';
import type { QDocsConfig, NavItem, SidebarGroup, SidebarItem, SocialLink } from './config.ts';
import { setQDocsConfig, qdocsPlugin } from './plugin.ts';

// The consumer's merged config type: all QDocsConfig fields (except `base`,
// which unifies with Vite's `base`) plus any Vite UserConfig overrides.
export type QDocsConsumerConfig = {
  title: string;
  description?: string;
  favicon?: string;
  home?: SidebarItem;
  sidebar: SidebarGroup[] | Record<string, SidebarGroup[]>;
  nav?: NavItem[];
  socialLinks?: SocialLink[];
  branding?: { siteTitle?: string };
  markdown?: QDocsConfig['markdown'];
  themeDefaults?: { brandHue?: number; brandIntensity?: number };
  themeControls?: boolean;
  headerEnd?: string;
} & UserConfig;

/**
 * Async function form — receives the Vite `ConfigEnv` (`command`, `mode`).
 */
export type QDocsConsumerConfigFn = (
  env: ConfigEnv,
) => QDocsConsumerConfig | Promise<QDocsConsumerConfig>;

function normalizeUserAlias(alias: Alias[] | Record<string, string> | null | undefined): Alias[] {
  if (alias == null) return [];
  if (Array.isArray(alias)) return alias;
  return Object.entries(alias).map(([find, replacement]): Alias => ({ find, replacement }));
}

function buildQDocsConfig(opts: QDocsConsumerConfig): QDocsConfig {
  const resolvedBase = typeof opts.base === 'string' ? opts.base : '/';
  return {
    title: opts.title,
    description: opts.description,
    favicon: opts.favicon,
    home: opts.home,
    sidebar: opts.sidebar,
    nav: opts.nav,
    socialLinks: opts.socialLinks,
    branding: opts.branding,
    markdown: opts.markdown,
    themeDefaults: opts.themeDefaults,
    themeControls: opts.themeControls,
    headerEnd: opts.headerEnd,
    base: resolvedBase,
  };
}

function buildViteUserConfig(opts: QDocsConsumerConfig): UserConfig {
  const {
    base,
    root,
    server,
    preview,
    plugins: userPlugins,
    resolve: userResolve,
    ...viteRest
  } = opts;
  const qdocsConfig = buildQDocsConfig(opts);
  setQDocsConfig(qdocsConfig);

  const projectRoot = pathResolve(root ?? process.cwd());
  const alias: Alias[] = [
    ...normalizeUserAlias(userResolve?.alias as Alias[] | Record<string, string> | undefined),
    { find: '@', replacement: join(projectRoot, 'src') },
  ];

  return {
    ...viteRest,
    root,
    base,
    server,
    preview,
    plugins: [qdocsPlugin({ markdown: qdocsConfig.markdown }), ...(userPlugins ?? [])],
    resolve: { ...userResolve, alias },
  };
}

/**
 * The primary consumer entry point. Accepts either a plain config object or an async function
 * `(env) => config` — the same pattern as Vite's own defineConfig.
 *
 * The async form receives `{ command, mode }` and can `await` external data (e.g. fetching repo
 * lists to populate the sidebar) before returning the config. Vite fully awaits the callback before
 * resolving plugins, so `setQDocsConfig` runs at the right time in both forms.
 *
 * Vite properties (`server`, `preview`, `plugins`, etc.) are passed through and merged with the
 * qdocs defaults.
 */
export function defineConfig(
  opts: QDocsConsumerConfig | QDocsConsumerConfigFn,
): ReturnType<typeof viteDefineConfig> {
  if (typeof opts === 'function') {
    return viteDefineConfig(async (env) => buildViteUserConfig(await opts(env)));
  }
  return viteDefineConfig(buildViteUserConfig(opts));
}
