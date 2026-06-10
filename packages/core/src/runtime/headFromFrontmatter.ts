import { useHead } from '@unhead/vue';
import type { PageFrontmatter } from '../composables/useFrontmatter';

export function headFromFrontmatter(fm: PageFrontmatter | undefined | null): void {
  const title = typeof fm?.title === 'string' ? fm.title : undefined;
  const description = typeof fm?.description === 'string' ? fm.description : undefined;
  useHead({
    title,
    meta: [
      ...(description ? [{ name: 'description', content: description }] : []),
      ...(title ? [{ property: 'og:title', content: title }] : []),
      ...(description ? [{ property: 'og:description', content: description }] : []),
    ],
  });
}
