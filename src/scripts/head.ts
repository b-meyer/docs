import { useHead } from '@unhead/vue';
import type { PageFrontmatter } from '@/scripts/page';

export function headFromFrontmatter(fm: PageFrontmatter | undefined | null): void {
  const title = typeof fm?.title === 'string' ? fm.title : undefined;
  const description = typeof fm?.description === 'string' ? fm.description : undefined;
  useHead({
    title,
    meta: description ? [{ name: 'description', content: description }] : [],
  });
}
