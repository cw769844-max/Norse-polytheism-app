import type { TFunction } from 'i18next';

import { nextSeasonEvent } from '@/features/wheel/astronomy';
import { addDays, daysBetween, toLocalMidnight } from '@/features/wheel/calendarDate';
import type { CalendarDate, DateRule, Hemisphere } from '@/features/wheel/types';

import { deviceLocaleTag } from './index';

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let f = formatterCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(deviceLocaleTag(), options);
    formatterCache.set(key, f);
  }
  return f;
}

export function formatDate(
  date: CalendarDate,
  style: 'long' | 'medium' | 'monthDay' | 'weekdayLong' | 'monthShort' = 'medium',
): string {
  const options: Intl.DateTimeFormatOptions =
    style === 'monthShort'
      ? { month: 'short' }
      : style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : style === 'weekdayLong'
        ? { weekday: 'long', day: 'numeric', month: 'long' }
        : style === 'monthDay'
          ? { day: 'numeric', month: 'long' }
          : { day: 'numeric', month: 'short', year: 'numeric' };
  return formatter(options).format(toLocalMidnight(date));
}

export function formatInstant(date: Date, options: Intl.DateTimeFormatOptions): string {
  return formatter(options).format(date);
}

/** Narrow month labels (J F M …) for the Wheel dial. */
export function monthInitials(): string[] {
  const f = formatter({ month: 'narrow' });
  return Array.from({ length: 12 }, (_, m) => f.format(new Date(2001, m, 15)));
}

/** "Today", "Tomorrow" or "In 12 days". */
export function relativeDay(t: TFunction, today: CalendarDate, date: CalendarDate): string {
  const days = daysBetween(today, date);
  if (days === 0) return t('common.today');
  if (days === 1) return t('common.tomorrow');
  return t('common.inDays', { count: days });
}

function windowParts(t: TFunction, rule: Extract<DateRule, { kind: 'weekdayInWindow' }>, hemisphere: Hemisphere) {
  const month = hemisphere === 'south' ? ((rule.month - 1 + 6) % 12) + 1 : rule.month;
  const start: CalendarDate = { year: 2001, month, day: rule.firstDay };
  return {
    weekday: t(`weekday.${rule.weekday}`),
    from: formatDate(start, 'monthDay'),
    to: formatDate(addDays(start, 6), 'monthDay'),
  };
}

function baseDescription(t: TFunction, rule: DateRule, hemisphere: Hemisphere): string {
  switch (rule.kind) {
    case 'season':
      return t('rule.base.season', { event: t(`season.${rule.event}`) });
    case 'crossQuarter':
      return t('rule.base.crossQuarter', {
        event: t(`season.${rule.after}`),
        next: t(`season.${nextSeasonEvent(rule.after)}`),
      });
    case 'weekdayInWindow':
      return t('rule.base.weekdayInWindow', windowParts(t, rule, hemisphere));
    case 'fullMoon':
      return describeRule(t, rule, hemisphere);
  }
}

/** Human-readable explanation of how a tide is dated. */
export function describeRule(t: TFunction, rule: DateRule, hemisphere: Hemisphere): string {
  switch (rule.kind) {
    case 'season':
      return t('rule.season', { event: t(`season.${rule.event}`) });
    case 'crossQuarter':
      return t('rule.crossQuarter', {
        event: t(`season.${rule.after}`),
        next: t(`season.${nextSeasonEvent(rule.after)}`),
      });
    case 'weekdayInWindow':
      return t('rule.weekdayInWindow', windowParts(t, rule, hemisphere));
    case 'fullMoon':
      return t(`rule.fullMoon_${rule.nth ?? 1}`, { base: baseDescription(t, rule.after, hemisphere) });
  }
}
