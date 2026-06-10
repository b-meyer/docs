# TODO

- [ ] **Name the framework.** `@framework/core` is a placeholder. Pick a real
      scope/name and do a single find-and-replace across the workspace
      (`packages/core/package.json`, both apps' deps, imports, docs). Decide
      whether to publish to a registry or keep it `workspace:*`-only.
- [ ] **Social links** (GitHub/npm/X/etc.)
- [ ] **sidebar group collapsibility**
- [ ] **sidebar multi menu/generic addtional docs**
- [ ] **Shiki syntax highlighting + `::: code-group`.** The pipeline
      (`packages/core/src/plugin.ts`) has a seam for it — gate like mermaid so
      non-code consumers don't pay. Add dual light/dark via `--shiki-dark` and a
      `CodeGroup.vue` (reka-ui `Tabs*`) when a code-heavy consumer appears.
- [ ] **Snippet/region imports** (`<<<`); Shiki transformers (focus/diff/error).
