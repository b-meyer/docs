# Deploy to Azure Static Web Apps

One-time Azure-side setup to take this repo (`github.com/b-meyer/tcm`) live. Everything in the repo is already wired — the workflow at `.github/workflows/azure-static-web-apps.yml` runs `vp check` / `vp test` / `vp build` and then uploads `dist/` via `Azure/static-web-apps-deploy@v1` with `skip_app_build: true`. The SPA fallback + a couple of security headers are in `public/staticwebapp.config.json`. All you need to do is create the Azure resource and wire the deployment token.

**Deploy trigger.** The workflow fires on **push to the `release` branch only**. `main` is the working branch; promote to production by fast-forwarding `release` to the commit you want live and pushing. No PR previews, no auto-deploy on `main`.

## Prerequisites

- Azure subscription with Owner or Contributor RBAC on the target subscription/resource group.
- GitHub admin access to `github.com/b-meyer/tcm` (to authorize the SWA GitHub integration; Azure creates the deployment-token secret for you).
- `gh` CLI authenticated, **or** GitHub web UI access — either works.

## 1. Create the Static Web App resource

Azure Portal → **Create a resource** → **Static Web App** → **Create**.

- **Subscription / Resource group:** your choice.
- **Name:** e.g. `tcm-primer`.
- **Plan type:** Free (Standard only needed for custom auth, larger app sizes, or long-lived staging environments).
- **Region:** any nearby (the app is served from the global CDN regardless).
- **Source:** GitHub. Authorize, then select `b-meyer/tcm`, branch `release`. Create the branch first if it doesn't exist: `git branch release && git push -u origin release`.
- **Build presets:** **Custom**.
  - **App location:** `/`
  - **Output location:** `dist`
  - **Api location:** _(leave empty — pure static SPA, no Functions)_

Click **Review + create** → **Create**.

> ⚠️ **Important.** Azure will offer to open a PR adding its own workflow file. **Close / decline that PR.** Our workflow at `.github/workflows/azure-static-web-apps.yml` already exists and is configured for `vp` + pnpm; Azure's generated workflow runs `npm run build` and will conflict.

## 2. The deployment token secret

When you authorize the GitHub source in step 1, Azure automatically creates a repo secret named `AZURE_STATIC_WEB_APPS_API_TOKEN_<RANDOM_WORDS>` (e.g. `AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_RIVER_0E1FD7A10`) and a matching workflow file. Decline Azure's auto-PR (see the callout in step 1), but **keep the secret** — our workflow references it by that exact generated name.

Confirm the secret exists: **Settings** → **Secrets and variables** → **Actions** → look for `AZURE_STATIC_WEB_APPS_API_TOKEN_*`. If the name in `.github/workflows/azure-static-web-apps.yml` doesn't match the one Azure created (because you re-created the SWA resource, etc.), update the workflow's `azure_static_web_apps_api_token:` references — both of them, the build job uses it directly.

To rotate the token (if it stops working): Portal → SWA → **Overview** → **Manage deployment token** → copy → re-set the GitHub secret with the same name.

## 3. Trigger the first deploy

The workflow runs automatically on **push to `release`**. To deploy:

```bash
git checkout release
git merge --ff-only main    # or fast-forward to whichever commit you want live
git push origin release
```

Watch progress: **Actions** tab on GitHub, or `gh run watch`. First build is ~3 minutes (pnpm cache cold).

## 4. Verify

Once the workflow's green:

