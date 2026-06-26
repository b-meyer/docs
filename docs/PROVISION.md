---
purpose: 'Documents how to provision, configure, and tear down Azure Static Web Apps resources for this project.'
scope: 'Azure SWA resource provisioning only — CI pipeline in PIPELINE, runtime hosting model in RUNTIME. No Functions, App Service, or database resources in scope (project is pure-SWA).'
audience: 'Maintainers provisioning new environments or rotating tokens (primary); agents reasoning about infrastructure setup (secondary).'
summary: 'One Azure SWA resource per app under rg-docs-prod; naming convention swa-<slug>-prod; provisioned via infra/main.bicep (subscription-scoped, single command); deployment token retrieved with az CLI and stored as a GitHub Actions secret named AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG>_PROD; staticwebapp.config.json is committed (no pipeline substitution); teardown via resource group deletion + token revocation.'
---

# Provision

## Prerequisites

Before running the provisioning runbook, confirm you have:

- **Azure subscription** with **Contributor** role on the subscription (failure without it: 403 on resource group or resource creation).
- **GitHub repo admin access** (failure without it: cannot set Actions secrets).
- **Azure CLI ≥ 2.50** with the Bicep CLI installed (`az bicep install`).
- **GitHub CLI** (`gh`) authenticated to the repo.

## Resource model

Each app has its own Azure Static Web Apps resource under a shared resource group. Resources are independent — no shared backends, no Functions, no databases.

**Naming conventions:**

| Token | Pattern | Example (`dao`) |
| ----- | ------- | --------------- |
| Azure resource | `swa-<slug>-prod` | `swa-dao-prod` |
| Resource group | `rg-docs-prod` | — |
| GitHub secret | `AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG>_PROD` | `AZURE_STATIC_WEB_APPS_API_TOKEN_DAO_PROD` |

The current app list lives in `infra/main.bicep` — one `module` block per app.

## Infrastructure as code

All Azure resources are defined in `infra/`:

| File               | Scope          | Purpose                                                     |
| ------------------ | -------------- | ----------------------------------------------------------- |
| `infra/main.bicep` | Subscription   | Creates the resource group and deploys all app SWA modules  |
| `infra/swa.bicep`  | Resource group | Parameterized SWA resource (reused as a module per app)     |

## Provisioning runbook

Provisioning is idempotent — safe to re-run if anything fails partway through.

**Phase 1 — Azure resources** _(one command)_

```bash
az deployment sub create \
  --location centralus \
  --template-file infra/main.bicep
```

This creates `rg-docs-prod` and one `swa-<slug>-prod` resource for each app module defined in `infra/main.bicep`. Idempotent — existing resources are left unchanged.

**Phase 2 — GitHub wiring** _(one command per app)_

Run once for each app, substituting its slug:

```bash
# Replace <slug> with the app directory name (e.g. dao) and <SLUG> with its uppercase form (e.g. DAO)
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG>_PROD --body \
  "$(az staticwebapp secrets list \
    --name swa-<slug>-prod \
    --resource-group rg-docs-prod \
    --query "properties.apiKey" -o tsv)"
```

The `deploy-app` skill generates the filled-in commands for a specific app.

Partial-failure recovery: if Phase 2 fails after Phase 1 completes, the Azure resources already exist — skip Phase 1 and re-run only the failing `gh secret set` command.

## Custom domain

After the first successful deploy, a custom domain can be attached to the SWA resource:

1. **Azure Portal** → `swa-<slug>-prod` → Custom domains → Add → enter your domain. Azure provides a CNAME or TXT record for validation; add it at your DNS provider to complete TLS provisioning.
2. **At your DNS provider:** update the CNAME (subdomain) or alias/ANAME (apex) to `swa-<slug>-prod.azurestaticapps.net`. Wait for propagation and confirm HTTPS is live.
3. **Decommission the old resource** only after the custom domain resolves on the new SWA — delete the old SWA resource from the Azure Portal and remove its corresponding GitHub secret.

## IAM model

| Role             | Principal          | Scope        | Purpose                                  |
| ---------------- | ------------------ | ------------ | ---------------------------------------- |
| Contributor      | Operator (human)   | Subscription | Creates resource group and SWA resources |
| SWA Deploy Token | CI pipeline runner | SWA resource | Uploads pre-built artifact on deploy     |

`Azure/static-web-apps-deploy` authenticates via deployment token only — no native OIDC flow exists for this action. A future OIDC path would require switching to a different deployment mechanism (e.g., SWA CLI with `azure/login` federated identity). Until then, the deployment token with documented rotation cadence below is the only supported path.

## Deployment token rotation

Treat deployment tokens as secret credentials:

- Stored in GitHub Actions Secrets (repo-level: Settings → Secrets and variables → Actions).
- Never committed to the repository.
- **Rotation:** (1) Azure Portal → SWA resource → **Manage deployment token** → **Reset token** → copy the new value. The old token is invalid after reset. (2) Re-run the `gh secret set` command for the affected app with the new value.

## staticwebapp.config.json

Each app's `public/staticwebapp.config.json` is committed to the repo and uploaded as part of the build artifact. There is no pipeline substitution — the same file is used in all environments. CSP headers in this file use `'unsafe-inline'`; see [SECURITY.md](SECURITY.md) for the rationale.

## Teardown

1. In the Azure portal, delete `rg-docs-prod` (removes all SWA resources in the group).
2. Delete each app's GitHub Actions secret — name follows the pattern `AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG>_PROD`:
   ```bash
   gh secret delete AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG>_PROD
   ```
   Run once per app. The current set of secrets matches the apps in `infra/main.bicep`.

## Industry References

- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/) — SWA resource concepts and Free plan limits.
- [Azure Static Web Apps — Deployment token](https://learn.microsoft.com/azure/static-web-apps/deployment-token-management) — token creation and rotation.
- [Bicep — Subscription-scoped deployments](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-to-subscription) — `targetScope = 'subscription'` and module scoping.

## Cross-references

- [PIPELINE.md](PIPELINE.md) — CI workflow that uses the deployment token.
- [RUNTIME.md](RUNTIME.md) — SWA hosting model and route config.
- [SECURITY.md](SECURITY.md) — CSP posture for the deployed site.
