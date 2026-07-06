# 0002 — Host on Cloudflare Pages via native Git integration

The site deploys to **Cloudflare Pages**, wired through its **native Git integration** (Cloudflare
watches the GitHub repo and builds on push / PR) rather than a `wrangler pages deploy` step inside a
GitHub Actions workflow.

The Git-integration model means CI holds **no deploy secrets** — there is no `CLOUDFLARE_API_TOKEN`
or account id in GitHub, so there is nothing to leak and no deploy job to maintain. Production builds
on merge to `main`; every PR gets an automatic preview deployment. CI's job is reduced to quality
gates (lint / build / secret scan), keeping the deploy path and the verification path cleanly
separated.

The trade-off: deploys are not gated behind green CI — Cloudflare builds a branch regardless of the
CI result. For a static marketing site that is fine (a broken build simply fails Cloudflare's own
build step). If we later want deploy blocked on CI, we switch to `wrangler pages deploy` in a
workflow and accept holding a scoped API token as a GitHub secret; that switch is a new ADR.

Docker, `fly.toml`, and the operator/self-host stack from the app repo are explicitly **not** carried
over — they solve a problem (self-hostable full-stack app) this repo does not have.
