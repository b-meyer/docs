---
purpose: 'Documents the GitHub Actions CI/CD pipelines that build and deploy TCM and 8fold to Azure Static Web Apps.'
scope: 'Pipeline stages and deployment only — Azure resource setup in PROVISION, runtime hosting model in RUNTIME, toolchain commands in TOOLCHAIN.'
audience: 'Contributors debugging CI failures (primary); maintainers modifying the pipeline (secondary); agents reasoning about the deploy contract (tertiary).'
summary: 'Two manual workflow_dispatch pipelines — deploy-tcm.yml and deploy-8fold.yml — each running check → test → audit → build → SBOM → SWA deploy. TCM token in AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_RIVER_0E1FD7A10; 8fold token in AZURE_STATIC_WEB_APPS_API_TOKEN_8FOLD (set after provisioning). PUBLIC_SITE_URL sets sitemap base URL.'
---

# Pipeline

## Workflows

| File | App | Trigger |
| --- | --- | --- |
| `.github/workflows/deploy-tcm.yml` | `apps/tcm` | Manual (`workflow_dispatch`) |
| `.github/workflows/deploy-8fold.yml` | `apps/8fold` | Manual (`workflow_dispatch`) |

Both workflows are triggered manually from the GitHub Actions UI (Actions tab → select workflow → Run workflow). There is no automatic trigger on push.

## Stages

Both pipelines run the same stages in order:

| Stage            | Command                                                 | Purpose                                                                                                      |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Install          | `pnpm install --frozen-lockfile`                        | Reproducible install; `--frozen-lockfile` not exposed via `vp install`                                       |
| Check            | `pnpm exec vp check`                                    | Format + lint + type-check (whole workspace, root `vite.config.ts`)                                          |
| Test             | `pnpm exec vp run -r test`                              | Unit tests colocated in `packages/core/src/`                                                                 |
| Dependency audit | `pnpm audit --audit-level=high`                         | Blocks on high-severity CVEs before building                                                                 |
| Build            | `pnpm exec vp run -t <app>#build`                       | packs `@framework/core` first (transitive), then framework-ssg build → static HTML per route + `sitemap.xml` |
| Generate SBOM    | `pnpm sbom --sbom-format cyclonedx > sbom.json`         | Produces CycloneDX SBOM of the workspace                                                                     |
| Upload SBOM      | `actions/upload-artifact` pinned SHA (artifact: `sbom`) | Retains SBOM for 90 days                                                                                     |
| Deploy           | `Azure/static-web-apps-deploy`                          | Upload `apps/<app>/dist` to Azure SWA                                                                        |

**Why `pnpm exec vp …` not bare `vp`:** CI does not have `vp` in PATH globally; `pnpm exec` resolves it from `node_modules/.bin`.

**Why `vp run -t <app>#build` not `vp build`:** `vp build` runs Vite's SPA build path, bypassing `framework-ssg`. Only the per-app task invokes `framework-ssg` and produces static HTML. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

**Why `-t` (transitive):** `@framework/core` ships a compiled bin (`dist/build.mjs`) produced by `vp pack`. That file is not committed — it must be built before the app build runs. `-t` walks workspace `package.json` dependencies and runs each package's `build` task in order, so `@framework/core#build` (vp pack) runs before the app build automatically on every fresh CI run.

## Gates

Each stage is a blocking gate — a failure exits the workflow and downstream stages do not run.

| Stage            | Blocks on                                                            | On failure                           |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------ |
| Install          | `pnpm install --frozen-lockfile` failure (lockfile drift or network) | Workflow exits; nothing runs         |
| Check            | Format, lint, or type-check error                                    | Workflow exits; nothing deploys      |
| Test             | Any failing unit / composable / component test                       | Workflow exits                       |
| Dependency audit | High-severity CVE (`--audit-level=high`)                             | Workflow exits before build          |
| Build            | Build error for the target app                                       | Workflow exits; no artifact produced |
| Deploy           | SWA deploy action failure                                            | Prior SWA revision stays live        |

No advisory (non-blocking) checks exist today — every CI step is blocking.

## Deployment

**Action:** `Azure/static-web-apps-deploy` pinned to a commit SHA (v1).

**Token secrets:**

| App | Secret name |
| --- | --- |
| `apps/tcm` | `AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_RIVER_0E1FD7A10` |
| `apps/8fold` | `AZURE_STATIC_WEB_APPS_API_TOKEN_8FOLD` (set after provisioning — see [PROVISION.md](PROVISION.md)) |

Both secrets are stored as GitHub Actions repo secrets. See [PROVISION.md](PROVISION.md) for rotation procedure. Note: `Azure/static-web-apps-deploy` authenticates via deployment token only — no native OIDC flow exists for this action. An OIDC path would require switching to a different deployment mechanism (e.g., SWA CLI with `azure/login` federated identity).

**Upload mode:** `skip_app_build: true` with `app_location: 'apps/<app>/dist'` and `output_location: ''`. This uploads the pre-built artifact directly, bypassing the SWA builder. Without this, the action attempts to build from source and either fails or uploads `node_modules` (exceeding the SWA Free 250 MB limit). Note: the build task must output `staticwebapp.config.json` to `apps/<app>/dist` before the deploy step; Microsoft requires the file at the `output_location` root when `skip_app_build: true`.

## Environment variables

| Variable          | Where set             | Purpose                                                                |
| ----------------- | --------------------- | ---------------------------------------------------------------------- |
| `PUBLIC_SITE_URL` | GitHub Actions secret | Base URL injected into `sitemap.xml`; required for sitemap correctness |

## Rollback

To revert a deploy, re-run the workflow against a prior commit (checkout SHA). To restore a prior build without a re-deploy, use the Azure Portal: **SWA resource → Environments → select the environment → select a prior deployment → Activate**.

## Artifact retention

| Artifact                       | Location                         | Retention                                             | Regenerable                                   |
| ------------------------------ | -------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| Static HTML + config + sitemap | Azure SWA deployment             | SWA revision history (last N deploys per environment) | Yes — re-run `vp run <app>#build` + deploy    |
| SBOM JSON (`sbom.json`)        | GitHub Actions artifact (`sbom`) | 90-day GitHub default                                 | Yes — re-run CI                               |
| CI logs                        | GitHub Actions                   | 90-day GitHub default                                 | N/A                                           |

## Industry References

- [Azure Static Web Apps — Skip build](https://learn.microsoft.com/azure/static-web-apps/build-configuration#skip-building-front-end-app) — `skip_app_build` rationale and `output_location` contract.
- [GitHub Actions — Manual triggers](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/manually-running-a-workflow) — `workflow_dispatch` reference.

_External URLs verified 2026-06-11._

## Cross-references

- [TOOLCHAIN.md](TOOLCHAIN.md) — `vp check` and `vp run ready` command reference.
- [PROVISION.md](PROVISION.md) — Azure SWA resource setup and token rotation.
- [RUNTIME.md](RUNTIME.md) — Azure SWA hosting model and route contract.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — `vp build` vs `vp run build` failure mode.
