---
purpose: 'Documents the Azure SWA hosting model, route config contract, operating limitations, and local dev setup.'
scope: 'Runtime hosting and local dev only — provisioning in PROVISION, CI/CD in PIPELINE. No Functions runtime in scope (project has no Azure Functions).'
audience: 'Contributors debugging routing or hydration issues (primary); maintainers evaluating hosting trade-offs (secondary).'
summary: 'Azure SWA delivers pre-rendered HTML from CDN edge; Vue hydrates as SPA on client; route config in staticwebapp.config.json; SWA preview slots are not in use; local dev via vp run dev:* requires no SWA CLI.'
---

# Runtime

## Azure SWA hosting model

Each app is served as a fully static site from Azure Static Web Apps:

1. **Build time** — `framework-ssg` pre-renders every route to a static HTML file (`apps/<app>/dist/`). One HTML file per URL path.
2. **CDN edge delivery** — SWA distributes the static files globally. No server process runs at request time.
3. **SPA hydration** — the browser receives pre-rendered HTML (immediately readable by search engines and screen readers), then Vue hydrates the page into a SPA for client-side navigation.

There is no server-side rendering at request time. Every `dist/` file is a complete, standalone HTML page.

## Health checks

No health endpoint. Azure SWA serves pre-built static files from CDN — liveness is
CDN availability, not a probed application route. No explicit health check is wired
or needed.

## Shutdown

No shutdown contract. The site has no server process; SWA serves static files without
drain semantics. There is nothing to drain or signal on shutdown.

## Route config (`staticwebapp.config.json`)

Each app's `public/staticwebapp.config.json` is uploaded with the build artifact and governs SWA's routing:

- **`navigationFallback`** — rewrites unknown routes to `/index.html` (with asset exclusions). This enables the Vue router to handle SPA client-side navigation after first load.
- **`globalHeaders`** — delivers `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` on all responses.

The `public/` source config is committed to the repo and environment-agnostic. At build time, `patchCspScriptHash` (in `packages/core/src/sitemap.ts`) rewrites the `dist/` copy, replacing `'unsafe-inline'` in `script-src` with per-build SHA-256 hashes. The deployed config therefore differs from the committed source. See [SECURITY.md](SECURITY.md) for the CSP posture.

> **Note:** `routes[]` rules are not applied on requests that match `navigationFallback`. Headers or access-control rules set in `routes[]` will not fire for SPA client-side navigation URLs served via the fallback.

## Operating limitations

**SWA free-tier limits** — 250 MB storage per environment (500 MB total across all environments), 100 GB bandwidth/month. Current build artifacts are well under these limits; mermaid-enabled builds are larger but still within bounds.

**Preview slots** — SWA staging environments are not in use. This is a non-goal per [ARCHITECTURE.md](ARCHITECTURE.md). If added, SWA preview slots for static-only sites are independent deploys, not routing splits.

## Local dev

Local development does **not** require the SWA CLI. The project is a pure static site with no edge auth, managed Functions, or custom auth providers — a plain Vite dev server is sufficient:

```sh
vp run dev:tcm      # dev server at localhost with HMR
vp run dev:8fold    # same for 8fold
```

The SWA CLI is only needed when testing SWA-specific features locally (edge auth, custom header preview). Neither app uses those features.

## Industry References

- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/) — hosting model and CDN delivery.
- [Azure Static Web Apps — Configuration](https://learn.microsoft.com/azure/static-web-apps/configuration) — `staticwebapp.config.json` route and header contract.
- framework-ssg — custom two-pass SSG CLI in `packages/core/src/build.ts`; wraps Vite's `build()` API directly.

_External URLs verified 2026-06-04._

## Cross-references

- [ARCHITECTURE.md](ARCHITECTURE.md) — SPA hydration rationale and SSG entry constraints.
- [PROVISION.md](PROVISION.md) — how SWA resources are created and configured.
- [PIPELINE.md](PIPELINE.md) — CI workflow that builds and uploads the artifact.
- [SECURITY.md](SECURITY.md) — CSP headers in `staticwebapp.config.json`.
