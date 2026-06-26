import type MarkdownIt from 'markdown-it';

/**
 * Wrap every rendered `<table>` in `<div class="table-wrap">` for horizontal scroll.
 */
export function mdTableWrapper(md: MarkdownIt): void {
  const defaultOpen =
    md.renderer.rules.table_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.table_open = (tokens, idx, options, env, self) =>
    `<div class="table-wrap">${defaultOpen(tokens, idx, options, env, self)}`;

  const defaultClose =
    md.renderer.rules.table_close ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.table_close = (tokens, idx, options, env, self) =>
    `${defaultClose(tokens, idx, options, env, self)}</div>`;
}
