---
purpose: 'Maps the docs-workspace documentation tree, inventories all applicable Branch topics with status, and records opted-out canon topics with rationale.'
scope: 'Doc-tree topology and Branch inventory only — per-topic content lives in the named Branch files. Workspace layout in STRUCTURE, architecture in ARCHITECTURE.'
audience: 'Agents bootstrapping the project (primary); contributors adding documentation (secondary); maintainers auditing doc coverage (tertiary).'
summary: 'Describes the Roots / Trunk / Branches tree shape, inventories all 17 applicable canon Branches (all authored), and enumerates the 12 opted-out topics with one-line rationale.'
---

# Documentation

This project's docs follow the **Roots / Trunk / Branches** tree shape:

- **Trunk** — `README.md` (humans-first quickstart) + `CLAUDE.md` (agents-first operating rules).
- **Roots** — subtree files for packages and apps whose conventions diverge (`apps/tcm/CLAUDE.md`, `apps/8fold/CLAUDE.md`, `packages/core/README.md`). Each Root opens with `Layered on root CLAUDE.md + docs/`.
- **Branches** — topical `docs/<TOPIC>.md` files. Every applicable canon topic either has a Branch or appears in the opted-out table below.

## Branch inventory

| Branch                                   | Topic                                                     | Status         |
| ---------------------------------------- | --------------------------------------------------------- | -------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)       | Framework design + Azure deployment topology              | ✅             |
| [CONVENTIONS.md](CONVENTIONS.md)         | Naming, import, CSS, and lint conventions                 | ✅             |
| [DOCUMENTATION.md](DOCUMENTATION.md)     | Doc tree map + opted-out topics                           | ✅ (this file) |
| [STRUCTURE.md](STRUCTURE.md)             | Workspace topology + import model + file placement        | ✅             |
| [TOOLCHAIN.md](TOOLCHAIN.md)             | `vp` commands + entry-point contract + pre-push gate      | ✅             |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Project-specific failure modes                            | ✅             |
| [ACCESSIBILITY.md](ACCESSIBILITY.md)     | POUR surface coverage for the doc-site view layer         | ✅             |
| [AI.md](AI.md)                           | AI-assisted authoring posture + agent contribution policy | ✅             |
| [CONTRIBUTING.md](CONTRIBUTING.md)       | Onboarding, branch/PR conventions, pre-PR gate            | ✅             |
| [DEPENDENCIES.md](DEPENDENCIES.md)       | pnpm catalog + stack rationale + update policy            | ✅             |
| [DICTIONARY.md](DICTIONARY.md)           | Project-specific terminology and deprecated synonyms      | ✅             |
| [PIPELINE.md](PIPELINE.md)               | GitHub Actions → Azure SWA deploy workflow                | ✅             |
| [PROVISION.md](PROVISION.md)             | Azure SWA resource provisioning + token setup             | ✅             |
| [RUNTIME.md](RUNTIME.md)                 | Azure SWA hosting model + CDN + SSR-at-build vs hydration | ✅             |
| [SECURITY.md](SECURITY.md)               | Dependency graph posture + CSP + content trust boundary   | ✅             |
| [SUPPORT.md](SUPPORT.md)                 | Issue tracker + contact + escalation path                 | ✅             |
| [TESTING.md](TESTING.md)                 | Test layers + runner setup + coverage posture             | ✅             |

## Opted-out canon entries

| Topic           | Reason                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| API             | Library surface documented at `packages/core/README.md`. No external versioning contract yet.          |
| AUTHENTICATION  | No identity surface — static site with no user authentication.                                         |
| AUTHORIZATION   | No permission model — no roles, scopes, or per-resource access checks.                                 |
| BLUEPRINTS      | `dev-*` family not in use — no `dev-app` / `dev-feature` / `dev-fix` invocations against this project. |
| BOARDS          | Work tracked in `TODO.md` — no in-repo `boards/` tree.                                                 |
| CODE_OF_CONDUCT | No external contributor surface — internal project with no public PR path.                             |
| DATA            | No persistent data — stateless static site.                                                            |
| ENV             | Single build-time env var (`PUBLIC_SITE_URL` for sitemap) — documented in `docs/PIPELINE.md`.          |
| OBSERVABILITY   | Static site — no long-lived process, no signal-emitting runtime surface.                               |
| PERFORMANCE     | No published performance targets — bundle sizes tracked informally; no benchmark suite.                |
| PRIVACY         | No personal data — static content site with no analytics or PII collection.                            |
| VALIDATION      | No untrusted-input surface — content is developer-authored markdown, not user input.                   |

## Industry References

- [Diátaxis](https://diataxis.fr) — documentation framework informing audience-focus and clarity principles; the structural taxonomy is the project's own Roots / Trunk / Branches model.
- [Google developer documentation style guide](https://developers.google.com/style) — style, tone, and formatting conventions.

_External URLs verified 2026-06-04._

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — framework design and hosting topology.
- [STRUCTURE.md](STRUCTURE.md) — workspace layout; where files live.
- [CLAUDE.md](../CLAUDE.md) — Trunk agents-first file; project rules and `## Links` catalog.
