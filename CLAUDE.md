# Agent guide — balances-landing

The marketing site for **Balances**. Read these before writing code or copy:

- **`CONTEXT.md`** — brand voice and **the naming law** ("Balances" the product vs "balances" the
  noun). Copy that breaks the naming law is wrong even if it reads well.
- **`CONTRIBUTING.md`** — how a change flows: branch → PR → squash-merge. `main` is protected.
- **`docs/adr/`** — the decisions that shape this repo (static-only, Cloudflare Pages, public,
  npm scripts, Astro). Follow them; changing one needs a new ADR.

## Ground rules

- **Static only** (ADR-0001). No visitor-data capture, forms, analytics, or backend on this site
  without a new ADR — several security decisions hang off that assumption.
- **Secrets.** A pre-commit guard runs `gitleaks protect --staged` when gitleaks is installed; CI
  runs a full-history scan. Never commit tokens/keys. Do not bypass with `--no-verify`.
- **Framework:** Astro (ADR-0005) — prefer zero-JS static output; add client JS only where a
  component genuinely needs it.
- **The app lives elsewhere:** `kerti/balances-v2`. Domain questions (what a "position" or "snapshot"
  is) are answered by that repo's `CONTEXT.md`, not invented here.
