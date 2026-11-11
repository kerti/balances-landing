// Launch check: the machine-checkable half of a launch or hardening pass, over
// the build, the repo and the live site. Ported from Uruni's landing
// (kerti/uruni-landing, scripts/launch-check.mjs).
//
//   npm run launch-check                          build + repo + live site (astro.config `site`)
//   npm run launch-check -- --url https://<preview>.pages.dev
//   npm run launch-check -- --lighthouse          also Lighthouse, mobile and desktop
//   npm run launch-check -- --local               build and repo only, no network
//
// Run npm run build first, from an up-to-date main when checking production:
// one check compares the live page's hashed assets with dist/, which only
// means something when dist/ is what main builds.
//
// PASS / WARN / FAIL / SKIP per line; exits 1 on any FAIL. WARN needs a person
// to judge. The items no script can see are in .claude/skills/launch-check/SKILL.md.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const site = readFileSync('astro.config.mjs', 'utf8').match(/site:\s*'([^']+)'/)?.[1];
const base = (args.includes('--url') ? args[args.indexOf('--url') + 1] : site)?.replace(/\/$/, '');
const local = args.includes('--local');
const lighthouse = args.includes('--lighthouse');
const LIGHTHOUSE = 'lighthouse@13.6.0';
// A browser's request. Cloudflare injects the Web Analytics beacon only into
// responses to requests that look like page loads, so a bare curl misses it.
const BROWSER = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};
// TLDs on the HSTS preload list as a whole; anything else needs the header.
const PRELOADED_TLDS = ['dev', 'app', 'page', 'new', 'day', 'foo', 'zip', 'mov'];

const results = [];
const report = (status, what, detail = '') => results.push([status, what, detail]);
const check = (ok, what, detail, failAs = 'FAIL') =>
  report(ok ? 'PASS' : failAs, what, ok ? '' : detail);

