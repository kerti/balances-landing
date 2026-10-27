// The illustrative household behind every net-worth line on the page: one
// month-end a month, from a first month-end three years ago to this one. The
// hero draws the last twelve in its card and the rest behind it; the Open
// source section draws all of it faintly. There are no real figures here, so
// nothing can go stale.
//
// Written out by hand, month by month, to read like a real household's year
// rather than a formula: salary saving by uneven amounts most months, a
// holiday-spending dip some Decembers, the religious-holiday bonus (THR)
// landing in April at a different size each year, school fees taken in July,
// a house revalued one January, and a market slide in early 2025 that takes
// a couple of months to recover.

/** All 37 month-ends, oldest first: October 2023 to October 2026. */
// prettier-ignore
export const allMonthEnds = [
  // Oct 2023
  0,
  // Nov–Dec 2023, Jan–Oct 2024
  6, 2, 11, 16, 14, 30, 34, 37, 28, 36, 42, 41,
  // Nov 2024–Oct 2025
  48, 50, 64, 59, 48, 61, 70, 73, 72, 81, 86, 84,
  // Nov 2025–Oct 2026: the hero card's year
  94, 89, 97, 105, 101, 120, 125, 123, 115, 126, 134, 142,
];

/** The last twelve month-ends, oldest first: the hero card's year. */
export const lastYear = allMonthEnds.slice(-12);

/** The month-ends before the card's year, oldest first. */
export const earlierYears = allMonthEnds.slice(0, -12);

// Only the shape is ever drawn: no axis is labelled or starts at zero. Read as
// money, the series sits on an offset chosen so the three years grow 16%,
// about 5% a year, in line with the 4–5.5% a year (real) that an average
// Indonesian adult's net wealth typically grows. Shifting the series doesn't
// move a single point of any drawing.
const growth = 0.16;
const offset = (allMonthEnds.at(-1)! - (1 + growth) * allMonthEnds[0]) / growth;

/** Percentage change between two month-ends, as money (see the offset above). */
export const percentChange = (from: number, to: number) =>
  ((allMonthEnds[to] + offset) / (allMonthEnds[from] + offset) - 1) * 100;