1. Portal → your Static Web App → **URL** → open. Should land on the home page.
2. **Deep-link test.** Visit `<url>/YinYang` directly (paste in browser, don't navigate). Should resolve to the YinYang topic, not 404 — confirms `navigationFallback` is working.
3. **Mermaid render.** Visit `/WuXing` — the generation + control cycle diagrams should render.
4. **Dark mode.** Toggle via the header; mermaid diagrams should re-render in the dark palette.
5. **Search.** Hit ⌘K / Ctrl+K, type something, navigate via Enter.

## 5. Custom domain (optional)

Portal → your Static Web App → **Custom domains** → **+ Add**. Follow the CNAME / TXT instructions. Azure handles HTTPS automatically via App Service Managed Certificates — no extra config.

## Security headers

`public/staticwebapp.config.json` ships these `globalHeaders`:

- `X-Content-Type-Options: nosniff` — blocks MIME-type sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin` — full URL only on same-origin navigations.
- `X-Frame-Options: DENY` — no embedding in iframes (backstop for older browsers).
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`

CSP design notes:

- **`script-src 'self' 'unsafe-inline'`** — `'unsafe-inline'` is required for the theme-bootstrap script in `index.html` that runs synchronously before Vue boots to prevent dark-mode FOUC. For a static SPA with no user-generated content (no API, no DB, no fetch), the XSS surface is essentially zero; cross-origin scripts and `eval()` / `Function()` are still blocked, which covers the realistic threats. If a hash-pinned alternative is preferred later, replace `'unsafe-inline'` with `'sha256-<base64>'` of the inline script's textContent — but the hash will need re-computing whenever the script body changes.
- **`style-src 'self' 'unsafe-inline'`** — mermaid emits inline `<style>` blocks inside its SVG output; required.
- **`img-src 'self' data:`** — mermaid occasionally emits `data:image/svg+xml,...` markers in diagram chrome.
- **`connect-src 'self'`** — no analytics, no third-party fetches. Tighten further only if/when one is needed.
- **`frame-ancestors 'none'`** — modern equivalent of `X-Frame-Options: DENY`; both are sent.

If post-deploy you see CSP console errors:

- A `script-src` block likely means another inline script crept in or a third-party CDN got added — fix the source, don't loosen the policy.
- A `style-src` block from mermaid is unexpected (covered by `'unsafe-inline'`); investigate before loosening.
- An `img-src` block from a `data:` URI means we missed a scheme; add `data:` to the relevant directive.

## Known gaps / follow-ups

- **No Application Insights / monitoring.** Wire later if needed — SWA Free supports linking an App Insights resource via the portal.
- **No PR previews / staging environment.** Deliberate — `main` is the working branch, `release` is what ships, and the only deploy trigger is push to `release`. If a long-lived staging environment is needed later, upgrade to the Standard plan, add a second branch trigger, and use the `production_branch` / `deployment_environment` inputs on the deploy action.
- **No analytics.** None wired client-side. If added, prefer a privacy-respecting option (Plausible, simple Application Insights pageview tracking) and update `index.html` accordingly. Adding any third-party script source will require an addition to `script-src` / `connect-src` in the CSP.

## Troubleshooting

- **Deploy fails with `Unable to determine package manager`.** Ensure `engines.packageManager` in `package.json` is set (it is — `pnpm@11.1.3`). `pnpm/action-setup@v4` reads it.
- **Deploy fails with `404 on /SomePage`.** Check `public/staticwebapp.config.json` shipped to `dist/` — confirm `dist/staticwebapp.config.json` exists after a local `vp build`.
- **Deployment token errors / "No matching token".** Confirm the secret name in `.github/workflows/azure-static-web-apps.yml` matches the `AZURE_STATIC_WEB_APPS_API_TOKEN_*` secret Azure created in the repo. If you rotate the token via Portal → SWA → **Manage deployment token**, copy the new value into the same-named secret.
- **"The size of the app content was too large. The limit for this Static Web App is 262144000 bytes."** This is the SWA Free 250 MB total-app limit. Your `dist/` is almost certainly under it (currently ~4 MB), so check the workflow: with `skip_app_build: true`, the action treats `app_location` as the artifact directory and **silently ignores `output_location`**. Set `app_location: 'dist'` and `output_location: ''` — not the other way around. The Microsoft docs only state this clearly on the "Skip building front-end app" page, so it's easy to miss.
- **Azure auto-PR shows up later.** If someone re-runs the Static Web App creation wizard or reconnects the repo, Azure may re-open the auto-workflow PR. Decline and verify ours is still the only file in `.github/workflows/`.
