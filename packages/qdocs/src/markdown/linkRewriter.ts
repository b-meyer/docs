import type MarkdownIt from 'markdown-it';

const MD_LINK = /^(?:\.\/)?([^#?:/]+(?:\/[^#?:/]+)*)\.md(\?[^#]*)?(#.*)?$/u;

/**
 * Rewrite in-content `[X](OtherFile.md)` links to SPA routes, preserving any query/hash. `index.md`
 * maps to `/`; `guide/index.md` maps to `/guide`. `getBase` is called at render time so it picks up
 * the resolved Vite base.
 */
export function mdLinkRewriter(md: MarkdownIt, getBase: () => string = () => '/'): void {
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
          const raw = match[1] ?? '';
          // Normalise directory indexes: 'guide/index' → 'guide', 'index' → ''
          const normalised = raw === 'index' ? '' : raw.replace(/\/index$/u, '');
          const base = getBase().replace(/\/$/u, '');
          const query = match[2] ?? '';
          const hash = match[3] ?? '';
          token.attrs![hrefIndex]![1] =
            `${base}${normalised ? `/${normalised}` : '/'}${query}${hash}`;
        }
      }
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
