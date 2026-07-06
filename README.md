# balances-landing

The public landing page / marketing site for **Balances** — a snapshot-based personal-finance app
for tracking household net worth. The app itself lives in [`kerti/balances-v2`](https://github.com/kerti/balances-v2);
this repo is only the website.

**New here?**

- [`CONTEXT.md`](CONTEXT.md) — brand voice, the naming law, and the value proposition. Use these
  exact words in copy.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how a change flows (branch → PR → squash).
- [`docs/adr/`](docs/adr/) — why the repo is set up the way it is, each decision numbered.

## Status

Scaffolding only. The Astro site (ADR-0005) is not built yet.

## Local development

Prerequisites: Node (version pinned in `.nvmrc` once the app is scaffolded).

```sh
scripts/hooks-install.sh      # first clone: enable the pre-commit secret guard
```

Build/dev/lint scripts land in `package.json` when the Astro app is scaffolded (Phase B).

## Hosting

Deploys to **Cloudflare Pages** via its native Git integration (ADR-0002) — CI does not hold deploy
secrets; pushes and PRs build automatically.

Licensed under [AGPL-3.0](LICENSE).
