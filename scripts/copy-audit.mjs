// Copy audit: the mechanical half of CONTEXT.md (the naming law, claims
// discipline, voice and the style rules), run over what a visitor (or a
// crawler, or a screen reader) actually gets. Ported from Uruni's landing
// (kerti/uruni-landing, scripts/copy-audit.mjs), rules rewritten for English.
//
//   npm run copy-audit                  every page in dist/ (run npm run build first)
//   npm run copy-audit -- --url https://<preview>.pages.dev/
//
// Each page is rendered in Chrome with every <details> opened and
// text-transform switched off (an uppercase eyebrow would otherwise read as
// "BALANCES"), and the audit reads its visible text plus the copy a visitor
// meets without seeing it: the title, meta and share tags, JSON-LD, alt text
// and aria-labels.
//
// FAIL lines break a written rule and exit 1. REVIEW lines are heuristics or
// words that are fine in the right place (the FAQ names a non-feature on
// purpose); a person reads each one. The judgment half of the audit (claims,
// voice, X-not-Y contrasts, three-item lists) is in
// .claude/skills/copy-audit/SKILL.md.
/* global document */
import { readdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { serveDist } from './lib/serve-dist.mjs';

const args = process.argv.slice(2);
const urlArg = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
const chromePath =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Hard rules: a hit is a defect.
const FAIL = [
  ['em dash', /—/g],
  ['dash used as a pause (en dash between spaces)', / – /g],
  ['straight double quote (curly quotes everywhere)', /"/g],
  ['straight apostrophe (curly ’ everywhere)', /(?<=\p{L})'(?=\p{L})|(?<=\s)'(?=\p{L})/gu],
  ['naming law: BALANCES', /\bBALANCES\b/g],
  ['naming law: Balance (singular) for the product', /\bBalance\b/g],
  [
    'naming law: lowercase balances as the product',
    /(?<![./@-])\bbalances (is|isn’t|tracks|keeps|shows|computes|charts|runs|lets|does|doesn’t|never|stores|works)\b/g,
  ],
  ['vocabulary: position (the app never says it, balances-v2#832)', /\bpositions?\b/gi],
  ['exclamation mark', /!/g],
  [
    'slop: stock phrase',
    /\b(game[- ]changer|level up|supercharge\w*|revolutioni[sz]\w*|say goodbye to|look no further|it’s that simple|in today’s|unlock\w*|seamless(ly)?|effortless(ly)?|empower\w*|elevate\w*)\b/gi,
  ],
  ['slop: urgency', /\b(hurry|limited time|act now|don’t miss)\b/gi],
  [
    'claims: no hosted signup or waitlist',
    /\b(sign ?up|waitlist|free trial|create (an|your) account)\b/gi,
    // "No signup." and the FAQ's "...can I sign up for? No." say it isn't offered.
    /\bNo $/,
    /^ for\?\s+No\b/,
  ],
  ['claims: version number or stage badge', /\bv\d+\.\d+|\b(alpha|beta)\b/gi],
  // British spelling. "size", "seize" and "citizen" are not -ize verbs.
  [
    'spelling: British -ise/-yse',
    /\b\p{L}{2,}(?<!s)(?<!ci)(i|y)z(e|es|ed|ing|ation|ations|er|ers)\b/giu,
  ],
  [
    'spelling: British -our/-re',
    /\b(colors?|colored|favorite|favor\w*|center\w*|behavior\w*|neighbor\w*|honor\w*|gray)\b/gi,
  ],
];

// Heuristics and words that are allowed in context.
const REVIEW = [
  [
    'serial comma (the rule is none: “a, b and c”)',
    /\b[\p{L}-]+, [\p{L}-]+(?: [\p{L}-]+)?, (and|or) [\p{L}-]+/gu,
  ],
  [
    'list of three (wary of them; does the third item earn its place?)',
    /\b[\p{L}-]+, [\p{L}-]+(?: [\p{L}-]+)? (and|or) [\p{L}-]+(?: [\p{L}-]+)?(?=[.,;:)])/gu,
  ],
  [
    'claims: churn-prone or absent feature (right only when the page says it isn’t offered)',
    /\b(import(s|er|ers|ing)?|tags?|analytics|forecasts?|projections?|predict\w*|AI|bank[- ]sync\w*|app store|play store|mobile app|reminders?|notifications?|offline)\b/g,
  ],
  [
    '“X, not Y” contrast (few, never in two headings)',
    // The canonical headline (CONTEXT.md) is the one approved contrast; the
    // title and share tags repeat it on purpose.
    /\b[^.,;:\n]{1,50}, not\b[^.\n]{1,50}/g,
    null,
    null,
    /net\sworth,\snot\syour\scoffee\smoney/,
  ],
  ['“not X, but Y” contrast', /\bnot\b[^.\n]{1,60}, but\b/gi],
  [
    'number and unit that may break apart (needs a no-break space)',
    /\b\d[\d.,]* (years?|months?|weeks?|days?|minutes?|accounts?|currencies)\b/g,
  ],
];

const context = (text, index, length) =>
  text
    .slice(Math.max(0, index - 40), index + length + 40)
    .replace(/\s+/g, ' ')
    .trim();

function audit(page, chunks) {
  const out = { fail: [], review: [] };
  for (const [where, text] of chunks) {
    for (const [kind, rules] of [
      ['fail', FAIL],
      ['review', REVIEW],
    ]) {
      for (const [rule, re, skipWhenBefore, skipWhenAfter, allowed] of rules) {
        for (const m of text.matchAll(re)) {
          const end = m.index + m[0].length;
          if (skipWhenBefore?.test(text.slice(Math.max(0, m.index - 40), m.index))) continue;
          if (skipWhenAfter?.test(text.slice(end, end + 40))) continue;
          if (allowed?.test(m[0])) continue;
          out[kind].push(`${page} [${where}] ${rule}: “…${context(text, m.index, m[0].length)}…”`);
        }
      }
    }
  }
  return out;
}

// Phrases of four words or more that the page says three times or more
// (CONTEXT.md: don't repeat in prose what a chip or list already says).
function repeats(page, text) {
  const words = text.toLowerCase().match(/[\p{L}\d’]+/gu) ?? [];
  const counts = new Map();
  for (let i = 0; i + 4 <= words.length; i++) {
    const gram = words.slice(i, i + 4).join(' ');
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, n]) => n >= 3)
    .map(([gram, n]) => `${page} [text] phrase said ${n} times: “${gram}”`);
}

