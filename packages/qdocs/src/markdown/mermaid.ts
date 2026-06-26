import type MarkdownIt from 'markdown-it';

/**
 * Build-time half of mermaid support: turn ` ```mermaid ` fences into `<pre class="mermaid
 * not-prose">…</pre>`. The runtime half (`runMermaid` in `runtime/mermaid.ts`) renders these
 * client-side. Opt-in: only registered when `config.markdown.mermaid === true`, so non-diagram
 * consumers don't ship the dep.
 */
export function mdMermaid(md: MarkdownIt): void {
  const defaultFence =
    md.renderer.rules.fence ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token?.info.trim() === 'mermaid') {
      return `<pre class="mermaid not-prose">${md.utils.escapeHtml(token.content)}</pre>`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };
}
