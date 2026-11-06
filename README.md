# Hearth & Well

A companion app for modern Heathen practice, grounded in the sources. It runs natively
on iOS and Android, built with React Native and Expo.

See [docs/PITCH.md](docs/PITCH.md) for the product vision, features, design language
and the funding model.

## Status

The foundation is built:

- **Design system**: soot/amber palette (dark-first, with light mode and a "follow
  system" option), EB Garamond and Inter fonts with full Old Norse character
  support, and shared components.
- **The Wheel**: a calendar of eight holy tides with three reckonings (solar, lunar,
  Old Icelandic), southern-hemisphere flipping, an SVG year dial, and a detail page
  for each tide with its sources labelled by tier.
- **The Hearth** home screen: the next holy tide, today's moon phase, and what's
  coming up.
- **Settings**: reckoning, hemisphere and appearance, saved on the device.
- **i18n**: every string is in `src/i18n/locales/en.json`, ready for translation.

The Well (lore library) currently shows the source-tier legend; the texts come next.

## Getting started

```bash
npm install
npm start          # then press i (iOS simulator), a (Android emulator), or scan with Expo Go
```

Checks:

```bash
npm test           # unit tests (calendar and astronomy logic), run in UTC
npm run typecheck
npm run lint
```

Native builds use [EAS](https://docs.expo.dev/eas/): `npx eas-cli@latest build`.
The `ios/` and `android/` folders are generated; don't edit them by hand.

## Project layout

```
src/
  app/                  Expo Router screens (every file is a route)
    (tabs)/             Hearth, Wheel, Well, Settings
    tide/[id].tsx       Holy tide detail
  components/           Shared UI (AppText, Card, TierBadge, MoonGlyph, …)
  features/
    settings/           Settings context (AsyncStorage)
    wheel/              Calendar engine, tide definitions, dial
  i18n/                 i18next setup, date formatting, locale files
  theme/                Design tokens and theme provider
docs/                   Pitch and content guidelines
```

## How dates are calculated

Solstices, equinoxes and moon phases come from
[astronomy-engine](https://github.com/cosinekitty/astronomy), so they work offline.
Each tide has a date rule per reckoning (`src/features/wheel/tides.ts`):

| Rule | Example |
|---|---|
| `season` | Yule on the winter solstice |
| `crossQuarter` | Freyfaxi midway between the summer solstice and autumn equinox |
| `weekdayInWindow` | First day of winter: the Saturday between 21 and 27 October |
| `fullMoon` | Lunar Yule: the first full moon on or after the winter solstice |

In the southern hemisphere, seasonal events swap, and calendar windows move by six
months, so every tide keeps its season.

## Content

Lore content follows the source-tier rules in [docs/CONTENT.md](docs/CONTENT.md).
