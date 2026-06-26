import type MarkdownIt from 'markdown-it';

const MD_LINK = /^(?:\.\/)?([^#?:/]+(?:\/[^#?:/]+)*)\.md(\?[^#]*)?(#.*)?$/u;

/**
 * Core-rule half of automatic link-title resolution: when a link's display text is the bare
 * filename (e.g. `[YinYang.md](YinYang.md)`), replace it with the sidebar title supplied by
 * `getTitles`. Custom display text is left untouched. Runs before rendering so it composes cleanly
 * with `mdLinkRewriter`.
 */
export function mdLinkTitles(md: MarkdownIt, getTitles: () => Map<string, string>): void {
  md.core.ruler.push('link_titles', (state) => {
    const titles = getTitles();
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue;
      const ch = block.children;
      for (let i = 0; i < ch.length - 1; i++) {
        const tok = ch[i];
        if (tok.type !== 'link_open') continue;
        const hi = tok.attrIndex('href');
        if (hi < 0) continue;
        const href = tok.attrs?.[hi]?.[1];
        if (!href) continue;
        const m = href.match(MD_LINK);
        if (!m) continue;
        const slug = m[1] ?? '';
        const next = ch[i + 1];
        if (next?.type !== 'text' || next.content !== `${slug}.md`) continue;
        const title = titles.get(slug);
        if (title !== undefined) next.content = title;
      }
    }
  });
}
