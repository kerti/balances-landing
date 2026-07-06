# Security Policy

This repository hosts the public marketing site for Balances. It is static and collects no visitor
data (ADR-0001), so the attack surface is small — but the app it advertises holds household
financial data, so we still take reports seriously.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub's **[private vulnerability
reporting](https://github.com/kerti/balances-landing/security/advisories/new)**:

1. Go to the [Security tab](https://github.com/kerti/balances-landing/security) of this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, how to reproduce it, and the impact you believe it has.

If the issue is in the **application** rather than this website, report it against
[`kerti/balances-v2`](https://github.com/kerti/balances-v2) instead.

## Scope

In scope: the site's own code and its build/deploy configuration (Cloudflare Pages), and anything
that could let an attacker alter what visitors see (defacement, injected script, supply-chain
tampering via a dependency or GitHub Action).

Out of scope: vulnerabilities in third-party dependencies (report upstream; we track ours via
Dependabot), and findings that require an already-compromised host.

## Response expectations

Maintained by a single developer — timelines are best-effort, not contractual:

- **Acknowledgement** within **5 business days**.
- Initial **assessment** within **10 business days**.
- Credit in the advisory once published, unless you prefer to stay anonymous.

Please give a reasonable window to ship a fix before public disclosure.
