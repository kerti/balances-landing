# 0006 — Cloudflare Pages deploy config and production domain

ADR-0002 chose Cloudflare Pages via Git integration; this records the concrete configuration now
that the site is live, so it lives in the repo and not only in the Cloudflare dashboard.

**Product: Pages, not Workers.** Cloudflare's current "import a repository" flow defaults to a
**Worker** (deploy command `npx wrangler deploy`), which expects a `wrangler` config and a server
entry this static site does not have. We deliberately use the classic **Pages** path instead: no
`wrangler.jsonc`, no deploy command, Cloudflare simply serves the built `dist/`. An agent or human
setting up a fresh environment should pick the **Pages** tab, not the Workers builder. Migrating to
Workers static-assets later is possible but is a new ADR (it adds a `wrangler` config to the tree).

**Configuration:**

- Project name: `balances-landing` (default subdomain `balances-landing.pages.dev`)
- Connected repo: `kerti/balances-landing`, production branch `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22` (via `.nvmrc`, reinforced by a `NODE_VERSION=22` project env var)
- No environment secrets — the site is static (ADR-0001) and Git integration deploys without a
  Cloudflare API token in GitHub (ADR-0002), so there is nothing to leak.

**Production domain:** `balances.kerti.dev`, added under the Pages project's Custom domains (DNS +
TLS managed by Cloudflare). Every non-production branch / PR gets an automatic preview deployment.

Consequence: merges to `main` publish to production; a broken build fails Cloudflare's own build
step. If we ever need deploy gated on green CI, switch to `wrangler pages deploy` in a workflow and
accept holding a scoped API token as a GitHub secret — a new ADR.
