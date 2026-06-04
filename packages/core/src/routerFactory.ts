import type { RouteRecordRaw, RouterScrollBehavior } from 'vue-router';
import type { FrameworkConfig, SidebarItem } from './config';
import { prefersReducedMotion } from './runtime/reducedMotion';

const DEFAULT_HOME: SidebarItem = { slug: 'index', title: 'Home' };

// A page glob is the value of `import.meta.glob('./pages/*.md')` in the consumer:
// a map of file path → lazy module loader. vue-router accepts the loader directly
// as a lazy route component.
type PageLoader = () => Promise<unknown>;
export type PagesGlob = Record<string, PageLoader>;

const SLUG_FROM_GLOB = /^.*\/([^/]+)\.md$/u;

export function homeItem(config: FrameworkConfig): SidebarItem {
  return config.home ?? DEFAULT_HOME;
}

/** Linear reading order for prev/next — excludes `extra: true` groups. */
export function buildFlatOrder(config: FrameworkConfig): SidebarItem[] {
  return [homeItem(config), ...config.sidebar.filter((g) => !g.extra).flatMap((g) => g.items)];
}

/** Every nav item (core + extra). Used for search title lookup and validation. */
export function buildAllItems(config: FrameworkConfig): SidebarItem[] {
  return [homeItem(config), ...config.sidebar.flatMap((g) => g.items)];
}

export function slugFromPath(path: string): string {
  if (path === '/' || path === '') return 'index';
  // `?? 'index'` is unreachable at runtime — String.prototype.split always
  // returns a non-empty array. The fallback satisfies `noUncheckedIndexedAccess`.
  return path.slice(1).split('/')[0] ?? 'index';
}

export function neighborsOf(
  config: FrameworkConfig,
  currentSlug: string,
): { prev: SidebarItem | null; next: SidebarItem | null } {
  const flatOrder = buildFlatOrder(config);
  const idx = flatOrder.findIndex((i) => i.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? (flatOrder[idx - 1] ?? null) : null,
    next: idx < flatOrder.length - 1 ? (flatOrder[idx + 1] ?? null) : null,
  };
}

/**
 * Build routes from the pages glob — **every** `.md` file gets a route (this is
 * the framework's glob-driven model; the sidebar manifest drives nav order/grouping
 * only, not routing). `index.md` → `/`, `NotFound.md` → catch-all, everything else
 * → `/<slug>`. A page absent from the sidebar (e.g. a hidden smoke-test page) still
 * routes and is reachable in dev; `ssgOptions.includedRoutes` is what keeps hidden
 * pages out of the prerendered build.
 */
export function createRoutes(config: FrameworkConfig, pages: PagesGlob): RouteRecordRaw[] {
  const bySlug = new Map<string, PageLoader>();
  for (const [path, loader] of Object.entries(pages)) {
    const slug = path.replace(SLUG_FROM_GLOB, '$1');
    bySlug.set(slug, loader);
  }

  const notFound = bySlug.get('NotFound');
  if (!notFound) {
    throw new Error('createRoutes: a `NotFound.md` page is required for the catch-all route.');
  }

  // Dev safety: a sidebar entry with no matching page would render a dead nav link.
  for (const item of buildAllItems(config)) {
    if (!bySlug.has(item.slug)) {
      throw new Error(`createRoutes: no markdown file for sidebar slug "${item.slug}".`);
    }
  }

  const routes: RouteRecordRaw[] = [];
  for (const [slug, loader] of bySlug) {
    if (slug === 'NotFound') continue;
    routes.push({ path: slug === 'index' ? '/' : `/${slug}`, component: loader });
  }
  routes.push({ path: '/:pathMatch(.*)*', component: notFound });
  return routes;
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