// ---------------------------------------------------------------- build ----
if (!existsSync('dist/index.html')) {
  console.error('launch-check: no dist/; run npm run build first');
  process.exit(2);
}
const pages = readdirSync('dist').filter((f) => f.endsWith('.html'));
const html = Object.fromEntries(pages.map((f) => [f, readFileSync(join('dist', f), 'utf8')]));
const index = html['index.html'];
const astroAssets = (doc) => new Set(doc.match(/\/_astro\/[^"')\s?#]+/g) ?? []);

check(
  '404.html' in html,
  'build: 404 page',
  'no dist/404.html; Pages falls back to the home page with 200',
);
for (const [f, doc] of Object.entries(html)) {
  check(
    /<meta http-equiv="content-security-policy"/i.test(doc),
    `build: CSP meta in ${f}`,
    'missing; check security.csp in astro.config.mjs',
  );
  const dataUris =
    doc.match(/(?:src|href|srcset)="data:[^"]{0,30}|url\(\s*["']?data:[^)]{0,30}/g) ?? [];
  check(
    !dataUris.length,
    `build: no data: URIs in ${f}`,
    `${dataUris.length} found (${dataUris[0]}…); the CSP refuses them`,
  );
  const thirdParty = [
    ...doc.matchAll(
      /<(?:script|img|source|iframe|video|audio)\b[^>]*\s(?:src|srcset)="(https?:\/\/[^"/]+)/g,
    ),
    ...doc.matchAll(
      /<link\b[^>]*rel="(?:stylesheet|preload|modulepreload|icon|apple-touch-icon|manifest)"[^>]*href="(https?:\/\/[^"/]+)/g,
    ),
    ...doc.matchAll(/url\(\s*["']?(https?:\/\/[^/"')]+)/g),
  ].map((m) => m[1]);
  check(
    !thirdParty.length,
    `build: no third-party origins loaded by ${f}`,
    [...new Set(thirdParty)].join(', '),
  );
  const imgs = doc.match(/<img\b[^>]*>/g) ?? [];
  const noSizes = imgs.filter((i) => / srcset=/.test(i) && !/ sizes=/.test(i));
  check(
    !noSizes.length,
    `build: every srcset image in ${f} has sizes`,
    `${noSizes.length} without`,
  );
}
if (html['404.html']) {
  const nf = html['404.html'];
  check(
    /name="robots" content="noindex"/.test(nf),
    'build: 404 is noindex',
    'missing robots noindex',
  );
  check(
    !/rel="canonical"/.test(nf),
    'build: 404 has no canonical',
    'a 404 should not claim a canonical URL',
  );
}
for (const [what, re] of [
  ['canonical', /<link rel="canonical" href="https?:\/\//],
  ['meta description', /<meta name="description" content="[^"]+/],
  ['og:image (absolute)', /<meta property="og:image" content="https?:\/\//],
  ['og:image:alt', /<meta property="og:image:alt" content="[^"]+/],
  ['twitter:card', /<meta name="twitter:card" content="summary_large_image"/],
  ['JSON-LD', /<script type="application\/ld\+json">/],
  ['html lang="en"', /<html lang="en"/],
]) {
  check(re.test(index), `build: index ${what}`, 'missing');
}
// The site is launched: a noindex on the home page would drop it from search.
const noindex = /name="robots" content="noindex"/.test(index);
check(!noindex, 'build: index is indexable', 'noindex is on');
const robots = existsSync('dist/robots.txt') ? readFileSync('dist/robots.txt', 'utf8') : '';
check(
  /^Sitemap: https?:\/\//m.test(robots),
  'build: robots.txt names the sitemap',
  'no Sitemap line',
);
const sitemap = existsSync('dist/sitemap.xml') ? readFileSync('dist/sitemap.xml', 'utf8') : '';
check(
  sitemap.includes(`<loc>${site}`),
  'build: sitemap.xml lists the site',
  `no <loc> for ${site}`,
);

// ----------------------------------------------------------------- repo ----
const run = (cmd, argv) => spawnSync(cmd, argv, { encoding: 'utf8' });
const audit = run('npm', ['audit', '--json']);
try {
  const v = JSON.parse(audit.stdout).metadata.vulnerabilities;
  check(v.total === 0, 'repo: npm audit clean', `${v.total} vulnerabilities; npm audit for detail`);
} catch {
  report('SKIP', 'repo: npm audit', 'no result (offline?)');
}
// Brand files mirrored byte for byte from the app's main (CONTEXT.md, Brand
// assets). Compared through gh, so this needs it signed in.
const APP_REPO = 'kerti/balances-v2';
const MIRRORS = {
  'public/favicon.svg': 'frontend/public/favicon.svg',
  'public/apple-touch-icon.png': 'frontend/public/icons/apple-touch-icon.png',
};

let repo = null;
try {
  repo = execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  report('SKIP', 'repo: GitHub settings', 'gh not available or not signed in');
}
if (repo && !local) {
  for (const [ours, theirs] of Object.entries(MIRRORS)) {
    const app = spawnSync(
      'gh',
      ['api', '-H', 'Accept: application/vnd.github.raw', `repos/${APP_REPO}/contents/${theirs}`],
      { maxBuffer: 1 << 24 },
    );
    if (app.status !== 0) {
      report('SKIP', `repo: ${ours} matches the app`, `could not read ${APP_REPO}/${theirs}`);
      continue;
    }
    check(
      app.stdout.equals(readFileSync(ours)),
      `repo: ${ours} matches the app`,
      `differs from ${APP_REPO} ${theirs}; copy the app's file over`,
    );
  }
  const gh = (path, jq) => run('gh', ['api', path, '--jq', jq]);
  const prot = gh(
    `repos/${repo}/branches/main/protection`,
    '.required_status_checks.contexts | join(", ")',
  );
  check(
    prot.status === 0 && prot.stdout.trim(),
    'repo: main protected with required checks',
    'no protection or no required checks',
  );
  const del = gh(`repos/${repo}`, '.delete_branch_on_merge');
  check(
    del.stdout.trim() === 'true',
    'repo: delete_branch_on_merge',
    `is ${del.stdout.trim() || 'unknown'}`,
  );
  const alertsOn = run('gh', ['api', `repos/${repo}/vulnerability-alerts`, '--silent']);
  check(alertsOn.status === 0, 'repo: Dependabot alerts on', 'off, or no admin access');
  const open = gh(`repos/${repo}/dependabot/alerts?state=open`, 'length');
  if (open.status === 0)
    check(
      open.stdout.trim() === '0',
      'repo: no open Dependabot alerts',
      `${open.stdout.trim()} open`,
    );
}

// ----------------------------------------------------------------- live ----
async function get(path, opts = {}) {
  try {
    const res = await fetch(base + path, { redirect: 'manual', ...opts });
    return { res, body: opts.method === 'HEAD' ? '' : await res.text() };
  } catch (err) {
    return { res: null, body: '', err };
  }
}

let beaconLive = false;
let beaconBlocked = false;
// Whether a CSP stops <script src="https://host/..."> from loading: script-src,
// else default-src, must exist and allow neither the host nor a wildcard.
function blocksScriptHost(policy, host) {
  const dirs = Object.fromEntries(
    policy
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...values]) => [name.toLowerCase(), values]),
  );
  const values = dirs['script-src'] ?? dirs['default-src'];
  if (!values) return false;
  return !values.some((v) => {
    const src = v.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return (
      v === '*' ||
      v === 'https:' ||
      v === 'http:' ||
      src === host ||
      (src.startsWith('*.') && host.endsWith(src.slice(1)))
    );
  });
}
if (local || !base) {
  report('SKIP', 'live: all', local ? '--local' : 'no site in astro.config.mjs and no --url');
} else {
  const home = await get('/', { headers: BROWSER });
  if (!home.res) {
    report('FAIL', `live: ${base} reachable`, String(home.err?.cause ?? home.err));
  } else {
    const h = home.res.headers;
    check(home.res.status === 200, 'live: home answers 200', `answered ${home.res.status}`);
    check(
      /frame-ancestors 'none'/.test(h.get('content-security-policy') ?? ''),
      'live: CSP header (frame-ancestors)',
      'missing; is public/_headers deployed?',
    );
    check(
      h.get('x-frame-options') === 'DENY',
      'live: X-Frame-Options DENY',
      `is ${h.get('x-frame-options')}`,
    );
    check(
      h.get('x-content-type-options') === 'nosniff',
      'live: X-Content-Type-Options nosniff',
      `is ${h.get('x-content-type-options')}`,
    );
    check(!!h.get('referrer-policy'), 'live: Referrer-Policy', 'missing');
    check(!!h.get('permissions-policy'), 'live: Permissions-Policy', 'missing');
    const tld = new URL(base).hostname.split('.').pop();
    if (PRELOADED_TLDS.includes(tld))
      report('PASS', 'live: HSTS', `.${tld} is HSTS-preloaded as a whole`);
    else
      check(
        /max-age=\d{7,}/.test(h.get('strict-transport-security') ?? ''),
        'live: HSTS',
        `.${tld} is not preloaded; add Strict-Transport-Security`,
      );

    // The zone injects Cloudflare's Web Analytics beacon. The maintainer keeps
    // it on (2026-11-11) because the CSP refuses it, so nothing is collected.
    // That holds only while every policy on the page blocks its script host:
    // a PASS with a note while blocked, a FAIL the day it could run (ADR-0001).
    beaconLive = /cloudflareinsights/.test(home.body);
    const policies = [
      h.get('content-security-policy') ?? '',
      ...[
        ...home.body.matchAll(/<meta http-equiv="content-security-policy" content="([^"]+)"/gi),
      ].map((m) =>
        m[1]
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&'),
      ),
    ];
    beaconBlocked = policies.some((p) => blocksScriptHost(p, 'static.cloudflareinsights.com'));
    if (!beaconLive) report('PASS', 'live: no Cloudflare Web Analytics beacon');
    else
      check(
        beaconBlocked,
        'live: Cloudflare Web Analytics beacon blocked by CSP',
        'the zone injects beacon.min.js and no CSP refuses it: visitor data is being collected; block it or turn Web Analytics off in the Cloudflare dashboard',
      );
    if (beaconLive && beaconBlocked)
      results.at(-1)[2] = 'known: injected by the zone, kept on by choice, refused by the CSP';
    check(
      !/data:font/.test(home.body),
      'live: no data: fonts',
      'the live page inlines a font the CSP refuses',
    );

    const liveAssets = astroAssets(home.body);
    const localAssets = astroAssets(index);
    const same =
      liveAssets.size === localAssets.size && [...localAssets].every((a) => liveAssets.has(a));
    report(
      same ? 'PASS' : 'WARN',
      'live: serves the same build as dist/',
      same
        ? ''
        : 'hashed assets differ: the deploy is behind (or ahead of) this checkout; check Cloudflare Pages',
    );

    const asset = [...liveAssets][0];
    if (asset) {
      const a = await get(asset, { method: 'HEAD' });
      check(
        /immutable/.test(a.res?.headers.get('cache-control') ?? ''),
        'live: /_astro/* cached immutable',
        `cache-control: ${a.res?.headers.get('cache-control')}`,
      );
    }
    const missing = await get(`/launch-check-${Date.now()}`, { headers: BROWSER });
    check(
      missing.res?.status === 404,
      'live: a missing path answers 404',
      `answered ${missing.res?.status}`,
    );
    // The share image at the exact URL the page names (it carries ?v=<hash>).
    const ogUrl = index.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    const ogPath = ogUrl ? new URL(ogUrl).pathname + new URL(ogUrl).search : '/og.png';
    for (const f of ['/robots.txt', '/sitemap.xml', ogPath, '/apple-touch-icon.png']) {
      const r = await get(f, { method: 'HEAD' });
      check(r.res?.status === 200, `live: ${f} answers 200`, `answered ${r.res?.status}`);
    }
  }
}

