# 0004 — npm scripts as the task runner, not a Makefile

Task automation (dev, build, lint, format, hook install) lives in **`package.json` scripts**, not in
a Makefile.

The app repo (`kerti/balances-v2`) uses a large Makefile, but it earns that Makefile by being
polyglot — Go, Node, Postgres, Docker, and Playwright all under one set of verbs. This repo is a
single-language JavaScript/TypeScript Astro site. A Makefile here would be indirection over `npm`
with nothing to unify, so it is not carried over.

Consequences: the canonical verbs are `npm run dev|build|lint|format|check`. Hook installation runs
via `scripts/hooks-install.sh` and, once the Astro app is scaffolded, from an npm `prepare` script so
`npm install` sets hooks up automatically. Contributors coming from the app repo lose the `make …`
muscle memory; that is judged a smaller cost than maintaining a redundant Makefile.

If this repo ever grows a second toolchain (say a Go-based edge function), revisit — a thin Makefile
that unifies genuinely different tools would then earn its place.
