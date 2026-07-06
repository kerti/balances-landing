# 0001 — Pure static marketing site, no visitor-data capture

This repo is the marketing site for Balances. It ships as a **pure static site**: no forms, no
waitlist/email capture, no analytics, no cookies, no backend or serverless functions, and no account
signup on this domain.

Several downstream decisions hang off this assumption, which is why it is recorded first. Because the
site holds and collects no personal data, we deliberately **do not** carry over the app repo's
pre-commit PII denylist, and we need no privacy policy, consent banner, or data-processing surface.
The security posture is "protect the secrets in the build/deploy path" (see the gitleaks config and
`SECURITY.md`), not "protect user data" — there is none.

Introducing any visitor-data capture (a waitlist, a contact form, analytics) is therefore an
ADR-level change, not a PR detail: it would reopen the privacy posture, likely add a backend or
third-party processor, and warrant re-adding a PII guard.

The cost is that any interactive/data feature is blocked until that ADR happens. That is acceptable —
a landing page's job is to explain and link to the app, and the app is where accounts and data live.
