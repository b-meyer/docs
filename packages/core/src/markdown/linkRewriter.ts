import type MarkdownIt from 'markdown-it';

const MD_LINK = /^(?:\.\/)?([^#?:/]+(?:\/[^#?:/]+)*)\.md(\?[^#]*)?(#.*)?$/u;

/**
 * Rewrite in-content `[X](OtherFile.md)` links to SPA routes (`/OtherFile`),
 * preserving any query/hash. `index.md` maps to `/`. This is what keeps content
 * cross-links refactor-safe — pages link by filename, not by route.
 */
export function mdLinkRewriter(md: MarkdownIt): void {
  const defaultRender =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (!token) return defaultRender(tokens, idx, options, env, self);
    const hrefIndex = token.attrIndex('href');
    if (hrefIndex >= 0) {
      const href = token.attrs?.[hrefIndex]?.[1];
      if (href) {
        const match = href.match(MD_LINK);
        if (match) {
          const basename = match[1]?.split('/').pop() ?? '';
          const query = match[2] ?? '';
          const hash = match[3] ?? '';
          const path = basename === 'index' ? '' : `/${basename}`;
          token.attrs![hrefIndex]![1] = `${path || '/'}${query}${hash}`;
        }
      }
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
