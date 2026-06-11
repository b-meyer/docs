// Barrel for the markdown-it plugins. Plugin *order* is load-bearing where these
// are wired (see `plugin.ts`): anchor → linkRewriter → tableWrapper → mermaid →
// shiki → codeGroup → containers → alerts.
export { mdLinkRewriter } from './linkRewriter';
export { mdTableWrapper } from './tableWrapper';
export { mdMermaid } from './mermaid';
export { mdShiki } from './shiki';
export { mdCodeGroup } from './codeGroup';
export { mdContainers } from './containers';
export { mdAlerts } from './alerts';