async function readPage(browser, url) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  // The page's CSP blocks an injected <style>, so text-transform goes off
  // element by element.
  const data = await page.evaluate(() => {
    document.querySelectorAll('details').forEach((d) => (d.open = true));
    document
      .querySelectorAll('*')
      .forEach((el) => el.style.setProperty('text-transform', 'none', 'important'));
    const attr = (sel, name) =>
      [...document.querySelectorAll(sel)].map((el) => el.getAttribute(name)).filter(Boolean);
    const jsonStrings = [];
    const walk = (v) =>
      typeof v === 'string'
        ? /^https?:/.test(v) || jsonStrings.push(v)
        : v && typeof v === 'object' && Object.values(v).forEach(walk);
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      walk(JSON.parse(s.textContent));
    }
    return {
      text: document.body.innerText,
      title: document.title,
      meta: attr(
        'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]',
        'content',
      ).filter((c) => !/^(https?:|\d+$|summary)/.test(c) && !/^[a-z_]+$/i.test(c)),
      alt: attr('img[alt]', 'alt'),
      aria: [
        ...attr('[aria-label]', 'aria-label'),
        ...attr('[title]', 'title'),
        ...[...document.querySelectorAll('svg title')].map((t) => t.textContent),
      ],
      jsonLd: jsonStrings,
    };
  });
  await page.close();
  return data;
}

const pages = urlArg
  ? [['/', urlArg]]
  : readdirSync('dist')
      .filter((f) => f.endsWith('.html'))
      .map((f) => [f === 'index.html' ? '/' : `/${f}`, null]);

const served = urlArg ? null : await serveDist('copy-audit');
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const fail = [];
const review = [];
try {
  for (const [path, url] of pages) {
    const d = await readPage(browser, url ?? new URL(path, served.base).href);
    const name = path === '/' ? 'index' : path.slice(1);
    const r = audit(name, [
      ['text', d.text],
      ['title', d.title],
      ['meta', [...new Set(d.meta)].join('\n')],
      ['alt', d.alt.join('\n')],
      ['aria/title', d.aria.join('\n')],
      ['json-ld', d.jsonLd.join('\n')],
    ]);
    fail.push(...r.fail);
    review.push(...r.review, ...repeats(name, d.text));
  }
} finally {
  await browser.close();
  served?.close();
}

for (const line of fail) console.log(`FAIL   ${line}`);
for (const line of review) console.log(`REVIEW ${line}`);
console.log(
  `\ncopy-audit: ${pages.length} page(s), ${fail.length} fail, ${review.length} to review`,
);
process.exit(fail.length ? 1 : 0);
