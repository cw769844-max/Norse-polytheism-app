import { upcomingTides } from '../../wheel/reckoning';
import { planReminders } from '../plan';

// Tests run with TZ=UTC (see package.json).
const options = { reckoning: 'solar', hemisphere: 'north' } as const;
const today = { year: 2026, month: 11, day: 6 };
const now = new Date('2026-11-06T12:00:00Z');

describe('planReminders', () => {
  const upcoming = upcomingTides(today, options);

  it('plans nothing when reminders are off', () => {
    expect(planReminders(upcoming, { enabled: false, leadDays: 3, hour: 9 }, now)).toEqual([]);
  });

  it('plans a lead reminder and a day-of reminder per tide, soonest first', () => {
    const plans = planReminders(upcoming, { enabled: true, leadDays: 3, hour: 9 }, now);
    const yule = plans.filter((p) => p.tideId === 'yule' && p.fireAt.getUTCFullYear() === 2026);
    expect(yule.map((p) => [p.kind, p.fireAt.toISOString()])).toEqual([
      ['lead', '2026-12-18T09:00:00.000Z'],
      ['day', '2026-12-21T09:00:00.000Z'],
    ]);
    for (let i = 1; i < plans.length; i++) {
      expect(plans[i].fireAt.getTime()).toBeGreaterThanOrEqual(plans[i - 1].fireAt.getTime());
    }
    expect(new Set(plans.map((p) => p.id)).size).toBe(plans.length);
  });

  it('only plans day-of reminders when lead time is zero', () => {
    const plans = planReminders(upcoming, { enabled: true, leadDays: 0, hour: 18 }, now);
    expect(plans.every((p) => p.kind === 'day' && p.fireAt.getUTCHours() === 18)).toBe(true);
  });

  it('skips reminders that are already in the past', () => {
    // Two days before Yule: the 3-day lead reminder has passed, the day-of one has not.
    const plans = planReminders(
      upcomingTides({ year: 2026, month: 12, day: 19 }, options),
      { enabled: true, leadDays: 3, hour: 9 },
      new Date('2026-12-19T12:00:00Z'),
    );
    expect(plans[0]).toMatchObject({ tideId: 'yule', kind: 'day' });
  });

  it('uses stable ids so rescheduling is idempotent', () => {
    const a = planReminders(upcoming, { enabled: true, leadDays: 1, hour: 9 }, now);
    const b = planReminders(upcoming, { enabled: true, leadDays: 1, hour: 9 }, now);
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });
});
