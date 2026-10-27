// Draws the share image's source, docs/brand/og-card.svg, as a still of the
// hero: the eyebrow, headline, subline and chips on the left, the hero's
// net-worth line with its month-end dots on the right. `npm run og` runs this
// and renders the SVG to public/og.png.
//
// The line is the page's own illustrative household (src/components/
// net-worth.ts), and the wordmark is the outlined asset the header ships, so
// the card can't drift from the page. No tooltip: unreadable at share size.
import { readFileSync, writeFileSync } from 'node:fs';
import { earlierYears, lastYear } from '../src/components/net-worth.ts';

const width = 1280;
const height = 640;
const left = 100;

// Brand colours on the graphite plate, as the app's social card uses them.
const plate = '#14161A';
const ink = '#E8E6E1';
const brass = '#C79A4E';
const muted = '#9A958B';
const rule = '#2A2E35';
const chip = '#1C1F24'; // solid, so the line can pass behind a chip
const font = 'Helvetica,Arial,sans-serif';

// The wordmark: the header's outlined SVG, scaled to sit at the top left.
const wordmark = readFileSync(new URL('../public/brand/wordmark-dark.svg', import.meta.url), 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');
const wordmarkScale = 0.74;
const wordmarkLeftPad = 6; // the SVG's own inset before the "b"

// The whole line runs across the card at one scale, a month-end every
// `step`, from the first month-end three years ago (below the bottom edge,
// so the line enters a little way in) to this one near the top right. Low
// enough to pass under the subline; the card's year, with its dots, rises on
// the right.
const yearTo = 1180;
const step = (yearTo + 10) / (earlierYears.length + lastYear.length - 1);
const yearFrom = yearTo - (lastYear.length - 1) * step;
const yStart = 718;
const yNow = 270;
const first = earlierYears[0];
const y = (value: number) =>
  yStart - ((value - first) / (lastYear.at(-1)! - first)) * (yStart - yNow);
const points = lastYear.map((value, i) => ({ x: yearFrom + i * step, y: y(value) }));
const earlier = [...earlierYears, lastYear[0]].map((value, i) => ({
  x: yearFrom + (i - earlierYears.length) * step,
  y: y(value),
}));
const path = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
const line = path(points);
// Below the line the card takes a second, warmer tone: the one variation
// in the background.
const below = `${path([...earlier, ...points.slice(1)])} L${yearTo} ${height} L${earlier[0].x.toFixed(1)} ${height} Z`;
const now = points.at(-1)!;

// Chips, sized from their labels (Helvetica at 22px averages about 0.55em a
// character). Solid, so the line can pass behind them.
const chipLabels = ['AGPL-3.0 open source', 'Self-hostable', 'Multi-currency'];
let chipX = left;
const chips = chipLabels.map((label) => {
  const w = 22 * label.length * 0.55 + 48;
  const pill =
    `<rect x="${chipX.toFixed(0)}" y="548" width="${w.toFixed(0)}" height="48" rx="24" fill="${chip}" stroke="${rule}" stroke-width="1.5"/>` +
    `<text x="${(chipX + w / 2).toFixed(0)}" y="579" text-anchor="middle">${label}</text>`;
  chipX += w + 14;
  return pill;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="below" gradientUnits="userSpaceOnUse" x1="0" y1="${yNow}" x2="0" y2="${height}">
      <stop offset="0" stop-color="${brass}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${brass}" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${plate}"/>
  <g stroke="${brass}" stroke-opacity="0.16" stroke-dasharray="2 5">
    ${points.map((p) => `<line x1="${p.x.toFixed(1)}" x2="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" y2="${height}"/>`).join('')}
  </g>
  <path d="${below}" fill="url(#below)"/>
  <path d="${path(earlier)}" fill="none" stroke="${brass}" stroke-opacity="0.45" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="${line}" fill="none" stroke="${brass}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
  <g fill="${plate}" stroke="${brass}" stroke-width="3">
    ${points
      .slice(0, -1)
      .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7"/>`)
      .join('')}
  </g>
  <circle cx="${now.x}" cy="${now.y.toFixed(1)}" r="10" fill="${brass}" stroke="${brass}" stroke-opacity="0.3" stroke-width="12" paint-order="stroke"/>
  <g transform="translate(${left - wordmarkLeftPad * wordmarkScale},64) scale(${wordmarkScale})">${wordmark}</g>
  <rect x="${left + 1}" y="242" width="11" height="11" fill="${brass}" transform="rotate(45 ${left + 6.5} 247.5)"/>
  <text x="${left + 26}" y="255" font-family="${font}" font-weight="600" font-size="20" letter-spacing="3.6" fill="${muted}">EASY NET WORTH TRACKING FOR HOUSEHOLDS</text>
  <g font-family="${font}" font-weight="700" font-size="54">
    <text x="${left}" y="330" fill="${ink}">Track your net worth,</text>
    <text x="${left}" y="398" fill="${brass}">not your coffee money.</text>
  </g>
  <text x="${left}" y="470" font-family="${font}" font-size="28" fill="${muted}">Enter your balances once a month. That’s it.</text>
  <g font-family="${font}" font-weight="500" font-size="22" fill="${muted}">
    ${chips.join('')}
  </g>
</svg>
`;

writeFileSync(new URL('../docs/brand/og-card.svg', import.meta.url), svg);
