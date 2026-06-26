import { readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const SNIPPET_RE = /^<<<[ \t]+(.+)$/gmu;

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.jsx': 'jsx',
  '.mjs': 'js',
  '.cjs': 'js',
  '.vue': 'vue',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.json': 'json',
  '.jsonc': 'jsonc',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'md',
  '.sh': 'sh',
  '.bash': 'bash',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
};

/**
 * Preprocesses raw markdown, replacing `<<< ./path/to/file` lines with fenced code blocks. Supports
 * optional `#region-name` suffix to extract a named region.
 *
 * HMR limitation: snippet source files are not watched in dev mode. Changes require a manual page
 * reload or saving the importing markdown file.
 */
export function processSnippets(code: string, id: string): string {
  return code.replace(SNIPPET_RE, (_, spec: string) => {
    const hashIdx = spec.lastIndexOf('#');
    const hasRegion = hashIdx > 0;
    const filePart = hasRegion ? spec.slice(0, hashIdx).trim() : spec.trim();
    const region = hasRegion ? spec.slice(hashIdx + 1).trim() : undefined;

    const absPath = resolve(dirname(id), filePart);
    let content: string;
    try {
      content = readFileSync(absPath, 'utf-8');
    } catch {
      return `\`\`\`\n// Snippet not found: ${filePart}\n\`\`\``;
    }

    if (region) content = extractRegion(content, region);

    const lang = EXT_TO_LANG[extname(filePart)] ?? '';
    return `\`\`\`${lang}\n${content.trimEnd()}\n\`\`\``;
  });
}

function extractRegion(code: string, region: string): string {
  const lines = code.split('\n');
  const startRe = new RegExp(`#region\\s+${region}\\b`, 'u');
  const endRe = new RegExp(`#endregion\\s+${region}\\b`, 'u');
  const startIdx = lines.findIndex((l) => startRe.test(l));
  if (startIdx === -1) return code;
  const endIdx = lines.findIndex((l, i) => i > startIdx && endRe.test(l));
  return lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx).join('\n');
}
