---
purpose: 'Documents the test layers, test runner, file placement conventions, and coverage posture for the project.'
scope: 'Testing only — toolchain commands in TOOLCHAIN, coding conventions in CONVENTIONS.'
audience: 'Contributors adding or running tests (primary); agents reasoning about test coverage (secondary).'
summary: 'Three test layers in packages/core/src/ using Vitest 4.x via vp: unit (pure logic), composable integration, and component (Vue SFCs via @vue/test-utils + jsdom); all test files colocated next to source; no e2e tests.'
---

# Testing

## Test layers

| Layer                  | Location                         | Runner                 | Status          |
| ---------------------- | -------------------------------- | ---------------------- | --------------- |
| Unit                   | `packages/core/src/**/*.test.ts` | Vitest (`vp run test`) | Active          |
| Composable integration | `packages/core/src/**/*.test.ts` | Vitest (`vp run test`) | Active          |
| Component              | `packages/core/src/**/*.test.ts` | Vitest (`vp run test`) | Active          |
| End-to-end             | —                                | —                      | Not implemented |

### Unit tests

Pure logic with no DOM requirement. Target exported functions in isolation — mock external I/O (`vi.mock('node:fs')`, `vi.stubGlobal`) where needed, but never mount Vue. Sit in the same directory as the module under test (e.g. `slugify.ts` → `slugify.test.ts`). The markdown pipeline, router helpers, build-time utilities, and runtime pure functions all belong here.

### Composable integration tests

Carry a `// @vitest-environment jsdom` docblock. Mount a minimal `defineComponent` via `@vue/test-utils` to exercise Vue's inject/provide contract and reactive side effects (DOM mutations, `localStorage`). Do not import `.vue` files. Sit next to the composable under test.

### Component tests

Carry a `// @vitest-environment jsdom` docblock. Use `@vue/test-utils` `mount` or `shallowMount` with the `mountWithConfig` helper (`src/test-utils/mountWithConfig.ts`), which provides `CONFIG_KEY` and a memory-history router. Prefer `mount` when RouterLink needs to render as `<a>`; use `shallowMount` to isolate the component under test from heavy children. Stub browser APIs that jsdom lacks (`IntersectionObserver`, `ResizeObserver`) with `vi.stubGlobal` in `beforeEach`. Sit next to the `.vue` file under test.

## Running tests

```sh
vp run test        # runs all tests workspace-wide (vp run -r test)
vp run core#test   # run only the framework package tests
```

Tests run via Vitest 4.x (bundled in `vite-plus/test`). The Vitest config lives in `packages/core/vite.config.ts` under the `test:` block (`pool: 'threads'`, `clearMocks: true`, `restoreMocks: true`).

## Test placement

All tests colocate next to their source file following the Vite+ convention — `useFoo.ts` + `useFoo.test.ts` in the same directory. The former `packages/core/tests/` directory has been removed.

Files that need a DOM environment carry a `// @vitest-environment jsdom` docblock at the top rather than relying on glob-based environment config.

## Test infrastructure

| File                                              | Purpose                                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/test-utils/mountWithConfig.ts` | Wraps `@vue/test-utils` `mount()` with `CONFIG_KEY` provided and a memory-history router installed. Used by all component tests. |
| `pnpm-workspace.yaml` catalog                     | `@vue/test-utils: ^2.4`                                                                                                          |
| `packages/core/package.json` devDeps              | `@vitejs/plugin-vue`, `@vue/test-utils`                                                                                          |

## Coverage posture

No formal coverage target is set. Areas still without test coverage:

- `src/ssg.ts` — virtual module wiring requires full Vite build context.
- `src/plugin.ts` — Vite plugin composition; not unit-testable.
- `src/components/AppHeader.vue` — complex orchestrator (ResizeObserver, Cmd+K, dialog); e2e candidate.
- `src/runtime/mermaid.ts` — MutationObserver + dynamic import; e2e only.
- `src/defineConfig.ts` — Vite config transformation; depends on Vite internals.
- `src/build.ts` — Node.js build script, not library code.
- `patchCspScriptHash` in `sitemap.ts` — crypto + multi-file orchestration.

## Per-PR obligations

| Layer                                  | Runs on PR                       | Blocks merge |
| -------------------------------------- | -------------------------------- | ------------ |
| Unit + composable + component (Vitest) | Yes — `pnpm exec vp run -r test` | Yes          |
| E2E                                    | Not yet wired                    | —            |

Local CI-parity command: `vp run test` reproduces exactly what the `Test` CI step runs. Run this before pushing to `release`.

## Determinism conventions

- **Time:** Tests touching `Date.now()`, `setTimeout`, or `setInterval` use
  `vi.useFakeTimers()` + `vi.setSystemTime(new Date('YYYY-MM-DD'))`. Restore with
  `vi.useRealTimers()` in `afterEach`. Never rely on the system clock in assertions.
- **Randomness:** Tests touching random values seed the RNG per-test so reruns are
  stable.
- **Ordering:** Assertions on unordered collections (Sets, object keys, unsorted
  arrays) sort the result before asserting to avoid insertion-order variance.
- **Mocking:** Mock at the module import seam where the project meets an external
  system (`vi.mock('@/services/foo')`, not inside the component under test). Assert
  on call arguments — not only return values — so the test catches wrong inputs, not
  just wrong outputs. Browser APIs that jsdom lacks (`IntersectionObserver`,
  `ResizeObserver`) are stubbed with `vi.stubGlobal` in `beforeEach`.

## Industry References

- [Vitest](https://vitest.dev) — test framework; runs as `vp run test`.
- [Vite+ guide](https://viteplus.dev/guide/) — how Vitest integrates with the `vp` toolchain.
- [@vue/test-utils](https://test-utils.vuejs.org) — Vue component mounting for jsdom tests.

_External URLs verified 2026-06-07._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp run test` command reference.
- [CONVENTIONS.md](CONVENTIONS.md) — coding conventions that apply to test files.
