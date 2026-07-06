#!/bin/sh
# Enable the repo's git hooks (run once per clone).
#
# Points git at .githooks/ and makes the pre-commit secret guard executable.
# Once the Astro app is scaffolded (Phase B), this is also wired to run from an
# npm "prepare" script so `npm install` sets it up automatically.
set -eu

cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
echo "✓ git hooks installed (core.hooksPath=.githooks); pre-commit secret guard active"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "  note: gitleaks not installed — the local scan will skip until you install it." >&2
  echo "        install: https://github.com/gitleaks/gitleaks#installing" >&2
fi
