---
name: launch-check
description: Run the launch checklist against the build, the repo and the live site (security headers, 404 status, immutable caching, the Cloudflare beacon, CSP, SEO tags, npm audit, brand files mirrored from the app, GitHub settings, Lighthouse on the plain live URL), then the items no script can see. Lists findings with IDs and waits. Use for a hardening pass, after any change to hosting, headers or the Cloudflare zone, and when asked to "check launch readiness" or "run Lighthouse".
---

# Launch check

`npm run launch-check` (`scripts/launch-check.mjs`, ported from Uruni's landing) is the mechanical half. This skill adds what it can't see and the order to run things in.

## 1. Start from what production should be

```sh
git switch main && git pull --ff-only
npm run check            # lint, format, astro check, build: dist/ is now what main builds
```

The script compares the live page's hashed `/_astro/` assets with `dist/`. On anything but an up-to-date `main` that comparison is meaningless.

## 2. Run it

```sh
npm run launch-check                       # build + repo + live (astro.config.mjs `site`)
npm run launch-check -- --lighthouse       # plus Lighthouse, mobile and desktop
npm run launch-check -- --url https://<branch>.balances-landing.pages.dev
npm run launch-check -- --local            # no network
```

Exits 1 on any FAIL. The repo checks need `gh` signed in (they read the app repo and this repo's settings). Lighthouse launches Chrome, which needs the sandbox disabled: ask the maintainer each time before running with `--lighthouse`.

What the lines mean when they go wrong:

- **live: serves the same build as dist/ (WARN)**, with other live checks failing: production didn't deploy `main`. Check `gh run list --branch main` for a run on the head commit; if there is none, the maintainer retries the deploy in the Cloudflare dashboard.
- **live: no Cloudflare Web Analytics beacon:** the kerti.dev zone injects it into responses that look like browser page loads, which is why the script sends a browser `Accept` header; a bare `curl` misses it. Turning it off is a dashboard setting the maintainer changes. Until then Lighthouse Best Practices sits at 93 (a WARN, not a FAIL), because our CSP refuses the beacon and logs it.
- **repo: … matches the app:** the favicon and home-screen icon mirror `kerti/balances-v2` byte for byte (CONTEXT.md, Brand assets). Copy the app's file over; never edit ours.
- **repo: npm audit clean:** check `npm audit --omit=dev` first. A dev-only advisory is still fixed (an `overrides` entry, as for minimatch), but it is not urgent.
- **Lighthouse:** the plain URL only (a `?query` skips Cloudflare's cache and inflates the server response). Below 95 is a FAIL. Reports are saved to the temp folder the script prints.

## 3. The items no script sees

Run or confirm each, and report it alongside the script's output:

- **Copy:** the rendered text against CONTEXT.md: the naming law ("Balances" the product, "balances" the noun), no em dashes, curly apostrophes, the slop rules.
- **Layout:** both themes, at 320, 390, 800x1280 and 1440 wide; no sideways scroll. JavaScript disabled: the page is complete. Reduced motion: no animation.
- **Screen-reader text** from the built HTML: skip link first, labelled navs, one H1, `aria-hidden` on decorative SVGs, no words glued across inline elements.
- **CSP negative test:** an inline `<script>` added to the live page in DevTools must not run, and the console shows no violations except the beacon (until it is off).
- **Share card:** `public/og.png` regenerated after any hero change (`npm run og`), legible at about 600x300, and re-uploaded by hand as the GitHub repository's social preview (Settings, General, Social preview; there is no API).
- **Cloudflare Pages settings** (dashboard, maintainer): Node from `.nvmrc`, the custom domain, previews on PRs, Web Analytics off.
- **Pre-commit gitleaks hook:** `gitleaks version` works and a staged test secret is refused (then unstaged).

## 4. Report, then wait

One table: every script line that isn't PASS, plus each item from section 3 with its result. Findings get IDs by area (`S` security and hosting, `P` performance, `A` accessibility, `C` copy, `L` layout, `H` housekeeping), each with the evidence (the command or the score) and a proposed fix, and whether it is ours to fix or the maintainer's (dashboard, zone, repo settings). Then stop: fixes wait for approval by number.
