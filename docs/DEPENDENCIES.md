---
purpose: 'Documents the dependency catalog model, top-of-graph pinned dependencies with rationale, and the update policy.'
scope: 'Dependency management only — toolchain commands in TOOLCHAIN, coding conventions enforced by dependencies in CONVENTIONS.'
audience: 'Contributors bumping or auditing dependencies (primary); agents reasoning about version constraints (secondary).'
summary: 'pnpm catalog in pnpm-workspace.yaml is the single version source; top-of-graph deps listed with rationale; vue-router ~5.0.7 pin is intentional (in-dev v5); update policy: catalog bump → vp install → vp check.'
---

# Dependencies

## Catalog model

All dependency versions are declared once in the `catalog:` block of `pnpm-workspace.yaml`. Individual `package.json` files reference `catalog:` rather than pinning versions directly:

- Bumping a version in `pnpm-workspace.yaml` applies it workspace-wide.
- `package.json` files show `"vue": "catalog:"`, not `"vue": "^3.5.32"`.
- Catalog mode is `prefer` — direct version specs in `package.json` are accepted but discouraged.

**Never edit individual `package.json` version specs directly.** The catalog is authoritative.

## Dependency inventory

| Layer              | Package                | Purpose                  | Rationale                                                                                    |
| ------------------ | ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| Host               | Node ≥ 22              | JavaScript runtime       | Azure SWA Free tier + `vp` engine requirement                                                |
| Host               | Azure SWA Free         | Static hosting + CDN     | Zero-cost tier; route config via `staticwebapp.config.json`                                  |
| Runtime (consumer) | `vue` `^3.5.32`        | SPA framework            | Composition API + `<script setup>` SFC model                                                 |
| Runtime (consumer) | `vue-router` `~5.0.7`  | SPA routing              | In-development next major aligned with Vite+; `~` pin is **intentional** — do not bump to v4 |
| Runtime (consumer) | `reka-ui` `^2.9.0`     | Accessible UI primitives | Unstyled headless components for `AppHeader`                                                 |
| Runtime (consumer) | `mermaid` `^11.15.0`   | Diagram rendering        | Build-time tree-shaken when `markdown.mermaid: false`                                        |
| Build-only         | `vite-plus` `0.1.24`   | Toolchain CLI            | Exact pin; `vp` API surface in active development                                            |
| Build-only         | `typescript` `~6.0.2`  | Type-checking            | Patch-range pin; TypeScript 6 in active development                                          |
| Build-only         | `tailwindcss` `^4.2.2` | CSS utilities            | CSS-first `@theme` model; v3 APIs absent by design                                           |
| Build-only         | `@tailwindcss/vite`    | Tailwind Vite plugin     | Required for Tailwind 4 integration                                                          |
| Test               | `vitest`               | Unit test runner         | Integrated with `vp run test`                                                                |

**`vue-router ~5.0.7` is intentional.** This tracks an in-development v5 aligned with the Vite+ ecosystem. Do not "upgrade" to vue-router v4 — the APIs differ. The `~` pin allows patch bumps but blocks minor jumps to an incompatible version.

## Update policy

1. Identify the target version in `pnpm-workspace.yaml` catalog.
2. Run `vp install`.
3. Run `vp check` to catch type or lint regressions.
4. Run `vp run ready` to confirm all apps build.

For major version bumps (`vue-router`, `vite-plus`), review the upstream CHANGELOG for breaking changes before bumping.

**Dep scanning:** CI runs `pnpm audit --audit-level=high` on every push to `release`. Run it locally after any dependency bump to catch CVEs before pushing.

**SBOM:** The CI workflow generates a CycloneDX SBOM (`pnpm sbom --sbom-format cyclonedx > sbom.json`) and uploads it as a `sbom` GitHub Actions artifact on every deploy.

## License posture

- **Allowed:** MIT, Apache-2.0, BSD-family, ISC.
- **Rejected:** GPL, AGPL, LGPL, SSPL, BUSL, and other copyleft or source-available families.
- **Audit cadence:** `pnpm licenses list` run manually before each release; no automated license scanner wired (trigger: a copyleft dep discovered in PR review).
- **Enforcement:** PR review.

## Lockfile

`pnpm-lock.yaml` is committed to the repository. CI restores via
`pnpm install --frozen-lockfile`. Manual lockfile edits and out-of-band
`pnpm install` (without `--frozen-lockfile`) are defects — they regenerate the
lockfile silently and diverge from the manifest. Always use `vp install` locally;
CI always uses `pnpm install --frozen-lockfile`.

## Vendoring

None. No third-party code is vendored. Trigger to revisit: an upstream dep becomes
unmaintained but functional, or supply-chain risk outweighs the cost of an external
dep. If vendored, the artifact must carry upstream attribution (`LICENSE` + `NOTICE`)
and a re-vendor procedure.

## Industry References

- [pnpm Catalogs](https://pnpm.io/catalogs) — catalog mechanics and `catalogMode` (`prefer` allows fallback to direct specs; `strict` rejects any dep outside the catalog).
- [vue-router v5](https://github.com/vuejs/router) — v5 stable release and migration notes.

_External URLs verified 2026-06-04._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp install` and dependency management commands.
- [CONVENTIONS.md](CONVENTIONS.md) — `vue-router ~5.0.7` intentional-pin rule and catalog convention.