// ----------------------------------------------------------- lighthouse ----
if (lighthouse && !local && base) {
  const dir = mkdtempSync(join(tmpdir(), 'launch-check-'));
  for (const form of ['mobile', 'desktop']) {
    const out = join(dir, `${form}.json`);
    const lh = run('npx', [
      '--yes',
      LIGHTHOUSE,
      `${base}/`,
      ...(form === 'desktop' ? ['--preset=desktop'] : []),
      '--chrome-flags=--headless=new',
      '--output=json',
      `--output-path=${out}`,
      '--quiet',
    ]);
    if (lh.status !== 0 || !existsSync(out)) {
      report('FAIL', `lighthouse ${form}`, (lh.stderr || 'did not run').trim().split('\n').pop());
      continue;
    }
    const r = JSON.parse(readFileSync(out, 'utf8'));
    for (const id of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const score = Math.round(r.categories[id].score * 100);
      const failing = Object.values(r.audits)
        .filter(
          (a) =>
            a.score !== null && a.score < 0.9 && ['binary', 'numeric'].includes(a.scoreDisplayMode),
        )
        .filter((a) => r.categories[id].auditRefs.some((ref) => ref.id === a.id && ref.weight > 0))
        .map((a) => a.id);
      // Best practices sits at 92 while the zone injects the beacon our CSP
      // refuses (the beacon line above): the console logs the refusal. Known,
      // so a PASS with a note when that is the only cause.
      const beaconOnly =
        id === 'best-practices' &&
        beaconLive &&
        beaconBlocked &&
        failing.every((f) => ['errors-in-console', 'inspector-issues'].includes(f));
      report(
        score >= 95 || beaconOnly ? 'PASS' : 'FAIL',
        `lighthouse ${form} ${id} ${score}`,
        score >= 95 ? '' : beaconOnly ? 'known: the CSP refusing the beacon' : failing.join(', '),
      );
    }
  }
  report('PASS', 'lighthouse reports', dir);
}

// --------------------------------------------------------------- report ----
const width = Math.max(...results.map(([, w]) => w.length));
for (const [status, what, detail] of results) {
  console.log(`${status.padEnd(4)}  ${what.padEnd(width)}  ${detail}`.trimEnd());
}
const count = (s) => results.filter(([x]) => x === s).length;
console.log(
  `\nlaunch-check: ${count('PASS')} pass, ${count('WARN')} warn, ${count('FAIL')} fail, ${count('SKIP')} skip`,
);
process.exit(count('FAIL') ? 1 : 0);
