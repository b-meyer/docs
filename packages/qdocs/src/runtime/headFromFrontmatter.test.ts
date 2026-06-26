import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const useHeadMock = vi.fn();
vi.mock('@unhead/vue', () => ({ useHead: useHeadMock }));

// Dynamic import so the mock is in place before the module loads
const { headFromFrontmatter } = await import('./headFromFrontmatter');

describe('headFromFrontmatter', () => {
  beforeEach(() => {
    useHeadMock.mockClear();
  });

  it('calls useHead with undefined title and empty meta when fm is undefined', () => {
    headFromFrontmatter();
    expect(useHeadMock).toHaveBeenCalledWith({ title: undefined, meta: [] });
  });

  it('calls useHead with undefined title and empty meta when fm is null', () => {
    headFromFrontmatter(null);
    expect(useHeadMock).toHaveBeenCalledWith({ title: undefined, meta: [] });
  });

  it('passes a string title through', () => {
    headFromFrontmatter({ title: 'My Page' });
    expect(useHeadMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'My Page' }));
  });

  it('ignores a non-string title (number)', () => {
    headFromFrontmatter({ title: 42 as unknown as string });
    expect(useHeadMock).toHaveBeenCalledWith(expect.objectContaining({ title: undefined }));
  });

  it('adds description and og:description meta when description is a string', () => {
    headFromFrontmatter({ description: 'About this page.' });
    expect(useHeadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: [
          { name: 'description', content: 'About this page.' },
          { property: 'og:description', content: 'About this page.' },
        ],
      }),
    );
  });

  it('adds og:title meta when title is a string', () => {
    headFromFrontmatter({ title: 'My Page' });
    expect(useHeadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: [{ property: 'og:title', content: 'My Page' }],
      }),
    );
  });

  it('emits empty meta when description is not a string', () => {
    headFromFrontmatter({ description: 123 as unknown as string });
    expect(useHeadMock).toHaveBeenCalledWith(expect.objectContaining({ meta: [] }));
  });

  it('passes both title and description when both are strings', () => {
    headFromFrontmatter({ title: 'Page', description: 'Desc' });
    expect(useHeadMock).toHaveBeenCalledWith({
      title: 'Page',
      meta: [
        { name: 'description', content: 'Desc' },
        { property: 'og:title', content: 'Page' },
        { property: 'og:description', content: 'Desc' },
      ],
    });
  });
});
