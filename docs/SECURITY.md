---
purpose: "Documents the project's security posture: CSP configuration, content trust boundary, dependency management, and the no-auth-surface rationale."
scope: 'Security posture and known constraints only — CSP header config lives in staticwebapp.config.json; dependency details in DEPENDENCIES; no application auth surface exists.'
audience: 'Maintainers auditing the security posture (primary); contributors modifying CSP or dependency config (secondary).'
summary: 'CSP script-src unsafe-inline is replaced with a SHA-256 hash at build time; style-src unsafe-inline remains for Mermaid in apps/tcm; raw HTML disabled in the markdown pipeline (html: false); static content with no user-input surface; pnpm catalog for dependency graph control; no auth surface.'
---

# Security

## Content Security Policy

The `Content-Security-Policy` header in `apps/*/public/staticwebapp.config.json` permits `'unsafe-inline'` for both `script-src` and `style-src`:

```
script-src 'self' 'unsafe-inline';
style-src  'self' 'unsafe-inline';
```

**`script-src`:** The theme bootstrap `<script>` in each app's `index.html` runs inline before Vue boots to prevent a flash of wrong theme on paint. A SHA-256 hash of this script is computed at build time — `patchCspScriptHash` (called directly by the framework-ssg build script (`packages/core/src/build.ts`) after the render loop completes) reads the built `index.html`, computes the hash, and rewrites `'unsafe-inline'` to `'sha256-...'` in `dist/staticwebapp.config.json`. The source `public/staticwebapp.config.json` retains `'unsafe-inline'` as a build-time placeholder; only the deployed artifact carries the hash.

**`style-src` (`apps/tcm` only):** Mermaid (enabled in `apps/tcm`) injects inline styles at runtime for diagram rendering. Mermaid does not support CSP nonces for its inline style injection, so `'unsafe-inline'` remains for `apps/tcm`. `apps/8fold` disables Mermaid and does not carry `'unsafe-inline'` in `style-src`.

**Known constraint:** The Mermaid `style-src 'unsafe-inline'` in `apps/tcm` is the remaining gap. The correct mitigation (upstream Mermaid CSP support for style nonces) is deferred.

## Content trust boundary

The site serves static markdown bundled at build time. There is no:

- User-input surface (no forms, no comment system, no dynamic external API content)
- Server-side template rendering at request time
- Stored or transmitted user data

Content integrity is maintained by the build process. The markdown pipeline runs with `html: false` (raw HTML in `.md` source is rejected), preventing executable inline handlers from being introduced via content changes. Mermaid diagrams use fenced code blocks (` ```mermaid `), not raw HTML, so they are unaffected. Mermaid is bundled at build time, not fetched from a CDN at runtime.

## Dependency graph posture

- **pnpm catalog** pins all dependencies to explicit versions in `pnpm-workspace.yaml`. Dependency drift is controlled: no unintended minor/patch upgrades across packages.
- **Automated dep scanning** — Dependabot is configured via `.github/dependabot.yml` (weekly `npm` schedule, targeting `main`) to flag CVEs.

See [DEPENDENCIES.md](DEPENDENCIES.md) for the full dependency list and intentional pin rationale.

## No auth surface

This is a static content site with no identity surface:

- No user authentication or authorization
- No session tokens or cookies set by the application
- No personal data collected or stored

Azure SWA's built-in auth providers are not configured.

## Threat model

| Boundary                | Asset                 | Adversary → Threat                         | Mitigation                                                                                                                       | Owner            |
| ----------------------- | --------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Static-content delivery | HTML/JS/CSS bundle    | XSS via `unsafe-inline` (CSP bypass)       | `unsafe-inline` scoped to theme script + mermaid; hash replacement at build for `script-src`; `style-src` gap tracked in TODO.md | Project          |
| Supply-chain            | Third-party packages  | Compromised dep / malicious install script | pnpm catalog pins all versions; `pnpm audit --audit-level=high` in CI; `allowBuilds` allowlist in `pnpm-workspace.yaml`          | Project + vendor |
| Build-time content      | Markdown source pages | Malicious content injection via raw HTML   | `html: false` in markdown pipeline rejects raw HTML; pages are developer-authored only; no user-submitted content surface        | Project          |

## Vulnerability disclosure

Report vulnerabilities via **GitHub private security advisory**: in the repo, go to Security → Advisories → New draft advisory. Do not file a public issue for security vulnerabilities.

Include in the report: affected file(s) or behavior, steps to reproduce, and assessed impact. Acknowledgment cadence: best-effort within 5 business days.

## Severity

Baseline: CVSS 3.1. Tie-breaker for this static site: consumer-reach (how many downstream readers are affected) and content-availability impact.

| Level    | CVSS range | Response                      |
| -------- | ---------- | ----------------------------- |
| Critical | 9.0–10.0   | Patch immediately             |
| High     | 7.0–8.9    | Patch before next release     |
| Medium   | 4.0–6.9    | Address in next release cycle |
| Low      | 0.1–3.9    | Schedule opportunistically    |

## Supported versions

Only the current `release` branch receives security patches; no versioned releases exist.

## Secrets inventory

| Credential                          | Storage                      | Rotation cadence                                | Runbook                      |
| ----------------------------------- | ---------------------------- | ----------------------------------------------- | ---------------------------- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_*` | GitHub Actions repo secret   | Event-driven (on compromise or operator change) | [PROVISION.md](PROVISION.md) |
| `PUBLIC_SITE_URL`                   | GitHub Actions repo variable | Non-secret (a URL) — no rotation required       | —                            |

Secrets must never be committed to the repository. Enforcement: GitHub push protection and standard `.gitignore` patterns on secret-file shapes.

## Industry References

- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) — CSP directive reference.
- [Mermaid — CSP](https://mermaid.js.org/config/usage.html#requirements) — Mermaid's known inline-style CSP limitation.
- [Azure Static Web Apps — Configuration](https://learn.microsoft.com/azure/static-web-apps/configuration) — header injection via `staticwebapp.config.json`.

_External URLs verified 2026-06-04._

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — `'unsafe-inline'` documented as a deliberate non-goal.
- [DEPENDENCIES.md](DEPENDENCIES.md) — dependency catalog and version pin rationale.
- [PROVISION.md](PROVISION.md) — where `staticwebapp.config.json` is deployed.
- [RUNTIME.md](RUNTIME.md) — SWA route config and header delivery.
