import { defineConfig } from 'astro/config';

// Pure static output (ADR-0001), served by Cloudflare Pages via its Git
// integration (ADR-0002) — no adapter needed for a static build.
export default defineConfig({
  site: 'https://balances.kerti.dev',
  // One page, about 7 KB of CSS gzipped: inlined, it saves a round trip before
  // first paint, and the fonts it names are found as soon as the HTML is read.
  build: {
    inlineStylesheets: 'always',
  },
  // Content Security Policy as a <meta> tag: Astro hashes every inline script
  // and style it emits, so nothing inline runs unless the build put it there.
  // Directives a <meta> CSP can't carry (frame-ancestors) live in public/_headers.
  security: {
    csp: {
      directives: ["default-src 'self'"],
      styleDirective: {
        // Components pass per-element custom properties (`style="--i: 0"`) for
        // staggered motion; those attributes can't be hashed one by one.
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
});
