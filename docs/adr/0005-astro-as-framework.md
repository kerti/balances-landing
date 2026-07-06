# 0005 — Astro as the site framework

The site is built with **Astro**.

The requirement (ADR-0001) is a content-first, mostly-static marketing site: fast to load, good SEO,
minimal client JavaScript. Astro fits directly — it renders to static HTML with **zero JS by
default**, ships component islands only where interactivity is genuinely needed, has a first-class
Cloudflare Pages adapter (ADR-0002), and lets us author content in Markdown/MDX with typed content
collections. It also stays framework-agnostic for components (Astro, or React/Svelte/Vue islands if
one page ever needs them), so we are not locked into a heavy SPA runtime for a brochure.

Alternatives weighed: a raw HTML/CSS site (rejected — no components, layouts, or content pipeline,
which slows iteration on a multi-page marketing site); Vite + React SPA (rejected — ships a JS runtime
and client-side routing a static brochure does not need, worse default SEO/performance); Next.js
(rejected — heavier, server-oriented, more than a static site warrants).

Consequences: the build target is static output for Cloudflare Pages; prefer `.astro` components and
static rendering, adding a client island only with a clear reason. This decision unblocks Phase B
(scaffold `package.json`, `.nvmrc`, ESLint/Prettier, and the CI build job).
