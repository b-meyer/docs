// Barrel for the markdown-it plugins. Renderer-rule order (see `plugin.ts`):
// anchor → linkRewriter → tableWrapper → mermaid → shiki → codeGroup → containers → alerts.
// linkTitles is a core rule — it runs in the token phase before all renderer rules.
export { mdLinkRewriter } from './linkRewriter';
export { mdLinkTitles } from './linkTitles';
export { mdTableWrapper } from './tableWrapper';
export { mdMermaid } from './mermaid';
export { mdShiki } from './shiki';
export { mdCodeGroup } from './codeGroup';
export { mdContainers } from './containers';
export { mdAlerts } from './alerts';
