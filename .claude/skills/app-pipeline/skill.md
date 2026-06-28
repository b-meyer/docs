---
name: app-pipeline
description: >
  Wire a new or existing app into the Azure SWA deployment pipeline. Adds the
  Bicep module, creates the GitHub Actions workflow, updates PROVISION.md and
  PIPELINE.md, and hands back the three-phase runbook the user needs to
  provision the Azure resource and trigger the first deploy. Use this skill
  whenever the user wants to deploy an app, add an app to the pipeline, set up
  CI/CD for an app, or asks how to get an app live — even if they just say
  "how do we deploy this?" or "add it to the infra."
---

# Wire an App into the Deployment Pipeline

This skill covers the third phase of the app lifecycle in this repo:
`app-scaffold` → `app-research` → **app-pipeline**.

It adds everything needed to build and deploy an `apps/<slug>/` to its own
Azure Static Web App — Bicep resource, GitHub Actions workflow, and updated
docs — then hands back the runbook commands the user runs to complete
provisioning.

Two hard constraints shape how this skill operates:
- **Read-only git/az/gh** — the skill edits local files; the user runs all
  `az` and `gh` commands.
- **Copy from live, not from frozen examples** — the workflow file and Bicep
  module are derived from the most recent existing app, not from snapshots
  embedded here. This keeps action SHAs, node versions, and stage lists
  current without the skill rotting.

## Inputs to collect

Before touching any file, confirm:

- **slug** — the directory name under `apps/` (e.g. `dao`). All other values
  derive from this.
- **displayName** — how the app is referred to in prose and the workflow name
  field (e.g. `Dao`). Usually just slug with a capital first letter; ask if
  it's non-obvious (e.g. `8fold` → `Eightfold`).

Also verify the precondition: `apps/<slug>/` exists with a `public/staticwebapp.config.json`. That file must be present in the build output for the Azure deploy step to accept it. If it's missing, tell the user to add it (copy from another app's `public/`) before continuing.

## Identifier rules

These apply to the slug; gather them upfront so every substitution is consistent:

| Token | Rule | Example (slug = `dao`) |
|-------|------|------------------------|
| `<SLUG_UPPER>` | slug uppercased | `DAO` |
| `<MODULE_NAME>` | slug as a valid Bicep identifier — strip leading digits/hyphens, replace remaining hyphens with camelCase | `dao`; `8fold` → `eightfold` |
| Secret name | `AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD` | `AZURE_STATIC_WEB_APPS_API_TOKEN_DAO_PROD` |
| Resource name | `swa-<slug>-prod` | `swa-dao-prod` |
| Workflow file | `deploy-<slug>.yml` | `deploy-dao.yml` |

**Legacy exceptions** (do not replicate): `apps/8fold` uses `AZURE_STATIC_WEB_APPS_API_TOKEN_8FOLD` (no `_PROD`), and `apps/tcm` previously used a `NICE_RIVER` name from an older resource. New apps always follow the `<SLUG_UPPER>_PROD` pattern.

## Step 1 — Add the Bicep module

Read `infra/main.bicep`. Find the most recently added `module` block and add a new one directly after it, matching its structure exactly:

```bicep
module <MODULE_NAME> 'swa.bicep' = {
  name: 'swa-<slug>'
  scope: rg
  params: {
    appName: '<slug>'
    location: location
  }
}
```

## Step 2 — Create the GitHub Actions workflow

Find the most recently modified `.github/workflows/deploy-*.yml`. Read it in full — copy its pinned action SHAs, node version, and stage list verbatim. Then write `.github/workflows/deploy-<slug>.yml`, changing only these fields:

| Field | Old value | New value |
|-------|-----------|-----------|
| `name:` | `Deploy <OldDisplay>` | `Deploy <displayName>` |
| `name:` (job) | `Build and deploy <OldDisplay>` | `Build and deploy <displayName>` |
| Build step `run:` | `… -t <old-slug>#build` | `… -t <slug>#build` |
| `azure_static_web_apps_api_token:` | `${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_<OLD>_PROD }}` | `${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD }}` |
| `app_location:` | `apps/<old-slug>/dist` | `apps/<slug>/dist` |

Everything else — pinned SHAs, `--frozen-lockfile`, check/test/audit steps, SBOM steps, `skip_app_build: true`, `output_location: ''` — carries over unchanged.

