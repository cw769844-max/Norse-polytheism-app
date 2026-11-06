import { addDays, dateKey, toLocalMidnight } from '@/features/wheel/calendarDate';
import type { TideId, TideOccurrence } from '@/features/wheel/types';

export type LeadDays = 0 | 1 | 3 | 7;

export interface ReminderPrefs {
  enabled: boolean;
  /** Extra reminder this many days before a tide (0 = only on the day). */
  leadDays: LeadDays;
  /** Local hour of day (0–23) to send reminders. */
  hour: number;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = { enabled: false, leadDays: 3, hour: 9 };

export interface PlannedReminder {
  /** Stable identifier, so rescheduling replaces rather than duplicates. */
  id: string;
  tideId: TideId;
  kind: 'lead' | 'day';
  /** Days between the reminder and the tide's first day (0 for the day itself). */
  daysBefore: number;
  fireAt: Date;
}

/** iOS keeps at most 64 pending local notifications per app; stay well under it. */
export const MAX_REMINDERS = 48;

function atHour(date: Parameters<typeof toLocalMidnight>[0], hour: number): Date {
  const d = toLocalMidnight(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/**
 * Work out which reminders to schedule for the given upcoming tides.
 * Pure: it neither reads the clock nor touches the notification system.
 */
export function planReminders(
  upcoming: TideOccurrence[],
  prefs: ReminderPrefs,
  now: Date,
): PlannedReminder[] {
  if (!prefs.enabled) return [];

  const plans: PlannedReminder[] = [];
  for (const occ of upcoming) {
    const key = `${occ.tide.id}:${dateKey(occ.start)}`;
    if (prefs.leadDays > 0) {
      plans.push({
        id: `tide:${key}:lead`,
        tideId: occ.tide.id,
        kind: 'lead',
        daysBefore: prefs.leadDays,
        fireAt: atHour(addDays(occ.start, -prefs.leadDays), prefs.hour),
      });
    }
    plans.push({
      id: `tide:${key}:day`,
      tideId: occ.tide.id,
      kind: 'day',
      daysBefore: 0,
      fireAt: atHour(occ.start, prefs.hour),
    });
  }

  return plans
    .filter((p) => p.fireAt.getTime() > now.getTime())
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, MAX_REMINDERS);
}
