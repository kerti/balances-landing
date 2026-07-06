# Contributing to balances-landing

The marketing site for Balances. Small, opinionated repo — a little orientation saves back-and-forth.

## Start here

- **Brand voice + the naming law:** [`CONTEXT.md`](CONTEXT.md). "Balances" (product) vs "balances"
  (noun) is non-negotiable.
- **Why the repo is set up this way:** [`docs/adr/`](docs/adr/) — numbered decisions.

## Local setup

```sh
npm install       # installs deps; the "prepare" script enables the pre-commit secret guard
npm run dev       # http://localhost:4321
```

Before opening a PR, run `npm run check` — it mirrors CI (lint · format:check · astro check · build).

## How a change flows

1. **Branch → PR → squash-merge** (GitHub Flow). `main` is protected: PRs must pass CI, no
   force-push, linear history. The squash-merge is the sign-off (solo maintainer — no separate
   approval is required, by design).
2. **Decisions get an ADR.** A hard-to-reverse call — the framework, the host, adding any
   visitor-data capture — gets a numbered file in [`docs/adr/`](docs/adr/) before code. Follow
   existing ADRs without a new one.
3. **Label the PR** with a type (`enhancement` / `bug` / `documentation` / `dependencies`).

## Before you open a PR

- **Copy follows the naming law** and the voice in `CONTEXT.md`. Never imply features the app lacks.
- **Scrub the diff.** No secrets, no real personal data, no laptop-specific absolute paths — this is
  a **public** repo. The pre-commit guard and CI gitleaks scan are backstops, not permission to be
  careless.
- **Static-only holds** (ADR-0001). Introducing a form, analytics, or a backend is an ADR-level
  change, not a PR detail.

## Security

Vulnerabilities follow [`SECURITY.md`](SECURITY.md) — do not open a public issue for one.

## Licence

By contributing you agree your contributions are licensed under [AGPL-3.0](LICENSE).
