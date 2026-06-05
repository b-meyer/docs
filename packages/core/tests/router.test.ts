import { describe, expect, it } from 'vite-plus/test';
import type { FrameworkConfig } from '../src/config';
import { createRoutes, type PagesGlob } from '../src/routerFactory';

const loader = () => Promise.resolve({});

function makePages(...slugs: string[]): PagesGlob {
  return Object.fromEntries(slugs.map((s) => [`./pages/${s}.md`, loader]));
}

function makeConfig(...items: string[]): FrameworkConfig {
  return {
    title: 'Test',
    sidebar: [{ group: 'Main', items: items.map((s) => ({ slug: s, title: s })) }],
  };
}

describe('createRoutes', () => {
  it('generates one route per page file (excluding NotFound catch-all as its own route)', () => {
    const pages = makePages('index', 'intro', 'NotFound');
    const config = makeConfig('intro');
    const routes = createRoutes(config, pages);
    // index (/), intro (/intro), catch-all (/:pathMatch)
    expect(routes).toHaveLength(3);
  });

  it('maps index.md to the root path /', () => {
    const pages = makePages('index', 'NotFound');
    const config = makeConfig();
    const routes = createRoutes(config, pages);
    const home = routes.find((r) => r.path === '/');
    expect(home).toBeDefined();
  });

  it('maps other pages to /<slug> paths', () => {
    const pages = makePages('index', 'about', 'NotFound');
    const config = makeConfig('about');
    const routes = createRoutes(config, pages);
    expect(routes.some((r) => r.path === '/about')).toBe(true);
  });

  it('includes a catch-all route for NotFound', () => {
    const pages = makePages('index', 'NotFound');
    const config = makeConfig();
    const routes = createRoutes(config, pages);
    expect(routes.some((r) => r.path === '/:pathMatch(.*)*')).toBe(true);
  });

  it('throws when NotFound.md is absent', () => {
    const pages = makePages('index');
    const config: FrameworkConfig = { title: 'Test', sidebar: [] };
    expect(() => createRoutes(config, pages)).toThrow('NotFound.md');
  });

  it('throws when a sidebar slug has no matching page file', () => {
    const pages = makePages('index', 'NotFound');
    const config = makeConfig('missing-page');
    expect(() => createRoutes(config, pages)).toThrow('"missing-page"');
  });
});
