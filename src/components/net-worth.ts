// The illustrative household behind every net-worth line on the page: one
// month-end a month, from a first month-end three years ago to this one. The
// hero draws the last twelve in its card and the rest behind it; the Open
// source section draws all of it faintly. There are no real figures here, so
// nothing can go stale.

/** The last twelve month-ends, oldest first: the hero card's year. */
export const lastYear = [90, 95, 93, 100, 106, 104, 112, 119, 117, 126, 134, 143];

// The months before that year, walked back from its first month to a first
// month-end three years before this one, with a repeating set of monthly falls
// so the line stays believably uneven. The few months just before the year
// climb more steeply, a burst before the stretch the card shows.
const steps = [4, 2, 5, 3, -1, 4, 3, 5, 2, 4, -1, 4];
const burst = [7, 9, 7, 8];

/** The month-ends before the card's year, oldest first. */
export const earlierYears: number[] = [];
for (let i = 0, value = lastYear[0]; i < 36 - (lastYear.length - 1); i++) {
  value -= burst[i] ?? steps[i % steps.length];
  earlierYears.unshift(value);
}

/** All 37 month-ends, from the first, three years ago, to this one. */
export const allMonthEnds = [...earlierYears, ...lastYear];

// Only the shape is ever drawn: no axis is labelled or starts at zero. Read as
// money, the series sits on an offset chosen so the three years grow about
// 16%, roughly 5% a year, in line with the 4–5.5% a year (real) that an
// average Indonesian adult's net wealth typically grows. Shifting the series
// doesn't move a single point of any drawing.
const growth = 0.16;
const offset = (lastYear.at(-1)! - (1 + growth) * earlierYears[0]) / growth;

/** Percentage change between two month-ends, as money (see the offset above). */
export const percentChange = (from: number, to: number) =>
  ((allMonthEnds[to] + offset) / (allMonthEnds[from] + offset) - 1) * 100;