## Step 3 — Update deploy-all.yml

`.github/workflows/deploy-all.yml` builds and deploys every app in one run. New apps must be added explicitly — GitHub Actions does not support dynamic secret access, so each deploy step must name its secret at authoring time.

Read `.github/workflows/deploy-all.yml`. Add two steps in the correct positions:

**Build step** — insert after the last existing `Build <App>` step, before `Generate SBOM`:
```yaml
      - name: Build <displayName>
        run: pnpm exec vp run -t <slug>#build
```

**Deploy step** — insert after the last existing `Deploy <App> to Azure Static Web Apps` step:
```yaml
      - name: Deploy <displayName> to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@<same-pinned-SHA-as-other-deploy-steps>
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: 'apps/<slug>/dist'
          output_location: ''
          skip_app_build: true
```

Copy the `Azure/static-web-apps-deploy` SHA from the other deploy steps in the file — do not guess or look it up separately.

## Step 4 — Update PROVISION.md

In `docs/PROVISION.md`, make three edits:

**Resource table** — add a row following the existing pattern:
```
| `apps/<slug>` | `swa-<slug>-prod` | `rg-docs-prod` | `AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD` |
```

**Phase 1 description** — the sentence listing what `az deployment sub create` creates (e.g. "This creates `rg-docs-prod`, `swa-tcm-prod`, …"). Add `swa-<slug>-prod` to the list.

**Phase 2 runbook** — add a `gh secret set` block after the last existing one:
```bash
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD --body \
  "$(az staticwebapp secrets list \
    --name swa-<slug>-prod \
    --resource-group rg-docs-prod \
    --query "properties.apiKey" -o tsv)"
```

**Teardown** — add `gh secret delete AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD` to the teardown command list.

## Step 5 — Update PIPELINE.md

In `docs/PIPELINE.md`, make two edits:

**Workflows table** — add a row:
```
| `.github/workflows/deploy-<slug>.yml` | `apps/<slug>` | Manual (`workflow_dispatch`) |
```

**Token secrets table** — add a row:
```
| `apps/<slug>` | `AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD` (set after provisioning — see [PROVISION.md](PROVISION.md)) |
```

Also update the frontmatter `purpose` and `summary` fields to include the new app name — keep the summary's description of the secret naming pattern accurate.

## Step 6 — Update workspace docs

These files list deployed apps; add the new app where missing:

- **`AGENTS.md`** workspace tree — add `├── apps/<slug>/  <displayName> Primer — deployed to Azure SWA` in alphabetical order among the deployed apps.
- **`docs/STRUCTURE.md`** workspace topology tree — same.
- **`docs/ARCHITECTURE.md`** Azure deployment topology paragraph — add `` `apps/<slug>` `` to the backtick list of apps.

## Verify before handing off

Grep to confirm nothing was missed:

```bash
grep -rn "<slug>" infra/ .github/workflows/ docs/PROVISION.md docs/PIPELINE.md AGENTS.md docs/STRUCTURE.md docs/ARCHITECTURE.md
grep -n "<slug>" .github/workflows/deploy-all.yml
```

Every file in that list should have at least one hit.

## Hand off the runbook

After all file edits are done, present these commands for the user to run in order. The user needs Azure Contributor + GitHub repo admin access.

---

**Phase 1 — Provision the Azure resource** _(idempotent — safe to re-run if interrupted)_

```bash
az deployment sub create \
  --location centralus \
  --template-file infra/main.bicep
```

This creates `swa-<slug>-prod` (and any other modules in `main.bicep` that don't yet exist).

**Phase 2 — Wire the deployment token**

```bash
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_<SLUG_UPPER>_PROD --body \
  "$(az staticwebapp secrets list \
    --name swa-<slug>-prod \
    --resource-group rg-docs-prod \
    --query "properties.apiKey" -o tsv)"
```

If Phase 1 succeeded but Phase 2 fails, skip Phase 1 on retry — the Azure resource already exists.

**Phase 3 — Trigger the first deploy**

GitHub → Actions tab → "Deploy <displayName>" → Run workflow.

---

After the first successful deploy, the site is live at the Azure-assigned `*.azurestaticapps.net` URL. Custom domain wiring follows the same pattern as documented in PROVISION.md under "Custom domain migration."
