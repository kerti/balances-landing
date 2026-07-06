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

Live at **<https://balances.kerti.dev>** (Astro scaffold, ADR-0005) with a placeholder home page.
Real content is next.

## Local development

Prerequisites: Node 22+ (pinned in `.nvmrc`).

```sh
npm install        # installs deps; the "prepare" script enables the pre-commit secret guard
npm run dev        # http://localhost:4321
npm run build      # static build to dist/ (what Cloudflare Pages serves)
npm run check      # the local mirror of CI: lint · format:check · astro check · build
```

Individual gates: `npm run lint`, `npm run format` (write) / `npm run format:check`, `npm run astro:check`.

## Hosting

Deploys to **Cloudflare Pages** via its native Git integration (ADR-0002, config in ADR-0006) —
`main` publishes to <https://balances.kerti.dev>, every PR gets a preview URL, and CI holds no deploy
secrets.

Licensed under [AGPL-3.0](LICENSE).
