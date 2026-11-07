#!/usr/bin/env node
/**
 * Builds every app icon from one design: a hearth flame above the well water,
 * with its light shimmering on the surface.
 *
 *   npm run icons
 *
 * Edit the mark below, then rerun. The script writes viewable SVG sources to
 * assets/source/ and the PNGs that app.json points to into assets/.
 *
 * Coordinates are on a 1024×1024 canvas.
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const SOURCE = join(ASSETS, 'source');

// Palette (matches src/theme/tokens.ts, dark scheme).
const SOOT = '#14110F';
const SOOT_LIGHT = '#2E2621';
const AMBER = '#E0A04B';
const EMBER = '#D9693D';
const FROST = '#9FC2D6';

// ---------------------------------------------------------------------------
// The mark
// ---------------------------------------------------------------------------

/** Outer flame, drawn with its base at y = 764 and tip at y = 196. */
const FLAME =
  'M512 196 C 548 286, 668 368, 676 520 C 684 664, 604 760, 512 764 C 420 760, 340 664, 348 548 ' +
  'C 354 462, 400 410, 436 376 C 438 444, 458 486, 492 506 C 474 418, 476 300, 512 196 Z';
/** The bright core of the flame. */
const CORE =
  'M512 456 C 540 512, 604 556, 604 638 C 604 702, 562 744, 512 746 C 462 744, 420 702, 420 640 ' +
  'C 420 586, 462 548, 486 520 C 490 560, 500 578, 516 588 C 508 540, 500 496, 512 456 Z';

/** Where the flame sits, and its size. */
const FLAME_PLACEMENT = 'translate(512 620) scale(0.68) translate(-512 -764)';

/** The waterline, then the reflection stripes beneath it: [y, x1, x2, color, opacity]. */
const LINES = [
  [644, 256, 768, FROST, 1],
  [704, 392, 632, AMBER, 0.85],
  [760, 432, 592, EMBER, 0.65],
  [812, 470, 554, FROST, 0.5],
];
const LINE_WIDTH = 16;

/** Bounding box of the mark (flame tip to lowest stripe, including round caps). */
const BOX = { x1: 248, y1: 234, x2: 776, y2: 820 };
const CENTER = { x: (BOX.x1 + BOX.x2) / 2, y: (BOX.y1 + BOX.y2) / 2 };

const DEFS = `
  <radialGradient id="bg" cx="50%" cy="42%" r="70%">
    <stop offset="0" stop-color="${SOOT_LIGHT}"/><stop offset="1" stop-color="${SOOT}"/>
  </radialGradient>
  <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F2B85A"/><stop offset="1" stop-color="${EMBER}"/>
  </linearGradient>
  <linearGradient id="core" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FCE6A8"/><stop offset="1" stop-color="#F6C46A"/>
  </linearGradient>
  <mask id="flame-with-core" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <path d="${FLAME}" fill="#fff"/><path d="${CORE}" fill="#000"/>
  </mask>`;

function lines(color) {
  return LINES.map(
    ([y, x1, x2, c, opacity]) =>
      `<path d="M${x1} ${y} H${x2}" stroke="${color ?? c}" stroke-opacity="${opacity}" ` +
      `stroke-width="${LINE_WIDTH}" stroke-linecap="round"/>`,
  ).join('');
}

/** The full-colour mark. */
function colourMark() {
  return `<g transform="${FLAME_PLACEMENT}"><path d="${FLAME}" fill="url(#flame)"/><path d="${CORE}" fill="url(#core)"/></g>${lines()}`;
}

/** A single-colour mark (the core is cut out of the flame so the shape still reads). */
function solidMark(color) {
  return (
    `<g transform="${FLAME_PLACEMENT}"><rect width="1024" height="1024" fill="${color}" mask="url(#flame-with-core)"/></g>` +
    lines(color)
  );
}

/** Scale the mark about its centre and move that centre to the middle of the canvas. */
function placed(mark, scale) {
  return `<g transform="translate(512 512) scale(${scale}) translate(${-CENTER.x} ${-CENTER.y})">${mark}</g>`;
}

function svg(body, { background = false } = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">` +
    `<defs>${DEFS}</defs>` +
    (background ? `<rect width="1024" height="1024" fill="url(#bg)"/>` : '') +
    body +
    `</svg>`
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

/**
 * Android adaptive icons show only the middle 72 of 108 dp, and keep the
 * important part inside a 66 dp circle; this scale keeps the mark the same
 * apparent size as on iOS and inside that circle.
 */
const ADAPTIVE_SCALE = 0.72;

const VARIANTS = [
  // iOS and the store listing: full square, opaque, no transparency.
  { name: 'icon', size: 1024, opaque: true, svg: svg(colourMark(), { background: true }) },
  // Android adaptive icon layers.
  { name: 'android-icon-background', size: 1024, svg: svg('', { background: true }) },
  { name: 'android-icon-foreground', size: 1024, svg: svg(placed(colourMark(), ADAPTIVE_SCALE)) },
  // Android 13+ themed icons: the launcher tints this shape with the wallpaper colours.
  { name: 'android-icon-monochrome', size: 1024, svg: svg(placed(solidMark('#FFFFFF'), ADAPTIVE_SCALE)) },
  // Android status-bar notifications must be a white silhouette on transparency.
  { name: 'notification-icon', size: 96, svg: svg(placed(solidMark('#FFFFFF'), 1.45)) },
  // Splash screen: the mark alone on the splash background colour.
  { name: 'splash-icon', size: 1024, svg: svg(placed(colourMark(), 1)) },
  // Web.
  { name: 'favicon', size: 48, opaque: true, svg: svg(colourMark(), { background: true }) },
];

function render(source, size, opaque) {
  const image = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render();
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.pixels);
  if (!opaque) return PNG.sync.write(png);
  for (let i = 3; i < png.data.length; i += 4) {
    if (png.data[i] !== 255) throw new Error('An opaque icon has transparent pixels');
  }
  // iOS rejects app icons with an alpha channel, so write plain RGB.
  return PNG.sync.write(png, { colorType: 2, inputColorType: 6, inputHasAlpha: true });
}

mkdirSync(SOURCE, { recursive: true });
for (const variant of VARIANTS) {
  writeFileSync(join(SOURCE, `${variant.name}.svg`), variant.svg + '\n');
  writeFileSync(join(ASSETS, `${variant.name}.png`), render(variant.svg, variant.size, variant.opaque));
  console.log(`assets/${variant.name}.png  ${variant.size}×${variant.size}${variant.opaque ? '  (opaque RGB)' : ''}`);
}
