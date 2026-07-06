# 0003 — Public repository

This repo is **public**, matching the open-source posture of the app (`kerti/balances-v2`,
AGPL-3.0).

Being public gives us, at no cost: GitHub's native **secret-scanning + push-protection** (already
enabled), free **branch protection** on `main`, and a meaningful `SECURITY.md` private-reporting
flow. It also means the marketing site's source is inspectable, consistent with the "your net worth
is not a data product" value proposition — there is nothing to hide in a static brochure.

The obligation this creates: **every diff is world-readable forever.** No secrets, no real personal
data, no laptop-specific absolute paths. The gitleaks pre-commit guard and CI scan (ADR-referenced in
the gitleaks config) are the backstops, and `CONTRIBUTING.md` states the scrub rule.

Going private later would lose native secret-scanning (raising gitleaks' importance) and, on some
plans, gate branch protection behind payment — but the gitleaks config is written to keep working in
that case, so the switch would not be blocked by tooling.
