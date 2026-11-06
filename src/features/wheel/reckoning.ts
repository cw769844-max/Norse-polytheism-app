import { crossQuarterInstant, nthFullMoonOnOrAfter, seasonInstant } from './astronomy';
import { addDays, compareDates, fromDate, weekdayOf } from './calendarDate';
import { TIDES } from './tides';
import type {
  CalendarDate,
  DateRule,
  Hemisphere,
  Reckoning,
  TideDefinition,
  TideOccurrence,
} from './types';

export interface ReckoningOptions {
  reckoning: Reckoning;
  hemisphere: Hemisphere;
}

export function ruleFor(tide: TideDefinition, reckoning: Reckoning): DateRule {
  return tide.rules[reckoning] ?? tide.rules.solar;
}

/**
 * Resolve a rule to a local calendar date for the given anchor year.
 *
 * Calendar-based rules (weekday windows) are shifted six months in the
 * southern hemisphere so that every tide keeps its season.
 */
export function resolveRule(rule: DateRule, anchorYear: number, hemisphere: Hemisphere): CalendarDate {
  switch (rule.kind) {
    case 'season':
      return fromDate(seasonInstant(rule.event, anchorYear + (rule.yearOffset ?? 0), hemisphere));
    case 'crossQuarter':
      return fromDate(crossQuarterInstant(rule.after, anchorYear + (rule.yearOffset ?? 0), hemisphere));
    case 'weekdayInWindow': {
      const month = hemisphere === 'south' ? ((rule.month - 1 + 6) % 12) + 1 : rule.month;
      const windowStart: CalendarDate = {
        year: anchorYear + (rule.yearOffset ?? 0),
        month,
        day: rule.firstDay,
      };
      const offset = (rule.weekday - weekdayOf(windowStart) + 7) % 7;
      return addDays(windowStart, offset);
    }
    case 'fullMoon':
      return nthFullMoonOnOrAfter(resolveRule(rule.after, anchorYear, hemisphere), rule.nth ?? 1);
  }
}

function occurrence(tide: TideDefinition, anchorYear: number, options: ReckoningOptions): TideOccurrence {
  const start = resolveRule(ruleFor(tide, options.reckoning), anchorYear, options.hemisphere);
  return { tide, start, end: addDays(start, tide.durationDays - 1) };
}

function byStart(a: TideOccurrence, b: TideOccurrence): number {
  return compareDates(a.start, b.start);
}

/**
 * All tide occurrences whose observance overlaps [from, to] (inclusive), sorted by start date.
 *
 * Rules can produce a date in a neighbouring year (a lunar Yule can fall in
 * January), so neighbouring anchor years are evaluated and de-duplicated.
 */
export function occurrencesBetween(
  from: CalendarDate,
  to: CalendarDate,
  options: ReckoningOptions,
  tides: TideDefinition[] = TIDES,
): TideOccurrence[] {
  const seen = new Set<string>();
  const result: TideOccurrence[] = [];
  for (let year = from.year - 1; year <= to.year + 1; year++) {
    for (const tide of tides) {
      const occ = occurrence(tide, year, options);
      if (compareDates(occ.end, from) < 0 || compareDates(occ.start, to) > 0) continue;
      const key = `${tide.id}:${occ.start.year}-${occ.start.month}-${occ.start.day}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(occ);
    }
  }
  return result.sort(byStart);
}

/** Occurrences whose start falls within a Gregorian year. */
export function occurrencesInYear(year: number, options: ReckoningOptions): TideOccurrence[] {
  const from = { year, month: 1, day: 1 };
  const to = { year, month: 12, day: 31 };
  return occurrencesBetween(from, to, options).filter(
    (o) => compareDates(o.start, from) >= 0 && compareDates(o.start, to) <= 0,
  );
}

/**
 * Tides that are happening today or still to come, soonest first.
 * Looks about 13 months ahead so every tide appears at least once.
 */
export function upcomingTides(today: CalendarDate, options: ReckoningOptions): TideOccurrence[] {
  return occurrencesBetween(today, addDays(today, 400), options);
}

export function isOngoing(occ: TideOccurrence, today: CalendarDate): boolean {
  return compareDates(occ.start, today) <= 0 && compareDates(today, occ.end) <= 0;
}

/** The current or next occurrence of one tide, plus the one after it. */
export function nextOccurrencesOf(
  tide: TideDefinition,
  today: CalendarDate,
  options: ReckoningOptions,
  count = 2,
): TideOccurrence[] {
  return occurrencesBetween(today, addDays(today, 365 * count + 30), options, [tide]).slice(0, count);
}
