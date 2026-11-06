import type { PoemId } from '@/content/poems';
import { daysBetween } from '@/features/wheel/calendarDate';
import type { CalendarDate } from '@/features/wheel/types';

export interface DailyStanzaRef {
  poem: PoemId;
  /** Stanza number in Bellows' edition. */
  n: number;
}

/**
 * Stanzas chosen for daily reflection, each with a prompt in the locale files
 * under `daily.prompts.<poem>-<n>`.
 *
 * Chosen for wisdom that speaks to everyday life: hospitality, friendship,
 * moderation, courage, reputation and the gods. Stanzas that are fragmentary,
 * purely narrative, or that disparage women are left out.
 */
export const DAILY_STANZAS: DailyStanzaRef[] = [
  { poem: 'havamal', n: 1 },
  { poem: 'havamal', n: 3 },
  { poem: 'havamal', n: 4 },
  { poem: 'havamal', n: 6 },
  { poem: 'havamal', n: 7 },
  { poem: 'havamal', n: 10 },
  { poem: 'havamal', n: 15 },
  { poem: 'havamal', n: 19 },
  { poem: 'havamal', n: 22 },
  { poem: 'havamal', n: 23 },
  { poem: 'havamal', n: 28 },
  { poem: 'havamal', n: 34 },
  { poem: 'havamal', n: 36 },
  { poem: 'havamal', n: 41 },
  { poem: 'havamal', n: 42 },
  { poem: 'havamal', n: 44 },
  { poem: 'havamal', n: 47 },
  { poem: 'havamal', n: 50 },
  { poem: 'havamal', n: 52 },
  { poem: 'havamal', n: 53 },
  { poem: 'havamal', n: 56 },
  { poem: 'havamal', n: 57 },
  { poem: 'havamal', n: 59 },
  { poem: 'havamal', n: 61 },
  { poem: 'havamal', n: 63 },
  { poem: 'havamal', n: 68 },
  { poem: 'havamal', n: 69 },
  { poem: 'havamal', n: 72 },
  { poem: 'havamal', n: 75 },
  { poem: 'havamal', n: 77 },
  { poem: 'havamal', n: 81 },
  { poem: 'havamal', n: 89 },
  { poem: 'havamal', n: 95 },
  { poem: 'havamal', n: 103 },
  { poem: 'havamal', n: 111 },
  { poem: 'havamal', n: 119 },
  { poem: 'havamal', n: 121 },
  { poem: 'havamal', n: 124 },
  { poem: 'havamal', n: 131 },
  { poem: 'havamal', n: 133 },
  { poem: 'havamal', n: 134 },
  { poem: 'havamal', n: 135 },
  { poem: 'havamal', n: 139 },
  { poem: 'havamal', n: 142 },
  { poem: 'havamal', n: 146 },
  { poem: 'voluspa', n: 18 },
  { poem: 'voluspa', n: 19 },
  { poem: 'voluspa', n: 20 },
  { poem: 'voluspa', n: 59 },
];

const EPOCH: CalendarDate = { year: 2000, month: 1, day: 1 };

/** The same stanza all day, everywhere; it changes at local midnight. */
export function dailyStanzaFor(date: CalendarDate): DailyStanzaRef {
  const index = ((daysBetween(EPOCH, date) % DAILY_STANZAS.length) + DAILY_STANZAS.length) % DAILY_STANZAS.length;
  return DAILY_STANZAS[index];
}

export function promptKey(ref: DailyStanzaRef): string {
  return `daily.prompts.${ref.poem}-${ref.n}`;
}
