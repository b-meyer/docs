import type MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';

const MD_LINK = /^(?:\.\/)?([^#?:/]+(?:\/[^#?:/]+)*)\.md(\?[^#]*)?(#.*)?$/u;

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

const CALLOUT_TITLES: Record<string, string> = {
  tip: 'TIP',
  info: 'INFO',
  warning: 'WARNING',
  danger: 'DANGER',
};

export function mdContainers(md: MarkdownIt): void {
  for (const type of ['tip', 'info', 'warning', 'danger']) {
    md.use(container, type, {
      render(tokens, idx) {
        const tok = tokens[idx];
        if (!tok) return '';
        if (tok.nesting === 1) {
          const info = tok.info.trim();
          const customTitle = info.slice(type.length).trim();
          const title = customTitle || CALLOUT_TITLES[type] || type;
          return `<div class="callout callout-${type}"><p class="callout-title">${md.utils.escapeHtml(title)}</p>\n`;
        }
        return `</div>\n`;
      },
    });
  }

  md.use(container, 'details', {
    render(tokens, idx) {
      const tok = tokens[idx];
      if (!tok) return '';
      if (tok.nesting === 1) {
        const info = tok.info.trim();
        const customTitle = info.slice('details'.length).trim();
        const title = customTitle || 'Details';
        return `<details class="callout callout-details"><summary class="callout-title">${md.utils.escapeHtml(title)}</summary>\n`;
      }
      return `</details>\n`;
    },
  });
}

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][^\n\r]*\r?\n?/u;
const ALERT_TITLES: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

type AlertMeta = { alertType?: string };

function tagMatchingClose(
  tokens: { type: string; meta: unknown }[],
  openIdx: number,
  type: string,
): void {
  let depth = 1;
  for (let j = openIdx + 1; j < tokens.length; j++) {
    const t = tokens[j];
    if (!t) continue;
    if (t.type === 'blockquote_open') depth++;
    else if (t.type === 'blockquote_close') {
      depth--;
      if (depth === 0) {
        t.meta = { ...(t.meta as object | null), alertType: type };
        return;
      }
    }
  }
}

export function mdAlerts(md: MarkdownIt): void {
  md.core.ruler.after('block', 'github-alerts', (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const bq = tokens[i];
      if (bq?.type !== 'blockquote_open') continue;
      const inline = tokens[i + 2];
      if (inline?.type !== 'inline') continue;
      const m = ALERT_RE.exec(inline.content);
      if (!m) continue;

      const type = m[1]!.toLowerCase();
      inline.content = inline.content.replace(ALERT_RE, '');
      inline.children = [];
      state.md.inline.parse(inline.content, state.md, state.env, inline.children);

      bq.meta = { ...(bq.meta as object | null), alertType: type };
      tagMatchingClose(tokens, i, type);
    }
    return false;
  });

  const defaultOpen =
    md.renderer.rules.blockquote_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  const defaultClose =
    md.renderer.rules.blockquote_close ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.blockquote_open = (tokens, idx, options, env, self) => {
    const type = (tokens[idx]?.meta as AlertMeta | null)?.alertType;
    if (!type) return defaultOpen(tokens, idx, options, env, self);
    const title = ALERT_TITLES[type] ?? type;
    return `<div class="alert alert-${type}"><p class="alert-title">${title}</p>\n`;
  };
  md.renderer.rules.blockquote_close = (tokens, idx, options, env, self) => {
    const type = (tokens[idx]?.meta as AlertMeta | null)?.alertType;
    if (!type) return defaultClose(tokens, idx, options, env, self);
    return `</div>\n`;
  };
}
