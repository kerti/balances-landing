# Balances — landing site context

This is the domain language and brand voice for the **marketing site**. It is deliberately narrower
than the app's `CONTEXT.md` (in `kerti/balances-v2`), which carries the full financial ontology
(positions, assets, liabilities, bonds, snapshots). Copy on this site should stay at the value-prop
altitude; when a page needs a precise domain term, borrow it from the app's CONTEXT.md rather than
inventing a new one here.

## What Balances is (one paragraph, canonical)

Balances is a personal-finance app that tracks **net worth** via end-of-month balance snapshots
across all of a Household's positions — bank accounts, property, investments, debts. You enter one
number per position each month; Balances computes and charts your net worth over time.
Transaction-by-transaction budgeting (Mint / YNAB style) is a deliberate **non-feature** — that is a
positioning point, not an omission.

## The naming law (non-negotiable)

The product name is **"Balances"** — capital B. Used for the logo wordmark, page titles, the
value-prop copy, and email headers.

The common noun **"balances"** stays lowercase — account balances, month-end balances, "enter your
balances."

They disambiguate in the same sentence:

> _Each month you enter your balances; Balances tracks your net worth._

Never write "BALANCES", "balances" (for the product), or "Balance" (singular, for the product).

## Brand assets

The **favicon / app icon** (`public/favicon.svg`) is a mirror of the app's icon in
`kerti/balances-v2` (`frontend/public/favicon.svg`) — the app repo is the source of truth. Keep the
two byte-identical; if the app's icon changes, copy it over here rather than editing the copy in
this repo. Any future shared brand marks (logo, wordmark) follow the same rule.

## Value proposition (what the copy sells)

- **Low friction.** One number per position, once a month. No receipt-scanning, no transaction
  categorising, no bank-sync babysitting.
- **Net worth, not budgeting.** The question answered is "am I building wealth over time?", not
  "where did my coffee money go?".
- **Everything in one place.** Bank accounts, property, vehicles, investments, and debts — including
  illiquid things that have no transactions to sync.
- **Yours.** Open-source (AGPL-3.0) and self-hostable; your household's net worth is not a data
  product.

## Audience & voice

- **Audience:** individuals and households who want a durable, low-effort picture of net worth over
  years — not spenders trying to budget week to week.
- **Voice:** calm, precise, a little opinionated. State the non-features plainly. No hype, no
  growth-hacking urgency, no fake scarcity. Never imply features the app does not have.

## Out of scope for this site (until decided otherwise)

Pure static marketing (ADR-0001): no visitor-data capture, no waitlist form, no analytics, no
account signup on this domain. If any of those change, they need an ADR and revisit the privacy
posture and the secret/PII guards.
