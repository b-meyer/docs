---
purpose: 'Documents how to provision, configure, and tear down Azure Static Web Apps resources for this project.'
scope: 'Azure SWA resource provisioning only — CI pipeline in PIPELINE, runtime hosting model in RUNTIME. No Functions, App Service, or database resources in scope (project is pure-SWA).'
audience: 'Maintainers provisioning new environments or rotating tokens (primary); agents reasoning about infrastructure setup (secondary).'
summary: 'One Azure SWA resource per app; resource group per environment; deployment token stored as GitHub Actions secret; staticwebapp.config.json is committed (no pipeline substitution); teardown via resource group deletion + token revocation.'
---

# Provision

## Prerequisites

Before running the provisioning runbook, confirm you have:

- **Azure subscription** with **Contributor** role on the target resource group (failure without it: 403 on resource creation).
- **GitHub repo admin access** (failure without it: cannot set Actions secrets).
- **Azure Portal** browser access or **Azure CLI ≥ 2.50** (failure without it: cannot create the SWA resource).

## Resource model

Each app has its own Azure Static Web Apps resource. Resources are independent — no shared backends, no Functions, no databases.

| App          | Status              | Notes                                                                         |
| ------------ | ------------------- | ----------------------------------------------------------------------------- |
| `apps/tcm`   | Deployed            | Token secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_RIVER_0E1FD7A10`          |
| `apps/8fold` | Not yet provisioned | Token secret (after provisioning): `AZURE_STATIC_WEB_APPS_API_TOKEN_8FOLD`    |

## Resource group conventions

- One resource group per environment (e.g., `rg-docs-prod`).
- Name SWA resources consistently: `swa-<app>-<env>` (e.g., `swa-tcm-prod`).
- All resources for a project environment live in the same resource group to simplify teardown.

## Infrastructure as code

No IaC (Bicep/ARM/CLI script) exists for the live SWA resources. This is a deliberate deferral — the single provisioned resource (`apps/tcm`) was created manually via the portal and re-provisioning it from scratch is not a near-term need. IaC is worth adding when provisioning a new resource (e.g., `apps/8fold`) or if the project moves to a different Azure tenant. Until then, the portal runbook below is the authoritative procedure.

## Provisioning a new SWA resource

Portal resource creation is **not idempotent** — a name collision creates a separate resource. Verify the target resource doesn't already exist before running.

**Phase 1 — Azure resource** _(outputs: resource URL + deployment token)_

1. In Azure Portal, navigate to the target resource group.
2. Create a new Static Web Apps resource. Name: `swa-<app>-<env>`. Select the **Free** plan tier; set deployment source to **Other** (CI handles the build).
3. After creation, retrieve the **deployment token**: SWA resource → Manage deployment token → copy.

**Phase 2 — GitHub wiring** _(inputs: deployment token from Phase 1)_

4. In the repo: Settings → Secrets and variables → Actions → New repository secret.
5. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_<resource-slug>`. Value: token from Phase 1.
6. Update `.github/workflows/azure-static-web-apps.yml` to reference the new secret name.

Partial-failure recovery: if Phase 2 fails after Phase 1 completes, the Azure resource already exists — skip to Phase 2 step 4.

## IAM model

| Role             | Principal          | Scope          | Purpose                              |
| ---------------- | ------------------ | -------------- | ------------------------------------ |
| Contributor      | Operator (human)   | Resource group | Creates and manages the SWA resource |
| SWA Deploy Token | CI pipeline runner | SWA resource   | Uploads pre-built artifact on deploy |

`Azure/static-web-apps-deploy` authenticates via deployment token only — no native OIDC flow exists for this action. A future OIDC path would require switching to a different deployment mechanism (e.g., SWA CLI with `azure/login` federated identity). Until then, the deployment token with documented rotation cadence below is the only supported path.

## Deployment token

Treat the deployment token as a secret credential:

- Stored in GitHub Actions Secrets (repo-level: Settings → Secrets and variables → Actions).
- Never committed to the repository.
- **Rotation:** (1) In the SWA portal: **Manage deployment token** → **Reset token** → copy the new value. The old token should be treated as invalid after reset (Microsoft does not document an explicit grace period). (2) Update the GitHub Actions secret with the new value immediately after reset.

## staticwebapp.config.json

Each app's `public/staticwebapp.config.json` is committed to the repo and uploaded as part of the build artifact. There is no pipeline substitution — the same file is used in all environments. CSP headers in this file use `'unsafe-inline'`; see [SECURITY.md](SECURITY.md) for the rationale.

## Teardown

1. In the Azure portal, delete the resource group (removes all resources including the SWA instance).
2. In GitHub: Settings → Secrets → delete the corresponding `AZURE_STATIC_WEB_APPS_API_TOKEN_*` secret.
3. Remove the deploy step from `.github/workflows/azure-static-web-apps.yml`.

## Industry References

- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/) — SWA resource concepts and Free plan limits (Free tier: no SLA).
- [Azure Static Web Apps — Deployment token](https://learn.microsoft.com/azure/static-web-apps/deployment-token-management) — token creation and rotation.

_External URLs verified 2026-06-04._

## Cross-references

- [PIPELINE.md](PIPELINE.md) — CI workflow that uses the deployment token.
- [RUNTIME.md](RUNTIME.md) — SWA hosting model and route config.
- [SECURITY.md](SECURITY.md) — CSP posture for the deployed site.
