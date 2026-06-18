# Multi-tree Sidebar

This page demonstrates the multi-tree sidebar feature. The URL prefix `/guide/` activates a separate sidebar tree from the root `/` pages — open the left nav to see it switch.

## Configuration

Use a `Record<string, SidebarGroup[]>` instead of a flat array in your `vite.config.ts`:

```ts
sidebar: {
  '/': [
    { group: 'Main', items: [{ path: 'intro', title: 'Introduction' }] },
  ],
  '/guide/': [
    { group: 'Guide', items: [{ path: 'guide/getting-started', title: 'Getting Started' }] },
  ],
}
```

The active tree is resolved by **longest-prefix match** on the current route path.
