# TODO

Forward-looking work for this workspace. The docs meta-framework
(`packages/core` → `@framework/core`) and its two consumer sites
(`apps/tcm`, `apps/8fold`) are in place and building green — see
[`CLAUDE.md`](CLAUDE.md) for the current architecture and the `vp` command map.
This file tracks what's left; it is not a changelog.

## Framework — next up

- [ ] **Name the framework.** `@framework/core` is a placeholder. Pick a real
      scope/name and do a single find-and-replace across the workspace
      (`packages/core/package.json`, both apps' deps, imports, docs). Decide
      whether to publish to a registry or keep it `workspace:*`-only.
- [ ] **Set real sitemap hostnames.** `sitemap.hostname` is a placeholder
      (`*.example.com`) in each app's `framework.config.ts`. The CI/CD
      `PUBLIC_SITE_URL` env var still overrides at build time if preferred.
- [ ] **Shiki syntax highlighting + `::: code-group`.** The markdown pipeline
      (`packages/core/src/plugin.ts`) leaves a seam for it; neither current
      consumer ships code blocks, so it was deferred. Add Shiki (dual
      light/dark via the `--shiki-dark` custom property) + a `CodeGroup.vue`
      (reka-ui `Tabs*`) when a code-heavy consumer appears. Gate it like
      mermaid so non-code consumers don't pay for it.

## Framework — later / on demand

Deferred capabilities, roughly in likely-usefulness order. Pull one forward when
a consumer actually needs it (CSS vars + Vite-alias component overrides cover most
theming today):

- [ ] Edit-on-GitHub link (`config.editLink.pattern` with `:path` substitution).
- [ ] `last-updated` git timestamps; sidebar group collapsibility.
- [ ] Snippet/region imports (`<<<`); Shiki transformers (focus/diff/error).
- [ ] Math (KaTeX); Algolia DocSearch (local fuzzysort is the default).
- [ ] i18n routing; RSS feed; link prefetch; page transitions.
- [ ] More layouts beyond doc/home; a formal theme-extends mechanism.
- [ ] Dynamic routes / data loaders; MPA mode.
- [ ] Track the framework's bundle-size budget as features land.

## Deploy & ops

- [ ] **Deploy `apps/8fold`.** It has no CI deploy yet. Provision its own Azure
      Static Web Apps resource + deployment-token secret, then add a second deploy
      job to `.github/workflows/azure-static-web-apps.yml` (build `vp run 8fold#build`,
      upload `apps/8fold/dist`). Mirror the TCM job: Custom build preset,
      `skip_app_build: true`, `app_location: apps/8fold/dist`, `output_location: ''`;
      decline Azure's auto-generated workflow PR. **Caveat:** GitHub Actions can't
      index secrets dynamically (`secrets[matrix.x]` is empty), so use two static
      deploy jobs (or a matrix whose deploy step selects its token via a per-leg
      `if:`), not a dynamic-indexed matrix.
- [ ] **Monitoring.** No Application Insights wired. SWA Free can link an App
      Insights resource via the portal if observability is wanted.
- [ ] **Analytics.** None client-side. If added, prefer a privacy-respecting option
      (Plausible, or App Insights pageviews) and extend the CSP `script-src` /
      `connect-src` in `apps/*/public/staticwebapp.config.json` accordingly.
- [ ] **Custom domain (optional).** Add via the SWA portal (CNAME/TXT); Azure
      manages HTTPS automatically.

## Content

- [ ] **TCM organ stubs.** Several Zang-Fu organ pages have
      `<!-- TODO: patterns to be written -->` markers in their `Common patterns`
      sections — grep for that marker in `apps/tcm/src/pages`.
- [ ] **8fold** is a 3-page stub (Right View / Intention / Speech); flesh out the
      remaining five path factors if it becomes a real site.
