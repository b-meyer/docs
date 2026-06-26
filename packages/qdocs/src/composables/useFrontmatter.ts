import { inject } from 'vue';

export type PageOutline = false | readonly number[];

export type PageFrontmatter = {
  title?: string;
  description?: string;
  hidden?: boolean;
  outline?: PageOutline;
  /**
   * `layout: home` selects HomeLayout via LayoutResolver (added in M3).
   */
  layout?: string;
  [key: string]: unknown;
};

export const FRONTMATTER_KEY = 'page-frontmatter';

export function useFrontmatter(): PageFrontmatter {
  return inject<PageFrontmatter>(FRONTMATTER_KEY, {});
}
