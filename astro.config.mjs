import { defineConfig } from 'astro/config';

// Pure static output (ADR-0001), served by Cloudflare Pages via its Git
// integration (ADR-0002) — no adapter needed for a static build.
//
// Set `site` to the production URL once the domain is decided; it enables
// canonical URLs and a sitemap.
export default defineConfig({
  // site: 'https://balances.example',
});
