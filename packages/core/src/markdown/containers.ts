import type MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';

const CALLOUT_TITLES: Record<string, string> = {
  tip: 'TIP',
  info: 'INFO',
  warning: 'WARNING',
  danger: 'DANGER',
};

/** Custom callout containers: `:::tip`, `:::info`, `:::warning`, `:::danger`, `:::details`. */
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
