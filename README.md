# Hearth & Well

A companion app for modern Heathen practice, grounded in the sources. It runs natively
on iOS and Android, built with React Native and Expo.

See [docs/PITCH.md](docs/PITCH.md) for the product vision, features, design language
and the funding model.

## Status

- **Design system**: soot/amber palette (dark-first, with light mode and a "follow
  system" option), EB Garamond and Inter fonts with full Old Norse character
  support, and shared components.
- **The Wheel**: a calendar of eight holy tides with three reckonings (solar, lunar,
  Old Icelandic), southern-hemisphere flipping, an SVG year dial, and a detail page
  for each tide with its sources labelled by tier and a prep checklist saved on
  the device.
- **Reminders**: opt-in local notifications before and on each holy tide (lead time
  and hour are configurable). Tapping one opens the tide. Native apps only.
- **The Well**: the complete Hávamál and Völuspá in Henry Adams Bellows' 1923
  translation (public domain), with his introductions and notes.
- **The Hearth** home screen: the next holy tide and its prep progress, a stanza of
  the day with a reflection prompt, today's moon phase, and what's coming up.
- **Settings**: reckoning, hemisphere, reminders and appearance, saved on the device.
- **i18n**: every interface string is in `src/i18n/locales/en.json`, ready for
  translation.

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
  content/poems/        Imported Eddic poems (JSON) and their types
  features/
    daily/              Stanza of the day
    prep/               Saved prep checklists
    reminders/          Holy-tide notifications (planning is pure and tested)
    settings/           Settings context (AsyncStorage)
    well/               Stanza layout for the reader
    wheel/              Calendar engine, tide definitions, dial
  i18n/                 i18next setup, date formatting, locale files
  theme/                Design tokens and theme provider
docs/                   Pitch and content guidelines
scripts/                Content import tools
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

The Eddic poems are generated from the proofread transcription of Bellows'
translation on [Wikisource](https://en.wikisource.org/wiki/The_Poetic_Edda_(tr._Bellows)):

```bash
pip install beautifulsoup4
python3 -I scripts/import_bellows.py --cache /tmp/bellows-cache
```

## Testing reminders

Notifications can't be scheduled on the web build. To try them, run a development
build on a device or simulator (`npx expo run:ios` / `npx expo run:android`, or
`npx eas-cli@latest build --profile development`), turn on reminders in Settings,
and choose a lead time.
