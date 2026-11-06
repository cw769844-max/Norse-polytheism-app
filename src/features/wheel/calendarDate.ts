import type { CalendarDate } from './types';

const MS_PER_DAY = 86_400_000;

/** Calendar date of an instant in the device's local time zone. */
export function fromDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** Local midnight at the start of a calendar date. */
export function toLocalMidnight(date: CalendarDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

/** Days since the Unix epoch, ignoring time zones (safe across DST changes). */
function epochDay(date: CalendarDate): number {
  return Math.round(Date.UTC(date.year, date.month - 1, date.day) / MS_PER_DAY);
}

function fromEpochDay(n: number): CalendarDate {
  const d = new Date(n * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromEpochDay(epochDay(date) + days);
}

/** Whole days from `a` to `b` (positive when `b` is later). */
export function daysBetween(a: CalendarDate, b: CalendarDate): number {
  return epochDay(b) - epochDay(a);
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return epochDay(a) - epochDay(b);
}

export function sameDate(a: CalendarDate, b: CalendarDate): boolean {
  return compareDates(a, b) === 0;
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(date: CalendarDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Day of the year, 0-based (Jan 1 = 0). */
export function dayOfYear(date: CalendarDate): number {
  return daysBetween({ year: date.year, month: 1, day: 1 }, date);
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function dateKey(date: CalendarDate): string {
  const mm = String(date.month).padStart(2, '0');
  const dd = String(date.day).padStart(2, '0');
  return `${date.year}-${mm}-${dd}`;
}
