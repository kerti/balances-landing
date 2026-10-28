// Candidate widths for a screenshot's srcset: from a phone at 1x to a wide
// laptop at 2x, capped at the file's own width (Astro never upscales). Each
// <Image> pairs this with a `sizes` that matches how wide its CSS lays it out.
const steps = [480, 800, 1200, 1600, 2400];

export const widthsFor = (width: number) => [...steps.filter((w) => w < width), width];
