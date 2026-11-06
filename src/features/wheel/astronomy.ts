import { Body, Illumination, MoonPhase, SearchMoonPhase, Seasons, type SeasonInfo } from 'astronomy-engine';

import { addDays, fromDate, toLocalMidnight } from './calendarDate';
import type { CalendarDate, Hemisphere, SeasonEvent } from './types';

const seasonCache = new Map<number, SeasonInfo>();

function seasonsFor(year: number): SeasonInfo {
  let info = seasonCache.get(year);
  if (!info) {
    info = Seasons(year);
    seasonCache.set(year, info);
  }
  return info;
}

export const SEASON_ORDER: SeasonEvent[] = ['winterSolstice', 'springEquinox', 'summerSolstice', 'autumnEquinox'];

export function nextSeasonEvent(event: SeasonEvent): SeasonEvent {
  return SEASON_ORDER[(SEASON_ORDER.indexOf(event) + 1) % SEASON_ORDER.length];
}

/** The instant of a seasonal event in the given Gregorian year, as experienced in a hemisphere. */
export function seasonInstant(event: SeasonEvent, year: number, hemisphere: Hemisphere): Date {
  const s = seasonsFor(year);
  if (hemisphere === 'north') {
    switch (event) {
      case 'winterSolstice':
        return s.dec_solstice.date;
      case 'springEquinox':
        return s.mar_equinox.date;
      case 'summerSolstice':
        return s.jun_solstice.date;
      case 'autumnEquinox':
        return s.sep_equinox.date;
    }
  }
  switch (event) {
    case 'winterSolstice':
      return s.jun_solstice.date;
    case 'springEquinox':
      return s.sep_equinox.date;
    case 'summerSolstice':
      return s.dec_solstice.date;
    case 'autumnEquinox':
      return s.mar_equinox.date;
  }
}

/** Midpoint between a seasonal event and the following one (a "cross-quarter" day). */
export function crossQuarterInstant(after: SeasonEvent, year: number, hemisphere: Hemisphere): Date {
  const start = seasonInstant(after, year, hemisphere);
  const nextEvent = nextSeasonEvent(after);
  let end = seasonInstant(nextEvent, year, hemisphere);
  if (end <= start) end = seasonInstant(nextEvent, year + 1, hemisphere);
  return new Date((start.getTime() + end.getTime()) / 2);
}

/** Ecliptic longitude difference used by astronomy-engine: 0 new, 90 first quarter, 180 full, 270 last quarter. */
const FULL_MOON = 180;
const NEW_MOON = 0;

/** Exact instant of the next lunar phase at or after `from`. */
export function nextPhaseInstant(targetLongitude: number, from: Date): Date {
  const t = SearchMoonPhase(targetLongitude, from, 40);
  if (!t) throw new Error('Moon phase search failed');
  return t.date;
}

/** Local date of the nth full moon occurring on or after the start of `date`. */
export function nthFullMoonOnOrAfter(date: CalendarDate, nth = 1): CalendarDate {
  let from = toLocalMidnight(date);
  let found = from;
  for (let i = 0; i < nth; i++) {
    found = nextPhaseInstant(FULL_MOON, from);
    // Step past this full moon before searching for the next one.
    from = toLocalMidnight(addDays(fromDate(found), 1));
  }
  return fromDate(found);
}

export type MoonPhaseName =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export interface MoonInfo {
  /** 0–360: 0 new, 90 first quarter, 180 full, 270 last quarter. */
  angle: number;
  /** Fraction of the disc that is lit, 0–1. */
  illumination: number;
  phase: MoonPhaseName;
  nextFull: Date;
  nextNew: Date;
}

/** Within this many degrees (~1 day) of a principal phase, the moon is called by that phase. */
const PRINCIPAL_PHASE_TOLERANCE = 12;

export function phaseName(angle: number): MoonPhaseName {
  const a = ((angle % 360) + 360) % 360;
  const near = (target: number) => {
    const d = Math.abs(a - target);
    return Math.min(d, 360 - d) <= PRINCIPAL_PHASE_TOLERANCE;
  };
  if (near(0)) return 'new';
  if (near(90)) return 'firstQuarter';
  if (near(180)) return 'full';
  if (near(270)) return 'lastQuarter';
  if (a < 90) return 'waxingCrescent';
  if (a < 180) return 'waxingGibbous';
  if (a < 270) return 'waningGibbous';
  return 'waningCrescent';
}

export function moonInfo(at: Date): MoonInfo {
  const angle = MoonPhase(at);
  return {
    angle,
    illumination: Illumination(Body.Moon, at).phase_fraction,
    phase: phaseName(angle),
    nextFull: nextPhaseInstant(FULL_MOON, at),
    nextNew: nextPhaseInstant(NEW_MOON, at),
  };
}
