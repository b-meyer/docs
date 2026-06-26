import MarkdownIt from 'markdown-it';
import type { Highlighter, ShikiTransformer } from 'shiki';
import { computed, readonly, ref, shallowRef, toValue } from 'vue';
import type { MaybeRefOrGetter, Readonly, Ref } from 'vue';
import { mdAlerts } from './alerts.ts';
import { mdContainers } from './containers.ts';
import { mdMermaid } from './mermaid.ts';
import { mdShiki } from './shiki.ts';
import { mdTableWrapper } from './tableWrapper.ts';

export type MarkdownRendererOptions = {
  /**
   * Enable Shiki syntax highlighting for fenced code blocks. The renderer starts immediately with a
   * basic instance and upgrades reactively once the shared Shiki highlighter finishes loading.
   * Defaults to true.
   */
  shiki?: boolean;
  /**
   * Enable mermaid fence pass-through. Emits `<pre class="mermaid not-prose">` placeholders only —
   * call `runMermaid()` separately to render diagrams in the DOM. Defaults to false.
   */
  mermaid?: boolean;
};

// Memoised Shiki state — one init shared across all renderer instances.
type ShikiState = { highlighter: Highlighter; transformers: ShikiTransformer[] };
let highlighterReady: Promise<ShikiState> | undefined;

function getShiki(): Promise<ShikiState> {
  highlighterReady ??= initShiki();
  return highlighterReady;
}

async function initShiki(): Promise<ShikiState> {
  const [
    { createHighlighter },
    {
      transformerNotationDiff,
      transformerNotationFocus,
      transformerNotationErrorLevel,
      transformerNotationHighlight,
      transformerMetaHighlight,
    },
  ] = await Promise.all([import('shiki'), import('@shikijs/transformers')]);

  // Start with no languages — loaded on demand per source so init is fast.
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark-dimmed'],
    langs: [],
  });

  return {
    highlighter,
    transformers: [
      transformerNotationDiff(),
      transformerNotationFocus(),
      transformerNotationErrorLevel(),
      transformerNotationHighlight(),
      transformerMetaHighlight(),
    ],
  };
}

// Extracts language identifiers from fenced code blocks in a markdown source string.
function extractFenceLangs(source: string): string[] {
  const langs = new Set<string>();
  for (const match of source.matchAll(/^```(\w+)/gmu)) {
    if (match[1]) langs.add(match[1]);
  }
  return [...langs];
}

// Loads any languages from source that aren't already in the highlighter.
// Silently ignores unknown language identifiers so unsupported fences fall back to plain text.
async function ensureLangs(highlighter: Highlighter, source: string): Promise<void> {
  const langs = extractFenceLangs(source);
  if (langs.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loadLanguage accepts BundledLanguage strings; casting avoids importing the full union type
  await Promise.all(langs.map((lang) => (highlighter.loadLanguage as any)(lang).catch(() => {})));
}

// Plugin order mirrors plugin.ts markdownItSetup: tableWrapper → mermaid → containers → alerts → shiki.
function createBaseRenderer(options: MarkdownRendererOptions = {}): MarkdownIt {
  const md = new MarkdownIt({ html: false, linkify: true });
  md.use(mdTableWrapper);
  if (options.mermaid) md.use(mdMermaid);
  md.use(mdContainers);
  md.use(mdAlerts);
  return md;
}

/**
 * Async factory — returns a fully configured MarkdownIt instance matching the build-time pipeline.
 * Useful for SSR, tests, or non-Vue contexts. For Vue components prefer `useRenderedMarkdown`,
 * which starts rendering immediately without blocking on Shiki.
 */
export async function createMarkdownRenderer(
  options: MarkdownRendererOptions = {},
  source?: string,
): Promise<MarkdownIt> {
  const md = createBaseRenderer(options);
  if (options.shiki !== false) {
    const { highlighter, transformers } = await getShiki();
    if (source) await ensureLangs(highlighter, source);
    md.use(mdShiki, highlighter, transformers);
  }
  return md;
}

/**
 * Kicks off Shiki initialisation in the background without blocking. Call from any page visited
 * before repo detail pages so the highlighter is ready by the time `useRenderedMarkdown` needs it.
 */
export function warmMarkdownRenderer(): void {
  if (typeof window !== 'undefined') void getShiki();
}

/**
 * Vue composable — renders markdown source reactively using the same pipeline as the framework's
 * build-time markdown compiler. Starts with a basic renderer immediately and upgrades to
 * Shiki-highlighted output when the shared highlighter is ready.
 *
 * Languages are loaded on demand from the source — only fences actually present are loaded, and
 * they accumulate on the shared highlighter across navigations.
 *
 * @example
 *   ```ts
 *   const { html } = useRenderedMarkdown(() => props.readme ?? '');
 *   // <div v-html="html" />
 *   ```;
 */

export function useRenderedMarkdown(
  source: MaybeRefOrGetter<string>,
  options?: MarkdownRendererOptions,
): { html: Readonly<Ref<string>>; ready: Readonly<Ref<boolean>> } {
  const shikiEnabled = options?.shiki !== false && typeof window !== 'undefined';
  const renderer = shallowRef(createBaseRenderer(options));
  const html = computed(() => renderer.value.render(toValue(source)));
  // Start ready if Shiki is disabled or we're on the server — no upgrade will occur.
  const ready = ref(!shikiEnabled);

  // SSR guard — Shiki dynamic imports misbehave on the server. Repo pages are
  // client-rendered, but the guard protects any future SSR use of this composable.
  async function upgrade(): Promise<void> {
    try {
      renderer.value = await createMarkdownRenderer(options, toValue(source));
    } catch {
      // Keep the basic renderer if Shiki fails to load.
    } finally {
      ready.value = true;
    }
  }
  if (shikiEnabled) {
    void upgrade();
  }

  return { html: readonly(html), ready: readonly(ready) };
}

// Individual plugin exports — browser-safe, for consumers building custom pipelines.
// processSnippets is intentionally excluded: it uses node:fs and is build-time only.
export { mdAlerts } from './alerts.ts';
export { mdCodeGroup } from './codeGroup.ts'; // NOTE: emits Vue component markup — only valid in compiled templates, not v-html
export { mdContainers } from './containers.ts';
export { mdLinkRewriter } from './linkRewriter.ts';
export { mdLinkTitles } from './linkTitles.ts';
export { mdMermaid } from './mermaid.ts';
export { mdShiki } from './shiki.ts';
export { mdTableWrapper } from './tableWrapper.ts';
