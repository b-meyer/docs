import type { default as Mermaid } from 'mermaid';

type MermaidLib = typeof Mermaid;

const THEME_VAR_MAP: Record<string, string> = {
  background: '--color-gray-50',
  primaryColor: '--color-primary-100',
  primaryTextColor: '--color-gray-900',
  primaryBorderColor: '--color-primary-400',
  secondaryColor: '--color-primary-200',
  tertiaryColor: '--color-gray-100',
  lineColor: '--color-gray-500',
  textColor: '--color-gray-800',
};

const sources = new WeakMap<HTMLElement, string>();
let mermaidLib: MermaidLib | undefined;

function resolveThemeVars(): Record<string, string> {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.documentElement.append(probe);
  const result: Record<string, string> = {};
  try {
    for (const [mermaidVar, cssVar] of Object.entries(THEME_VAR_MAP)) {
      probe.style.color = `var(${cssVar})`;
      result[mermaidVar] = getComputedStyle(probe).color;
    }
  } finally {
    probe.remove();
  }
  return result;
}

async function initMermaid(): Promise<MermaidLib> {
  if (!mermaidLib) {
    mermaidLib = (await import('mermaid')).default;
  }
  mermaidLib.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: resolveThemeVars(),
    securityLevel: 'strict',
  });
  return mermaidLib;
}

/**
 * Render any unprocessed `pre.mermaid` elements inside `root`. Stashes the original source text per
 * element so [[rerenderAll]] can rebuild after a theme change.
 *
 * @param root - Subtree to scan. Typically the article element of the current page.
 */
export async function runMermaid(root: HTMLElement): Promise<void> {
  const nodes = [...root.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])')];
  if (nodes.length === 0) return;
  const lib = await initMermaid();
  for (const node of nodes) {
    if (!sources.has(node)) sources.set(node, node.textContent ?? '');
  }
  await lib.run({ nodes });
}

/**
 * Restore every processed `pre.mermaid` element to its stashed source text and re-run mermaid with
 * freshly-resolved theme variables. Called when the `.dark` class flips on `<html>`.
 */
async function rerenderAll(): Promise<void> {
  const nodes = [...document.querySelectorAll<HTMLElement>('pre.mermaid[data-processed]')];
  if (nodes.length === 0) {
    await initMermaid();
    return;
  }
  for (const node of nodes) {
    const src = sources.get(node);
    if (src === undefined) continue;
    node.textContent = src;
    delete node.dataset.processed;
  }
  const lib = await initMermaid();
  await lib.run({ nodes });
}

function themeSignature(): string {
  const html = document.documentElement;
  const cs = getComputedStyle(html);
  const dark = html.classList.contains('dark') ? '1' : '0';
  const hue = cs.getPropertyValue('--brand-hue').trim();
  const intensity = cs.getPropertyValue('--brand-intensity').trim();
  return `${dark}|${hue}|${intensity}`;
}

/**
 * Install a `MutationObserver` on `<html>` that re-renders mermaid diagrams whenever the theme
 * inputs (the `.dark` class, `--brand-hue`, `--brand-intensity`) change. Debounced so a slider drag
 * triggers one re-render on release, not one per pointer move. Returns a disposer.
 */
export function watchColorScheme(): () => void {
  let last = themeSignature();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new MutationObserver(() => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      const next = themeSignature();
      if (next === last) return;
      last = next;
      void rerenderAll();
    }, 150);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
  return () => {
    if (timer !== undefined) clearTimeout(timer);
    observer.disconnect();
  };
}
