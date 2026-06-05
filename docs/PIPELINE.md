---
purpose: 'Documents the GitHub Actions CI/CD pipeline that builds and deploys the TCM app to Azure Static Web Apps.'
scope: 'Pipeline stages and deployment only — Azure resource setup in PROVISION, runtime hosting model in RUNTIME, toolchain commands in TOOLCHAIN.'
audience: 'Contributors debugging CI failures (primary); maintainers modifying the pipeline (secondary); agents reasoning about the deploy contract (tertiary).'
summary: 'Push to `release` triggers check → test → build → SWA deploy for apps/tcm; deployment token in AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_RIVER_0E1FD7A10; PUBLIC_SITE_URL sets sitemap base URL; 8fold deploy gap tracked in TODO.md.'
---

# Pipeline

## Workflow

File: `.github/workflows/azure-static-web-apps.yml`

**Trigger:** push to the `release` branch. The `main` branch does not trigger a deploy; `release` is the CI/deploy branch only.

## Stages

| Stage            | Command                                                 | Purpose                                                                |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Install          | `pnpm install --frozen-lockfile`                        | Reproducible install; `--frozen-lockfile` not exposed via `vp install` |
| Check            | `pnpm exec vp check`                                    | Format + lint + type-check (whole workspace, root `vite.config.ts`)    |
| Test             | `pnpm exec vp run -r test`                              | Unit tests (`packages/core/tests/`)                                    |
| Dependency audit | `pnpm audit --audit-level=high`                         | Blocks on high-severity CVEs before building                           |
| Build            | `pnpm exec vp run tcm#build`                            | vite-ssg build → static HTML per route + `sitemap.xml`                 |
| Generate SBOM    | `pnpm sbom --sbom-format cyclonedx > sbom.json`         | Produces CycloneDX SBOM of the workspace                               |
| Upload SBOM      | `actions/upload-artifact` pinned SHA (artifact: `sbom`) | Retains SBOM for 90 days                                               |
| Deploy           | `Azure/static-web-apps-deploy`                          | Upload `apps/tcm/dist` to Azure SWA                                    |

**Why `pnpm exec vp …` not bare `vp`:** CI does not have `vp` in PATH globally; `pnpm exec` resolves it from `node_modules/.bin`.

**Why `vp run tcm#build` not `vp build`:** `vp build` runs Vite+'s SPA build path, bypassing `vite-ssg`. Only the per-app task invokes `vite-ssg build` and produces static HTML. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Deployment

**Action:** `Azure/static-web-apps-deploy` pinned to a commit SHA (v1).

**Token secret:** `AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_RIVER_0E1FD7A10` — stored as a GitHub Actions repo secret. See [PROVISION.md](PROVISION.md) for rotation procedure. Note: `Azure/static-web-apps-deploy` authenticates via deployment token only — no native OIDC flow exists for this action. An OIDC path would require switching to a different deployment mechanism (e.g., SWA CLI with `azure/login` federated identity).

**Upload mode:** `skip_app_build: true` with `app_location: 'apps/tcm/dist'` and `output_location: ''`. This uploads the pre-built artifact directly, bypassing the SWA builder. Without this, the action attempts to build from source and either fails or uploads `node_modules` (exceeding the SWA Free 250 MB limit). Note: the build task must output `staticwebapp.config.json` to `apps/tcm/dist` before the deploy step; Microsoft requires the file at the `output_location` root when `skip_app_build: true`.

## Environment variables

| Variable          | Where set             | Purpose                                                                |
| ----------------- | --------------------- | ---------------------------------------------------------------------- |
| `PUBLIC_SITE_URL` | GitHub Actions secret | Base URL injected into `sitemap.xml`; required for sitemap correctness |

## 8fold deploy gap

`apps/8fold` has no CI deploy. Deploying 8fold requires:

1. Provision a separate Azure SWA resource (see [PROVISION.md](PROVISION.md)).
2. Add a `AZURE_STATIC_WEB_APPS_API_TOKEN_<resource>` secret to the repo.
3. Add an `8fold#build` + deploy step to the workflow (or a separate workflow file).

Tracked in `TODO.md`.

## Rollback

To revert a deploy, re-push a prior commit to `release` — CI will rebuild and redeploy. To restore a prior build without a re-deploy, use the Azure Portal: **SWA resource → Environments → select the environment → select a prior deployment → Activate**.

## Artifact retention

| Artifact                       | Location                         | Retention                                             | Regenerable                              |
| ------------------------------ | -------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| Static HTML + config + sitemap | Azure SWA deployment             | SWA revision history (last N deploys per environment) | Yes — re-run `vp run tcm#build` + deploy |
| SBOM JSON (`sbom.json`)        | GitHub Actions artifact (`sbom`) | 90-day GitHub default                                 | Yes — re-run CI                          |
| CI logs                        | GitHub Actions                   | 90-day GitHub default                                 | N/A                                      |

## Industry References

- [Azure Static Web Apps — Skip build](https://learn.microsoft.com/azure/static-web-apps/build-configuration#skip-building-front-end-app) — `skip_app_build` rationale and `output_location` contract.
- [GitHub Actions](https://docs.github.com/en/actions) — workflow syntax reference.

_External URLs verified 2026-06-04._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp check` and `vp run ready` command reference.
- [PROVISION.md](PROVISION.md) — Azure SWA resource setup and token rotation.
- [RUNTIME.md](RUNTIME.md) — Azure SWA hosting model and route contract.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — `vp build` vs `vp run build` failure mode.
