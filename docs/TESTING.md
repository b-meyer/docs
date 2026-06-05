---
purpose: 'Documents the test layers, test runner, file placement conventions, and coverage posture for the project.'
scope: 'Testing only — toolchain commands in TOOLCHAIN, coding conventions in CONVENTIONS.'
audience: 'Contributors adding or running tests (primary); agents reasoning about test coverage (secondary).'
summary: 'Single unit-test layer in packages/core/tests/ using Vitest; no integration or e2e tests; vp run test is the runner; test placement diverges from the viteplus co-locate convention and is tracked for alignment.'
---

# Testing

## Test layers

| Layer       | Location               | Runner                 | Status          |
| ----------- | ---------------------- | ---------------------- | --------------- |
| Unit        | `packages/core/tests/` | Vitest (`vp run test`) | Active          |
| Integration | —                      | —                      | Not implemented |
| End-to-end  | —                      | —                      | Not implemented |

**Unit tests** cover:

- `markdown.test.ts` — the markdown-it plugin transformations: link rewriting (`mdLinkRewriter`), mermaid fence rendering, callout containers, and GitHub-style alert blockquotes.
- `router.test.ts` — the route factory (`createRoutes`): route generation from a pages glob, `index.md` → root route, catch-all route, and validation errors for missing pages.

There are no component tests or composable tests currently.

## Running tests

```sh
vp run test        # runs all tests workspace-wide (vp run -r test)
vp run core#test   # run only the framework package tests
```

Tests run via Vitest (exposed through `vp`). The Vitest config lives in `packages/core/vite.config.ts`.

## Test placement note

The viteplus blueprint convention co-locates unit tests next to source files — e.g., `useFoo.ts` + `useFoo.test.ts` in the same directory. The current framework tests live in a separate `packages/core/tests/` directory. This is a divergence from the convention, tracked for future alignment in [STRUCTURE.md](STRUCTURE.md).

When adding new tests, prefer co-location (next to the source file being tested) to start moving toward the convention.

## Coverage posture

No formal coverage target is set. The test suite covers the markdown plugin transformations, which have the most non-obvious edge cases. Areas without test coverage:

- Vue components (`packages/core/src/components/`)
- Composables (`packages/core/src/composables/`)
- SSG entry (`packages/core/src/ssg.ts`)
- Sitemap and CSP patch utilities (`packages/core/src/sitemap.ts`)
- `mdTableWrapper` and `mdLinkRewriter` edge cases (path traversal, nested slugs)

## Per-PR obligations

| Layer         | Runs on PR                       | Blocks merge | Advisory |
| ------------- | -------------------------------- | ------------ | -------- |
| Unit (Vitest) | Yes — `pnpm exec vp run -r test` | Yes          | —        |
| Component     | Not yet wired                    | —            | —        |
| Browser-edge  | Not yet wired                    | —            | —        |

Local CI-parity command: `vp run test` reproduces exactly what the `Test` CI step runs (`pnpm exec vp run -r test`). Run this before pushing to `release`.

## Industry References

- [Vitest](https://vitest.dev) — test framework; runs as `vp run test`.
- [Vite+ guide](https://viteplus.dev/guide/) — how Vitest integrates with the `vp` toolchain.

_External URLs verified 2026-06-04._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp run test` command reference.
- [STRUCTURE.md](STRUCTURE.md) — test placement convention and divergence note.
- [CONVENTIONS.md](CONVENTIONS.md) — coding conventions that apply to test files.
