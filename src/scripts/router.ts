import type { RouteRecordRaw, RouterScrollBehavior } from 'vue-router';
import { prefersReducedMotion } from '@/scripts/utils';

export type SidebarItem = { slug: string; title: string };
export type SidebarGroup = { group: string; items: SidebarItem[]; extra?: boolean };

export const home: SidebarItem = { slug: 'index', title: 'Home' };

export const sidebar: SidebarGroup[] = [
  {
    group: 'Foundation',
    items: [
      { slug: 'YinYang', title: 'Yin & Yang (Dao)' },
      { slug: 'WuXing', title: 'Wu Xing (Five Phases)' },
    ],
  },
  {
    group: 'Substances',
    items: [
      { slug: 'Qi', title: 'Qi (Vital Energy)' },
      { slug: 'Jing', title: 'Jing (Essence)' },
      { slug: 'Shen', title: 'Shen (Spirit)' },
      { slug: 'Xue', title: 'Xue (Blood)' },
      { slug: 'JinYe', title: 'Jin Ye (Body Fluids)' },
    ],
  },
  {
    group: 'Synthesis & Practice',
    items: [
      { slug: 'ZangFu', title: 'Zang-Fu (Organs)' },
      { slug: 'Jingmai', title: 'Jingmai (Meridians)' },
      { slug: 'Qigong', title: 'Qigong (Energy Work)' },
    ],
  },
  {
    group: 'Causes of Disease',
    extra: true,
    items: [
      { slug: 'LiuYin', title: 'Liu Yin (Six Pathogens)' },
      { slug: 'QiQing', title: 'Qi Qing (Seven Emotions)' },
    ],
  },
  {
    group: 'Diagnostic Apparatus',
    extra: true,
    items: [
      { slug: 'BaGang', title: 'Ba Gang (Eight Principles)' },
      { slug: 'SiZhen', title: 'Si Zhen (Four Examinations)' },
    ],
  },
  {
    group: 'Treatment',
    extra: true,
    items: [
      { slug: 'Acupuncture', title: 'Acupuncture & Moxibustion' },
      { slug: 'Herbs', title: 'Herbal Medicine' },
      { slug: 'TuiNa', title: 'Tui Na (Massage)' },
      { slug: 'Dietary', title: 'Dietary Therapy' },
    ],
  },
  {
    group: 'Zang-Fu Organs',
    extra: true,
    items: [
      { slug: 'Liver', title: 'Liver (Gan)' },
      { slug: 'Gallbladder', title: 'Gallbladder (Dan)' },
      { slug: 'Heart', title: 'Heart (Xin)' },
      { slug: 'SmallIntestine', title: 'Small Intestine' },
      { slug: 'Pericardium', title: 'Pericardium (Xin Bao)' },
      { slug: 'SanJiao', title: 'San Jiao (Triple Burner)' },
      { slug: 'Spleen', title: 'Spleen (Pi)' },
      { slug: 'Stomach', title: 'Stomach (Wei)' },
      { slug: 'Lung', title: 'Lung (Fei)' },
      { slug: 'LargeIntestine', title: 'Large Intestine' },
      { slug: 'Kidney', title: 'Kidney (Shen)' },
      { slug: 'Bladder', title: 'Bladder (Pang Guang)' },
    ],
  },
];

// Linear reading order for prev/next — excludes `extra: true` groups so
// "Additional Reading" pages sit outside the sequence (still routable, still
// cross-linkable, still searchable, just not in the chain).
export const flatOrder: SidebarItem[] = [
  home,
  ...sidebar.filter((g) => !g.extra).flatMap((g) => g.items),
];

// Every routable page (core + extra). Used for route generation and search
// title lookup.
export const allItems: SidebarItem[] = [home, ...sidebar.flatMap((g) => g.items)];

export function slugFromPath(path: string): string {
  if (path === '/' || path === '') return 'index';
  // `?? 'index'` is unreachable at runtime — String.prototype.split always
  // returns a non-empty array. The fallback is here to satisfy TS's
  // `noUncheckedIndexedAccess` widening of tuple[0] to `string | undefined`.
  return path.slice(1).split('/')[0] ?? 'index';
}

export function neighbors(currentSlug: string): {
  prev: SidebarItem | null;
  next: SidebarItem | null;
} {
  const idx = flatOrder.findIndex((i) => i.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? (flatOrder[idx - 1] ?? null) : null,
    next: idx < flatOrder.length - 1 ? (flatOrder[idx + 1] ?? null) : null,
  };
}

const pages = import.meta.glob('../pages/*.md');

for (const item of allItems) {
  if (!pages[`../pages/${item.slug}.md`]) {
    throw new Error(`router.ts: no markdown file for sidebar slug "${item.slug}"`);
  }
}
const notFound = pages['../pages/NotFound.md'];
if (!notFound) {
  throw new Error('router.ts: src/pages/NotFound.md is required for the catch-all route');
}

export const routes: RouteRecordRaw[] = allItems.map((item) => ({
  path: item.slug === 'index' ? '/' : `/${item.slug}`,
  component: pages[`../pages/${item.slug}.md`]!,
}));

// Hidden smoke-test page outside the sidebar manifest. Absence from sidebar /
// allItems keeps it out of the nav, search index, and prev/next chain;
// ssgOptions.includedRoutes filters it from the SSG build so it stays a
// dev/preview vehicle.
const kitchen = pages['../pages/_kitchen.md'];
if (kitchen) routes.push({ path: '/_kitchen', component: kitchen });

routes.push({ path: '/:pathMatch(.*)*', component: notFound });

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
