import { moonInfo, phaseName } from '../astronomy';
import { addDays, daysBetween, weekdayOf } from '../calendarDate';
import { isOngoing, nextOccurrencesOf, occurrencesInYear, upcomingTides } from '../reckoning';
import { getTide, TIDES } from '../tides';
import type { CalendarDate, Reckoning } from '../types';
import { guessHemisphere } from '../../settings/hemisphere';

// Tests run with TZ=UTC (see package.json), so local dates equal UTC dates.

function datesIn(year: number, reckoning: Reckoning, hemisphere: 'north' | 'south' = 'north') {
  return Object.fromEntries(
    occurrencesInYear(year, { reckoning, hemisphere }).map((o) => [
      o.tide.id,
      `${o.start.year}-${String(o.start.month).padStart(2, '0')}-${String(o.start.day).padStart(2, '0')}`,
    ]),
  );
}

describe('solar reckoning', () => {
  it('anchors tides to solstices, equinoxes and cross-quarter days (2026, north)', () => {
    expect(datesIn(2026, 'solar')).toEqual({
      thorrablot: '2026-01-23',
      disablot: '2026-02-04',
      sigrblot: '2026-03-20',
      midsummer: '2026-06-21',
      freyfaxi: '2026-08-07',
      haustblot: '2026-09-23',
      winterNights: '2026-10-24',
      yule: '2026-12-21',
    });
  });

  it('flips seasons in the southern hemisphere', () => {
    const south = datesIn(2026, 'solar', 'south');
    expect(south.yule).toBe('2026-06-21');
    expect(south.midsummer).toBe('2026-12-21');
    expect(south.winterNights).toBe('2026-04-25');
  });
});

describe('lunar reckoning', () => {
  it('places each tide on the full moon after its anchor', () => {
    const lunar = datesIn(2026, 'lunar');
    // Full moon after the December 2025 solstice, and the one after that.
    expect(lunar.disablot).toBe('2026-02-01');
    expect(lunar.sigrblot).toBe('2026-04-02');
    expect(lunar.midsummer).toBe('2026-06-29');
    expect(lunar.haustblot).toBe('2026-09-26');
    expect(lunar.winterNights).toBe('2026-10-26');
  });

  it('includes a Yule that falls in January from the previous solstice', () => {
    const yules = occurrencesInYear(2026, { reckoning: 'lunar', hemisphere: 'north' }).filter(
      (o) => o.tide.id === 'yule',
    );
    expect(yules.map((o) => `${o.start.month}-${o.start.day}`)).toEqual(['1-3', '12-24']);
  });
});

describe('Old Icelandic reckoning', () => {
  it.each([2025, 2026, 2027, 2028, 2029, 2030])('uses the misseristal weekdays in %i', (year) => {
    const occ = occurrencesInYear(year, { reckoning: 'icelandic', hemisphere: 'north' });
    const start = (id: string) => occ.find((o) => o.tide.id === id)!.start;

    const thorri = start('thorrablot');
    expect(weekdayOf(thorri)).toBe(5); // Friday
    expect(thorri.month).toBe(1);
    expect(thorri.day).toBeGreaterThanOrEqual(19);
    expect(thorri.day).toBeLessThanOrEqual(25);

    const goa = start('disablot');
    expect(weekdayOf(goa)).toBe(0); // Sunday
    expect([goa.month, goa.day >= 18 && goa.day <= 24]).toEqual([2, true]);

    const summer = start('sigrblot');
    expect(weekdayOf(summer)).toBe(4); // Thursday
    expect([summer.month, summer.day >= 19 && summer.day <= 25]).toEqual([4, true]);

    const winter = start('winterNights');
    expect(weekdayOf(winter)).toBe(6); // Saturday
    expect([winter.month, winter.day >= 21 && winter.day <= 27]).toEqual([10, true]);
  });

  it('matches known Icelandic dates for 2026', () => {
    const d = datesIn(2026, 'icelandic');
    expect(d.sigrblot).toBe('2026-04-23'); // Sumardagurinn fyrsti
    expect(d.winterNights).toBe('2026-10-24'); // Fyrsti vetrardagur
  });
});

describe('upcoming tides', () => {
  const today: CalendarDate = { year: 2026, month: 11, day: 6 };

  it('lists every tide at least once, soonest first', () => {
    const upcoming = upcomingTides(today, { reckoning: 'solar', hemisphere: 'north' });
    expect(new Set(upcoming.map((o) => o.tide.id)).size).toBe(TIDES.length);
    expect(upcoming[0].tide.id).toBe('yule');
    for (let i = 1; i < upcoming.length; i++) {
      expect(daysBetween(upcoming[i - 1].start, upcoming[i].start)).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps a multi-day tide while it is ongoing', () => {
    const duringYule = { year: 2026, month: 12, day: 25 };
    const [first] = upcomingTides(duringYule, { reckoning: 'solar', hemisphere: 'north' });
    expect(first.tide.id).toBe('yule');
    expect(isOngoing(first, duringYule)).toBe(true);
    expect(first.end).toEqual(addDays(first.start, 11));
  });

  it('returns the next two occurrences of a single tide', () => {
    const [a, b] = nextOccurrencesOf(getTide('sigrblot')!, today, { reckoning: 'solar', hemisphere: 'north' });
    expect(a.start).toEqual({ year: 2027, month: 3, day: 20 });
    expect(b.start.year).toBe(2028);
  });
});

describe('moon', () => {
  it('names phases', () => {
    expect(phaseName(0)).toBe('new');
    expect(phaseName(355)).toBe('new');
    expect(phaseName(45)).toBe('waxingCrescent');
    expect(phaseName(180)).toBe('full');
    expect(phaseName(300)).toBe('waningCrescent');
  });

  it('finds the next full and new moon', () => {
    const info = moonInfo(new Date('2026-11-06T12:00:00Z'));
    expect(info.phase).toBe('waningCrescent');
    expect(info.nextNew.toISOString().slice(0, 10)).toBe('2026-11-09');
    expect(info.nextFull.toISOString().slice(0, 10)).toBe('2026-11-24');
  });
});

describe('hemisphere guess', () => {
  it('uses the region code', () => {
    expect(guessHemisphere('AU')).toBe('south');
    expect(guessHemisphere('br')).toBe('south');
    expect(guessHemisphere('IS')).toBe('north');
    expect(guessHemisphere(null)).toBe('north');
  });
});
