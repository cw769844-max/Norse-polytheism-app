/** How the holy tides are dated. */
export type Reckoning = 'solar' | 'lunar' | 'icelandic';

export type Hemisphere = 'north' | 'south';

/**
 * How well-supported a claim is. Shown on every piece of lore in the app.
 * - attested: stated in a primary source (with citation)
 * - scholarly: academic reconstruction, archaeology, or historical fact about later practice
 * - community: common modern Heathen custom
 * - upg: unverified personal gnosis
 */
export type SourceTier = 'attested' | 'scholarly' | 'community' | 'upg';

/** Seasonal turning points, named by season so they flip in the southern hemisphere. */
export type SeasonEvent = 'winterSolstice' | 'springEquinox' | 'summerSolstice' | 'autumnEquinox';

/** 0 = Sunday … 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DateRule =
  /** The local date of a solstice or equinox. */
  | { kind: 'season'; event: SeasonEvent; yearOffset?: number }
  /** Midway between a solstice/equinox and the next one. */
  | { kind: 'crossQuarter'; after: SeasonEvent; yearOffset?: number }
  /** The given weekday within the seven days starting at month/firstDay (Old Icelandic style). */
  | { kind: 'weekdayInWindow'; month: number; firstDay: number; weekday: Weekday; yearOffset?: number }
  /** The nth full moon on or after the date produced by `after`. */
  | { kind: 'fullMoon'; after: DateRule; nth?: number };

export type TideId =
  | 'yule'
  | 'thorrablot'
  | 'disablot'
  | 'sigrblot'
  | 'midsummer'
  | 'freyfaxi'
  | 'haustblot'
  | 'winterNights';

export interface TideSource {
  tier: SourceTier;
  /** Work and location, e.g. "Ynglinga saga, ch. 8". Proper names are not translated. */
  citation: string;
  /** i18n key (under `tides.<id>.sources`) for the note explaining what the source says. */
  noteKey: string;
}

export interface TideDefinition {
  id: TideId;
  /** Old Norse / Icelandic name. */
  oldNorse: string;
  /** How many days the observance traditionally spans. */
  durationDays: number;
  /** Solar rules are required; other reckonings fall back to solar when absent. */
  rules: { solar: DateRule; lunar?: DateRule; icelandic?: DateRule };
  sources: TideSource[];
  /** i18n keys under `tides.<id>.prep` for the preparation checklist. */
  prepKeys: string[];
}

export interface CalendarDate {
  year: number;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
}

export interface TideOccurrence {
  tide: TideDefinition;
  start: CalendarDate;
  /** Inclusive last day of the observance. */
  end: CalendarDate;
}
