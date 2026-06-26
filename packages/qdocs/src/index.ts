// qdocs — public surface.
// Named entry points also exist as package.json `exports`: `./config`, `./vite`,
// `./ssg`, `./sitemap`, `./App.vue`, `./styles/qdocs.css`.

export * from './config';
export * from './routerFactory';
export { useConfig } from './composables/useConfig';
export { useTheme } from './composables/useTheme';
export { useReadingMode } from './composables/useReadingMode';
export {
  useFrontmatter,
  FRONTMATTER_KEY,
  type PageFrontmatter,
  type PageOutline,
} from './composables/useFrontmatter';
export {
  useSearch,
  targetFor,
  type SearchEntry,
  type IndexedEntry,
  type SearchResult,
} from './composables/useSearch';
export { slugify } from './runtime/slugify';
export { prefersReducedMotion } from './runtime/reducedMotion';
export { runMermaid, watchColorScheme } from './runtime/mermaid';
export { headFromFrontmatter } from './runtime/headFromFrontmatter';
