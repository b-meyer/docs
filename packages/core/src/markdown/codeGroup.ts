import type MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import type { StateCore } from 'markdown-it/lib/rules_core/state_core.mjs';
import type { Highlighter, ShikiTransformer } from 'shiki';

const frameworkTransformer: ShikiTransformer = {
  name: 'framework:pre-attrs',
  pre(node) {
    const cls = node.properties.class;
    node.properties.class = cls ? `${String(cls)} not-prose` : 'not-prose';
    node.properties['v-pre'] = '';
  },
};

function highlightTab(
  code: string,
  lang: string,
  highlighter: Highlighter,
  transformers: ShikiTransformer[],
): string {
  const allTransformers = [frameworkTransformer, ...transformers];
  const opts = {
    themes: { light: 'github-light' as const, dark: 'github-dark-dimmed' as const },
    defaultColor: false as const,
    transformers: allTransformers,
  };
  try {
    return highlighter.codeToHtml(code, { lang, ...opts });
  } catch {
    return highlighter.codeToHtml(code, { lang: 'text', ...opts });
  }
}

function collectTabs(
  tokens: StateCore['tokens'],
  start: number,
  end: number,
  highlighter: Highlighter,
  transformers: ShikiTransformer[],
): Array<{ label: string; html: string }> {
  const tabs: Array<{ label: string; html: string }> = [];
  for (let k = start + 1; k < end; k++) {
    const token = tokens[k];
    if (!token || token.type !== 'fence') continue;
    const match = /^(\S+)(?:\s+\[(.+)\])?$/u.exec(token.info.trim());
    const lang = match?.[1] ?? 'text';
    const label = match?.[2] ?? lang;
    tabs.push({ label, html: highlightTab(token.content, lang, highlighter, transformers) });
  }
  return tabs;
}

function buildOutput(tabs: Array<{ label: string; html: string }>): string {
  const tabsMeta = JSON.stringify(tabs.map((t) => ({ label: t.label })));
  const singleQuoted = tabsMeta.replaceAll("'", "\\'");
  const slotHtml = tabs.map((t, i) => `<template #tab-${i}>${t.html}</template>`).join('\n');
  return `<CodeGroup :tabs='${singleQuoted}'>\n${slotHtml}\n</CodeGroup>\n`;
}

function processCodeGroupTokens(
  state: StateCore,
  highlighter: Highlighter,
  transformers: ShikiTransformer[],
): void {
  const tokens = state.tokens;
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i]?.type !== 'container_code-group_open') {
      i++;
      continue;
    }
    const start = i;
    let depth = 1;
    let j = i + 1;
    while (j < tokens.length && depth > 0) {
      if (tokens[j]?.type === 'container_code-group_open') depth++;
      else if (tokens[j]?.type === 'container_code-group_close') depth--;
      j++;
    }
    const end = j - 1;
    const tabs = collectTabs(tokens, start, end, highlighter, transformers);
    const htmlToken = new state.Token('html_block', '', 0);
    htmlToken.content = buildOutput(tabs);
    tokens.splice(start, end - start + 1, htmlToken);
    i++;
  }
}

/**
 * Renders `:::code-group` containers as `<CodeGroup>` tab components.
 *
 * Syntax:
 * ```
 * ::: code-group
 * ```ts [TypeScript]
 * const x: string = 'hello'
 * ```
 * ```js [JavaScript]
 * const x = 'hello'
 * ```
 * :::
 * ```
 *
 * The `[Label]` in the fence info line sets the tab label; defaults to the
 * language identifier if omitted.
 */
export function mdCodeGroup(
  md: MarkdownIt,
  highlighter: Highlighter,
  transformers: ShikiTransformer[],
): void {
  md.use(container, 'code-group', { render: () => '' });
  md.core.ruler.push('code-group', (state) => {
    processCodeGroupTokens(state, highlighter, transformers);
  });
}
