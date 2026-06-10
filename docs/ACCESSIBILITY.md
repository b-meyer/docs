---
purpose: 'Documents the accessibility posture of the doc-site view layer against the POUR principles.'
scope: 'Front-end accessibility for the framework view layer only — Reka UI primitive contracts, SPA routing focus management. Infrastructure and content authoring guidelines are out of scope.'
audience: 'Contributors building or modifying view-layer components (primary); agents auditing accessibility compliance (secondary).'
summary: 'POUR coverage: heading hierarchy and SVG alt text (Perceivable); keyboard nav, skip link, SPA focus management (Operable); prose clarity and consistent navigation (Understandable); Reka UI ARIA roles and pre-rendered HTML (Robust).'
---

# Accessibility

The framework targets **WCAG 2.2 Level AA** for the doc-site view layer. The target binds all public-facing routes rendered by `packages/core/`; framework-internal scaffolding and admin tooling are out of scope. Coverage is organized by POUR principle.

## Perceivable

**Heading hierarchy** — every page must have exactly one `<h1>` (the markdown title). Section headings follow `h2 → h3` order without skipping levels. The outline panel (`PageNav`) reflects heading structure, so hierarchy breaks degrade the outline as well.

**Page title (SC 2.4.2)** — `createApp` installs a global `titleTemplate` (e.g., `Page title — Site name`) so every route produces a distinct `<title>` even when frontmatter omits a `title` field. Consumers must set a meaningful `title` in `FrameworkConfig`. The `<html lang>` attribute on each app's `index.html` must also carry the correct language tag (SC 3.1.1) — this is a consumer responsibility.

**SVG and icon alt text** — `AppHeader` uses Heroicons via Reka UI. Every interactive icon must have an `aria-label` or a paired visible label. Decorative SVGs use `aria-hidden="true"`.

**Color contrast** — brand hue/intensity tokens (`--brand-hue`, `--brand-intensity`) drive a generated color scale. Contrast ratios must be verified when the consumer overrides the default hue in `main.css`. The framework provides accessible defaults; consumer overrides can break them.

## Operable

**Keyboard navigation** — the sidebar nav, prev/next controls, and theme toggle must be reachable and operable via keyboard alone. Reka UI primitives (used in `AppHeader`) provide keyboard interaction out of the box; do not unwrap them into bare HTML elements.

**Skip link** — a "Skip to content" link is required before the sidebar nav so keyboard users can bypass repeated navigation. It should be visible on focus; it may be visually hidden when not focused.

**SPA routing focus management** — on every client-side route change, focus must move to the main content region or the page `<h1>`. Without this, screen reader users receive no announcement that navigation occurred.

## Understandable

**Prose structure** — markdown pages use clear headings and avoid ambiguous link text (no bare "click here"). The link rewriter resolves `[Display](Other.md)` cross-links; display text must be descriptive.

**Consistent navigation** — sidebar grouping and ordering follow each app's `vite.config.ts`. Consumers should not reorder groups in ways that break spatial memory for returning users.

## Robust

**Reka UI ARIA roles** — `AppHeader` wraps Reka UI primitives that ship with appropriate ARIA roles and keyboard interaction. Unwrapping Reka UI components into bare HTML elements removes the accessibility contract.

**Pre-rendered HTML** — framework-ssg pre-renders every route to static HTML. Screen readers receive meaningful content before JavaScript hydrates. No content should be gated behind a JavaScript `onMounted` that has no server-side equivalent.

## Known Gaps

No open WCAG 2.2 Level AA conformance gaps identified. Accepted risk: consumer CSS overrides to brand tokens (`--color-*`, `--brand-hue`, `--brand-intensity`) can break contrast ratios — the framework ships accessible defaults but has no mechanism to enforce consumer overrides. Re-open trigger: any new interactive component added to `AppHeader` or the sidebar nav.

## Testing

| Surface                                  | Status                        | Trigger to activate                       |
| ---------------------------------------- | ----------------------------- | ----------------------------------------- |
| Automated scanner (axe, Lighthouse)      | Not yet wired                 | Component test rig adopted                |
| Keyboard-only walkthrough                | Manual, per release candidate | —                                         |
| Screen-reader coverage (NVDA, VoiceOver) | Not yet established           | Public launch with external consumer base |

Manual keyboard-only walkthrough covers: `AppHeader` controls, sidebar nav, prev/next pagination, search, theme toggle. Deferred automation tracked in `TODO.md`.

## Triage

| Level    | Criteria                                                              | Response                      |
| -------- | --------------------------------------------------------------------- | ----------------------------- |
| Critical | Blocks primary content flow for a screen-reader or keyboard-only user | Patch before next deploy      |
| High     | Degrades experience on any conformance-target flow                    | Address in next release cycle |
| Low      | Best-practice gap not blocking navigation or content access           | Schedule opportunistically    |

## Industry References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — normative accessibility standard; Level AA is the target.
- [Reka UI](https://reka-ui.com) — accessibility contracts for the primitives used in `AppHeader`.
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) — patterns for focus management and widget roles.

_External URLs verified 2026-06-04._

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — SPA hydration model and `LayoutResolver` dispatch.
- [CONVENTIONS.md](CONVENTIONS.md) — `App*` prefix and Reka UI component wrapping rules.
- [STRUCTURE.md](STRUCTURE.md) — where view-layer components live (`packages/core/src/components/`).
