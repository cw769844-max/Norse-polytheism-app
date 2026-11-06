import { getPoem, getStanza } from '../../../content/poems';
import en from '../../../i18n/locales/en.json';
import { addDays } from '../../wheel/calendarDate';
import { DAILY_STANZAS, dailyStanzaFor, promptKey } from '../dailyStanza';

describe('daily stanza', () => {
  it('points only at stanzas that exist and have a prompt', () => {
    const prompts = (en as { daily: { prompts: Record<string, string> } }).daily.prompts;
    for (const ref of DAILY_STANZAS) {
      const poem = getPoem(ref.poem);
      expect(poem).toBeDefined();
      expect(getStanza(poem!, ref.n)).toBeDefined();
      expect(prompts[promptKey(ref).replace('daily.prompts.', '')]).toEqual(expect.any(String));
    }
    expect(Object.keys(prompts)).toHaveLength(DAILY_STANZAS.length);
  });

  it('changes each day and cycles through every stanza', () => {
    const start = { year: 2026, month: 11, day: 6 };
    const seen = new Set<string>();
    for (let i = 0; i < DAILY_STANZAS.length; i++) {
      const ref = dailyStanzaFor(addDays(start, i));
      seen.add(`${ref.poem}-${ref.n}`);
    }
    expect(seen.size).toBe(DAILY_STANZAS.length);
    expect(dailyStanzaFor(start)).toEqual(dailyStanzaFor({ ...start }));
  });

  it('works for dates before the epoch', () => {
    expect(dailyStanzaFor({ year: 1999, month: 12, day: 31 })).toBeDefined();
  });
});

describe('poem content', () => {
  it.each(['havamal', 'voluspa'])('%s has consecutive stanza numbers and no empty lines', (id) => {
    const poem = getPoem(id)!;
    poem.stanzas.forEach((s, i) => {
      expect(s.n).toBe(i + 1);
      expect(s.lines.length).toBeGreaterThan(0);
      s.lines.forEach((l) => expect(l.text.trim()).not.toBe(''));
    });
  });
});
