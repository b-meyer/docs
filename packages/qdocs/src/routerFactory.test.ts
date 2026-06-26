// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import type { RouteLocationNormalized } from 'vue-router';
import type { QDocsConfig } from './config';
import {
  buildAllItems,
  buildFlatOrder,
  homeItem,
  neighborsOf,
  pathFromRoute,
  resolveSidebar,
  scrollBehavior,
} from './routerFactory';
import { prefersReducedMotion } from './runtime/reducedMotion';

vi.mock('./runtime/reducedMotion', () => ({ prefersReducedMotion: vi.fn(() => false) }));

function toRoute(hash: string): RouteLocationNormalized {
  return {
    path: '/',
    hash,
    query: {},
    params: {},
    name: undefined,
    fullPath: `/${hash}`,
    meta: {},
    matched: [],
    redirectedFrom: undefined,
  } as unknown as RouteLocationNormalized;
}

function makeConfig(
  ...items: string[]
): QDocsConfig & { sidebar: NonNullable<QDocsConfig['sidebar']> } {
  return {
    title: 'Test',
    sidebar: [{ group: 'Main', items: items.map((s) => ({ path: s, title: s })) }],
  };
}

describe('pathFromRoute', () => {
  it('maps / to index', () => expect(pathFromRoute('/')).toBe('index'));
  it('maps empty string to index', () => expect(pathFromRoute('')).toBe('index'));
  it('extracts a single segment', () => expect(pathFromRoute('/YinYang')).toBe('YinYang'));
  it('returns the full path for nested routes', () =>
    expect(pathFromRoute('/a/b/c')).toBe('a/b/c'));
});

describe('homeItem', () => {
  it('returns default home when config has no home', () => {
    const config = makeConfig();
    expect(homeItem(config)).toEqual({ path: 'index', title: 'Home' });
  });

  it('returns config.home when provided', () => {
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: [],
      home: { path: 'index', title: 'Welcome' },
    };
    expect(homeItem(config)).toEqual({ path: 'index', title: 'Welcome' });
  });
});

describe('resolveSidebar', () => {
  it('returns the array as-is for a single-tree config', () => {
    const config = makeConfig('intro');
    expect(resolveSidebar(config, '/intro')).toBe(config.sidebar);
  });

  it('selects the matching tree by path prefix', () => {
    const guideGroups = [{ group: 'Guide', items: [{ path: 'guide/intro', title: 'Intro' }] }];
    const apiGroups = [{ group: 'API', items: [{ path: 'api/ref', title: 'Ref' }] }];
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: { '/guide/': guideGroups, '/api/': apiGroups },
    };
    expect(resolveSidebar(config, '/guide/intro')).toBe(guideGroups);
    expect(resolveSidebar(config, '/api/ref')).toBe(apiGroups);
  });

  it('picks the longest-prefix match', () => {
    const rootGroups = [{ group: 'Root', items: [] }];
    const guideGroups = [{ group: 'Guide', items: [] }];
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: { '/': rootGroups, '/guide/': guideGroups },
    };
    expect(resolveSidebar(config, '/guide/intro')).toBe(guideGroups);
  });

  it('falls back to root prefix when no specific prefix matches', () => {
    const rootGroups = [{ group: 'Root', items: [] }];
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: { '/': rootGroups },
    };
    expect(resolveSidebar(config, '/unknown/page')).toBe(rootGroups);
  });

  it('returns an empty array when no prefix matches', () => {
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: { '/guide/': [] },
    };
    expect(resolveSidebar(config, '/api/ref')).toEqual([]);
  });
});

