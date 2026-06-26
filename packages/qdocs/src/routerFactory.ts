import type { RouterScrollBehavior } from 'vue-router';
import type { QDocsConfig, SidebarEntry, SidebarItem } from './config';
import { isSidebarGroup } from './config';
import { prefersReducedMotion } from './runtime/reducedMotion';

const DEFAULT_HOME: SidebarItem = { path: 'index', title: 'Home' };

export function homeItem(config: QDocsConfig): SidebarItem {
  return config.home ?? DEFAULT_HOME;
}

/**
 * Resolves the active sidebar tree for the given route path.
 *
 * - Array config: always returns the array as-is.
 * - Record config: longest-prefix match on `routePath` (e.g. '/guide/intro' matches '/guide/' before
 *   '/'). Falls back to an empty array if no prefix matches.
 */
export function resolveSidebar(config: QDocsConfig, routePath: string): SidebarEntry[] {
  const { sidebar } = config;
  if (Array.isArray(sidebar)) return sidebar;
  const keys = Object.keys(sidebar);
  const normalizedRoute = routePath.endsWith('/') ? routePath : `${routePath}/`;
  const matched = keys
    .filter((k) => {
      const prefix = k.endsWith('/') ? k : `${k}/`;
      return routePath === k || normalizedRoute.startsWith(prefix) || k === '/';
    })
    .toSorted((a, b) => b.length - a.length);
  const best = matched[0];
  return best !== undefined && sidebar[best] ? sidebar[best] : [];
}

/**
 * Returns the full route path without its leading slash, normalised as the item identity key used
 * throughout the nav layer.
 *
 * '/' → 'index' '/YinYang' → 'YinYang' '/guide/intro' → 'guide/intro'
 */
export function pathFromRoute(path: string): string {
  if (path === '/' || path === '') return 'index';
  return path.slice(1);
}

/**
 * Linear reading order for prev/next — excludes `extra: true` groups and href-only items.
 */
export function buildFlatOrder(config: QDocsConfig, routePath: string): SidebarItem[] {
  const entries = resolveSidebar(config, routePath);
  return [
    homeItem(config),
    ...entries
      .filter((e) => !isSidebarGroup(e) || !e.extra)
      .flatMap((e) =>
        isSidebarGroup(e)
          ? e.items.filter((i) => i.path !== undefined)
          : e.path === undefined
            ? []
            : [e],
      ),
  ];
}

/**
 * Every nav item across all trees. Used for search title lookup and validation.
 */
export function buildAllItems(config: QDocsConfig): SidebarItem[] {
  const allEntries: SidebarEntry[] = Array.isArray(config.sidebar)
    ? config.sidebar
    : Object.values(config.sidebar).flat();
  return [homeItem(config), ...allEntries.flatMap((e) => (isSidebarGroup(e) ? e.items : [e]))];
}

export function neighborsOf(
  config: QDocsConfig,
  currentPath: string,
): { prev: SidebarItem | null; next: SidebarItem | null } {
  const routePath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
  const flatOrder = buildFlatOrder(config, routePath);
  const idx = flatOrder.findIndex((i) => i.path === currentPath);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? (flatOrder[idx - 1] ?? null) : null,
    next: idx < flatOrder.length - 1 ? (flatOrder[idx + 1] ?? null) : null,
  };
}

export const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  if (savedPosition) return savedPosition;
  if (to.hash) {
    // Offset by the sticky header height so the heading lands below it, not under it.
    // `--header-h` is set by AppHeader's ResizeObserver; falls back to 64 before mount.
    const headerH = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
    );
    return {
      el: to.hash,
      top: Number.isFinite(headerH) ? headerH : 64,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    };
  }
  return { top: 0 };
};
