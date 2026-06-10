import { join, resolve as pathResolve } from 'node:path';
import { defineConfig as viteDefineConfig, type Alias, type UserConfig } from 'vite';
import type { FrameworkConfig, SidebarGroup, SidebarItem } from './config.ts';
import { setFrameworkConfig, frameworkPlugin } from './plugin.ts';

// The consumer's merged config type: all FrameworkConfig fields (except `base`,
// which unifies with Vite's `base`) plus any Vite UserConfig overrides.
export type FrameworkConsumerConfig = {
  title: string;
  description?: string;
  favicon?: string;
  home?: SidebarItem;
  sidebar: SidebarGroup[] | Record<string, SidebarGroup[]>;
  branding?: { siteTitle?: string };
  markdown?: FrameworkConfig['markdown'];
  themeDefaults?: { brandHue?: number; brandIntensity?: number };
} & UserConfig;

function normalizeUserAlias(alias: Alias[] | Record<string, string> | null | undefined): Alias[] {
  if (alias == null) return [];
  if (Array.isArray(alias)) return alias;
  return Object.entries(alias).map(([find, replacement]): Alias => ({ find, replacement }));
}

/**
 * The primary consumer entry point. Replaces both `framework.config.ts` and the
 * boilerplate in `vite.config.ts`. Returns a standard Vite config with the
 * framework plugin array and @/ alias preconfigured.
 *
 * Vite properties (`server`, `preview`, `plugins`, etc.) are passed through and
 * merged with the framework defaults.
 */
export function defineConfig(opts: FrameworkConsumerConfig): ReturnType<typeof viteDefineConfig> {
  const {
    title,
    description,
    favicon,
    home,
    sidebar,
    branding,
    markdown,
    themeDefaults,
    base,
    root,
    server,
    preview,
    plugins: userPlugins,
    resolve: userResolve,
    ...viteRest
  } = opts;

  const frameworkConfig: FrameworkConfig = {
    title,
    description,
    favicon,
    home,
    sidebar,
    branding,
    markdown,
    themeDefaults,
    base: typeof base === 'string' ? base : '/',
  };
  setFrameworkConfig(frameworkConfig);

  const projectRoot = pathResolve(root ?? process.cwd());
  const alias: Alias[] = [
    ...normalizeUserAlias(userResolve?.alias as Alias[] | Record<string, string> | undefined),
    { find: '@', replacement: join(projectRoot, 'src') },
  ];

  return viteDefineConfig({
    ...viteRest,
    root,
    base,
    server,
    preview,
    plugins: [frameworkPlugin({ markdown: frameworkConfig.markdown }), ...(userPlugins ?? [])],
    resolve: { ...userResolve, alias },
  });
}