describe('buildFlatOrder', () => {
  it('starts with home and includes non-extra group items', () => {
    const config = makeConfig('intro', 'advanced');
    const flat = buildFlatOrder(config, '/intro');
    expect(flat[0]?.path).toBe('index');
    expect(flat.map((i) => i.path)).toContain('intro');
    expect(flat.map((i) => i.path)).toContain('advanced');
  });

  it('excludes extra-group items', () => {
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: [
        { group: 'Main', items: [{ path: 'intro', title: 'Intro' }] },
        { group: 'Extra', extra: true, items: [{ path: 'appendix', title: 'Appendix' }] },
      ],
    };
    const flat = buildFlatOrder(config, '/intro');
    expect(flat.map((i) => i.path)).not.toContain('appendix');
  });

  it('excludes href-only items (no path)', () => {
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: [
        {
          group: 'Main',
          items: [
            { path: 'intro', title: 'Intro' },
            { href: 'https://example.com', title: 'External' },
          ],
        },
      ],
    };
    const flat = buildFlatOrder(config, '/intro');
    expect(flat.every((i) => i.path !== undefined)).toBe(true);
  });

  it('returns only home when sidebar is empty', () => {
    const config: QDocsConfig = { title: 'Test', sidebar: [] };
    expect(buildFlatOrder(config, '/')).toEqual([{ path: 'index', title: 'Home' }]);
  });
});

describe('buildAllItems', () => {
  it('includes both regular and extra group items', () => {
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: [
        { group: 'Main', items: [{ path: 'intro', title: 'Intro' }] },
        { group: 'Extra', extra: true, items: [{ path: 'appendix', title: 'Appendix' }] },
      ],
    };
    const all = buildAllItems(config);
    expect(all.map((i) => i.path)).toContain('intro');
    expect(all.map((i) => i.path)).toContain('appendix');
  });

  it('flattens items across all trees in a multi-sidebar config', () => {
    const config: QDocsConfig = {
      title: 'Test',
      sidebar: {
        '/guide/': [{ group: 'Guide', items: [{ path: 'guide/intro', title: 'Intro' }] }],
        '/api/': [{ group: 'API', items: [{ path: 'api/ref', title: 'Ref' }] }],
      },
    };
    const all = buildAllItems(config);
    expect(all.map((i) => i.path)).toContain('guide/intro');
    expect(all.map((i) => i.path)).toContain('api/ref');
  });
});

describe('neighborsOf', () => {
  it('returns null prev for the first item', () => {
    const config = makeConfig('a', 'b', 'c');
    const { prev } = neighborsOf(config, 'index');
    expect(prev).toBeNull();
  });

  it('returns null next for the last item', () => {
    const config = makeConfig('a', 'b', 'c');
    const { next } = neighborsOf(config, 'c');
    expect(next).toBeNull();
  });

  it('returns correct prev and next for a middle item', () => {
    const config = makeConfig('a', 'b', 'c');
    const { prev, next } = neighborsOf(config, 'b');
    expect(prev?.path).toBe('a');
    expect(next?.path).toBe('c');
  });

  it('returns null for unknown path', () => {
    const config = makeConfig('a', 'b');
    const { prev, next } = neighborsOf(config, 'nonexistent');
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });
});

describe('scrollBehavior', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
  });

  it('returns savedPosition when provided', async () => {
    const saved = { left: 0, top: 300 };
    const result = await scrollBehavior(toRoute(''), toRoute(''), saved);
    expect(result).toBe(saved);
  });

  it('returns { top: 0 } when there is no hash and no savedPosition', async () => {
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '64' }));
    const result = await scrollBehavior(toRoute(''), toRoute(''), null);
    expect(result).toEqual({ top: 0 });
  });

  it('scrolls to the hash element with the header offset from the CSS var', async () => {
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '80' }));
    const result = await scrollBehavior(toRoute('#section'), toRoute(''), null);
    expect(result).toEqual({ el: '#section', top: 80, behavior: 'smooth' });
  });

  it('falls back to top: 64 when the CSS var is not a finite number', async () => {
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => 'invalid' }));
    const result = await scrollBehavior(toRoute('#section'), toRoute(''), null);
    expect(result).toMatchObject({ top: 64 });
  });

  it('uses auto scroll behavior when reduced motion is preferred', async () => {
    vi.mocked(prefersReducedMotion).mockReturnValue(true);
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '64' }));
    const result = await scrollBehavior(toRoute('#section'), toRoute(''), null);
    expect(result).toMatchObject({ behavior: 'auto' });
  });
});
