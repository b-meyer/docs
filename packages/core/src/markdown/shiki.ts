import type MarkdownIt from 'markdown-it';
import type { Highlighter, ShikiTransformer } from 'shiki';

/**
 * A HAST transformer that adds `v-pre` (Vue template safety) and `not-prose`
 * (@tailwindcss/typography opt-out) to every Shiki `<pre>` element. Prepended
 * to every `codeToHtml` call so consumers' transformers run after it.
 */
const frameworkTransformer: ShikiTransformer = {
  name: 'framework:pre-attrs',
  pre(node) {
    const cls = node.properties.class;
    node.properties.class = cls ? `${String(cls)} not-prose` : 'not-prose';
    node.properties['v-pre'] = '';
  },
};

/**
 * Build-time Shiki highlighting for code fences. Registered after `mdMermaid`
 * so `mermaid` fences are delegated to that plugin's renderer.
 * Opt-in: only registered when `config.markdown.shiki === true`.
 */
export function mdShiki(
  md: MarkdownIt,
  highlighter: Highlighter,
  transformers: ShikiTransformer[],
): void {
  const defaultFence =
    md.renderer.rules.fence ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (!token || token.info.trim() === 'mermaid') {
      return defaultFence(tokens, idx, options, env, self);
    }

    const lang = token.info.split(/\s+/u)[0]?.trim() || 'text';
    const code = token.content;
    const allTransformers = [frameworkTransformer, ...transformers];

    try {
      return highlighter.codeToHtml(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark-dimmed' },
        defaultColor: false,
        transformers: allTransformers,
      });
    } catch {
      try {
        return highlighter.codeToHtml(code, {
          lang: 'text',
          themes: { light: 'github-light', dark: 'github-dark-dimmed' },
          defaultColor: false,
          transformers: allTransformers,
        });
      } catch {
        return defaultFence(tokens, idx, options, env, self);
      }
    }
  };
}
