import type MarkdownIt from 'markdown-it';

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

/**
 * GitHub-style alerts: `> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]`.
 */
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
