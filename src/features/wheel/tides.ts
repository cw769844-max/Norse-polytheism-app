import type { TideDefinition, TideId } from './types';

/**
 * The holy tides on the Wheel.
 *
 * Structure lives here; all human-readable text (names, descriptions, source
 * notes, checklists) lives in the locale files under `tides.<id>` so it can be
 * translated.
 *
 * Old Icelandic calendar (misseristal) anchors used below:
 *   - Þorri begins on the Friday between 19 and 25 January (bóndadagur)
 *   - Góa begins on the Sunday between 18 and 24 February (konudagur)
 *   - First day of summer: the Thursday between 19 and 25 April
 *   - First day of winter: the Saturday between 21 and 27 October
 *
 * Citations are pending review by a scholar of Old Norse before release; see
 * docs/CONTENT.md.
 */
export const TIDES: TideDefinition[] = [
  {
    id: 'yule',
    oldNorse: 'Jól',
    durationDays: 12,
    rules: {
      solar: { kind: 'season', event: 'winterSolstice' },
      lunar: { kind: 'fullMoon', after: { kind: 'season', event: 'winterSolstice' } },
    },
    sources: [
      { tier: 'attested', citation: 'Hákonar saga góða, ch. 13 (Heimskringla)', noteKey: 'hokunott' },
      { tier: 'attested', citation: 'Hákonar saga góða, ch. 14 (Heimskringla)', noteKey: 'hladir' },
      { tier: 'attested', citation: 'Bede, De temporum ratione, ch. 15', noteKey: 'modranecht' },
      { tier: 'community', citation: 'Modern Heathen practice', noteKey: 'twelveNights' },
    ],
    prepKeys: ['candles', 'mothersNight', 'oath', 'feast'],
  },
  {
    id: 'thorrablot',
    oldNorse: 'Þorrablót',
    durationDays: 1,
    rules: {
      solar: { kind: 'weekdayInWindow', month: 1, firstDay: 19, weekday: 5 },
    },
    sources: [
      { tier: 'attested', citation: 'Orkneyinga saga, ch. 1 (Fundinn Noregr)', noteKey: 'thorri' },
      { tier: 'community', citation: 'Icelandic custom since the 19th century', noteKey: 'revival' },
    ],
    prepKeys: ['food', 'guests', 'toast'],
  },
  {
    id: 'disablot',
    oldNorse: 'Dísablót',
    durationDays: 1,
    rules: {
      solar: { kind: 'crossQuarter', after: 'winterSolstice', yearOffset: -1 },
      lunar: {
        kind: 'fullMoon',
        nth: 2,
        after: { kind: 'season', event: 'winterSolstice', yearOffset: -1 },
      },
      icelandic: { kind: 'weekdayInWindow', month: 2, firstDay: 18, weekday: 0 },
    },
    sources: [
      { tier: 'attested', citation: 'Óláfs saga helga, ch. 77 (Heimskringla)', noteKey: 'uppsala' },
      { tier: 'attested', citation: 'Ynglinga saga, ch. 29 (Heimskringla)', noteKey: 'adils' },
      { tier: 'attested', citation: 'Víga-Glúms saga, ch. 6', noteKey: 'autumn' },
      { tier: 'community', citation: 'Modern Heathen practice', noteKey: 'modern' },
    ],
    prepKeys: ['names', 'offering', 'quiet'],
  },
  {
    id: 'sigrblot',
    oldNorse: 'Sigrblót',
    durationDays: 1,
    rules: {
      solar: { kind: 'season', event: 'springEquinox' },
      lunar: { kind: 'fullMoon', after: { kind: 'season', event: 'springEquinox' } },
      icelandic: { kind: 'weekdayInWindow', month: 4, firstDay: 19, weekday: 4 },
    },
    sources: [
      { tier: 'attested', citation: 'Ynglinga saga, ch. 8 (Heimskringla)', noteKey: 'odinsLaw' },
      { tier: 'scholarly', citation: 'Old Icelandic calendar (misseristal)', noteKey: 'firstDayOfSummer' },
      { tier: 'community', citation: 'Modern Heathen practice', noteKey: 'summerFinding' },
    ],
    prepKeys: ['goal', 'outdoors', 'offering'],
  },
  {
    id: 'midsummer',
    oldNorse: 'Miðsumar',
    durationDays: 1,
    rules: {
      solar: { kind: 'season', event: 'summerSolstice' },
      lunar: { kind: 'fullMoon', after: { kind: 'season', event: 'summerSolstice' } },
    },
    sources: [
      { tier: 'scholarly', citation: 'Scandinavian folk custom', noteKey: 'folk' },
      { tier: 'community', citation: 'Modern Heathen practice', noteKey: 'modern' },
    ],
    prepKeys: ['fire', 'flowers', 'sunrise'],
  },
  {
    id: 'freyfaxi',
    oldNorse: 'Freyfaxi',
    durationDays: 1,
    rules: {
      solar: { kind: 'crossQuarter', after: 'summerSolstice' },
      lunar: { kind: 'fullMoon', after: { kind: 'crossQuarter', after: 'summerSolstice' } },
    },
    sources: [
      { tier: 'attested', citation: 'Hrafnkels saga Freysgoða', noteKey: 'horse' },
      { tier: 'community', citation: 'Modern Heathen practice', noteKey: 'harvest' },
    ],
    prepKeys: ['firstFruits', 'bread', 'thanks'],
  },
  {
    id: 'haustblot',
    oldNorse: 'Haustblót',
    durationDays: 1,
    rules: {
      solar: { kind: 'season', event: 'autumnEquinox' },
      lunar: { kind: 'fullMoon', after: { kind: 'season', event: 'autumnEquinox' } },
    },
    sources: [{ tier: 'community', citation: 'Modern Heathen practice', noteKey: 'harvest' }],
    prepKeys: ['harvest', 'share', 'landwights'],
  },
  {
    id: 'winterNights',
    oldNorse: 'Vetrnætr',
    durationDays: 3,
    rules: {
      solar: { kind: 'weekdayInWindow', month: 10, firstDay: 21, weekday: 6 },
      lunar: {
        kind: 'fullMoon',
        nth: 2,
        after: { kind: 'season', event: 'autumnEquinox' },
      },
      icelandic: { kind: 'weekdayInWindow', month: 10, firstDay: 21, weekday: 6 },
    },
    sources: [
      { tier: 'attested', citation: 'Ynglinga saga, ch. 8 (Heimskringla)', noteKey: 'odinsLaw' },
      { tier: 'attested', citation: 'Víga-Glúms saga, ch. 6', noteKey: 'disablot' },
      { tier: 'attested', citation: 'Sigvatr Þórðarson, Austrfararvísur', noteKey: 'alfablot' },
      { tier: 'scholarly', citation: 'Old Icelandic calendar (misseristal)', noteKey: 'firstDayOfWinter' },
    ],
    prepKeys: ['ancestors', 'alfar', 'stores'],
  },
];

const BY_ID = new Map(TIDES.map((t) => [t.id, t]));

export function getTide(id: string): TideDefinition | undefined {
  return BY_ID.get(id as TideId);
}
