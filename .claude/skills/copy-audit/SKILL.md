---
name: copy-audit
description: Audit the page's copy against CONTEXT.md - the naming law, claims discipline, voice, the style rules (British spelling, no serial comma, curly quotes, no em dashes) and anti-slop - over the rendered text, metadata, alt text and aria-labels. Lists findings with IDs (C1, C2...) and waits for approval. Use on every PR that adds or changes visible copy, before a launch or hardening pass, and when asked to "audit the copy", "sweep the copy" or "check the wording".
---

# Copy audit

`CONTEXT.md` is the law; this skill is how to check a page against it. Ported from Uruni's landing
(`kerti/uruni-landing`), rewritten for English. Half is mechanical (`npm run copy-audit`), half is
reading. Both halves report; nothing is changed until the maintainer approves findings by number.

## 1. Run the script

```sh
npm run build
npm run copy-audit                                   # every page in dist/
npm run copy-audit -- --url https://<preview>.pages.dev/
```

`scripts/copy-audit.mjs` renders each page in Chrome with every `<details>` opened and
`text-transform` off, and reads the visible text, the title, meta and share tags, JSON-LD, alt text,
aria-labels and SVG titles.

- **FAIL** breaks a written rule: em dashes, straight quotes or apostrophes, the naming law
  (`BALANCES`, `Balance`, lowercase _balances_ as the product), the word _position_, exclamation
  marks, the slop and urgency lists, a hosted signup or waitlist, version numbers or stage badges,
  American spelling. Exits 1.
- **REVIEW** is a heuristic, or a word that is right in context: a serial comma, a list of three,
  churn-prone or absent features (fine in an FAQ answer that says _No_), "X, not Y" and "not X, but
  Y" contrasts, a number and unit that may break apart, and any four-word phrase said three times or
  more. The calls to action and the demo caveat repeat word for word by design (hero and closing
  CTA); everything else repeated is a finding.

A false positive in the script is fixed in the script (a tighter pattern or a skip), in the same
PR, never by rewording approved copy around it.

## 2. Read the page

The script can't judge these. Read the rendered text (or the components) against CONTEXT.md:

- **Naming law.** _Balances_ the product, _balances_ the noun. The script only catches lowercase
  _balances_ followed by a verb; read every other use.
- **Claims discipline.** Every feature named is on the durable core list (four groups, monthly
  snapshots, the net-worth chart, multi-currency, open source, self-host, backup/export). Nothing
  churn-prone (importers, tags, analytics) and nothing the app doesn't do (forecasts, bank sync, a
  hosted signup). A new claim needs a source in `kerti/balances-v2`, and the call on what the page
  may claim stays with the maintainer.
- **Vocabulary.** Domain words follow the app's UI and `CONTEXT.md` in `kerti/balances-v2`. Alt
  text describes what the screenshot shows today (check it after every recapture).
- **Voice.** Calm, precise, a little opinionated. No hype, urgency or testimonial theatre.
  Non-features stated plainly.
- **Anti-slop.** "X, not Y" contrasts: few, never in more than one heading (the canonical headline
  is the approved one). Colon reveals ("the number that actually matters: X"). Three-item lists and
  three cards in a row. Stock closers. Prose that repeats a chip or list beside it. Headings
  are one colour: no brass italic hook (dropped 2026-11-17).
- **Style.** British spelling (_-ise_, _colour_). No serial comma ("a, b and c"). Curly quotes and
  apostrophes. Periods and commas, never em dashes. Dates as _30 April_; numbers from data go
  through `Intl`.
- **Line breaks.** No-break spaces where a number and its unit, or a short fixed phrase, must stay
  together. Check 320 and 390 px.
- **Screen-reader text.** `sr-only` prefixes read well aloud; aria-labels say what the control does.

## 3. Report, then wait

One list, IDs `C1`, `C2`..., each with where it is (section and element), the current text, the
rule, and a proposed rewrite. Group script FAILs first, then REVIEW items you agree with, then
reading findings. Mark anything the maintainer declined in an earlier audit as such. Say which
REVIEW items you dismissed and why, in one line each.

Stop there. Copy changes only after the maintainer approves by number. A change to the canonical
copy in `CONTEXT.md` (headline, subhead, value proposition) updates that file in the same PR, and a
hero change also updates `scripts/og-card.ts` and the share image (`npm run og`).
