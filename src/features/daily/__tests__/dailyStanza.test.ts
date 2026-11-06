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

describe('Old Norse text', () => {
  it.each(['havamal', 'voluspa'])('%s has the original for every stanza', (id) => {
    const poem = getPoem(id)!;
    expect(poem.original?.year).toBe(1904);
    for (const s of poem.stanzas) {
      expect(s.original?.length).toBeGreaterThan(0);
      s.original!.forEach((l) => expect(l.text.trim()).not.toBe(''));
    }
  });

  it('pairs Bellows\' swapped Hávamál 88 and 89 with the right Old Norse', () => {
    const poem = getPoem('havamal')!;
    const s88 = getStanza(poem, 88)!;
    const s89 = getStanza(poem, 89)!;
    expect(s88.lines[0].text).toMatch(/brother's slayer/);
    expect(s88.original![0].text).toMatch(/^bróþurbana/);
    expect(s88.originalNumber).toBe(89);
    expect(s89.lines[0].text).toMatch(/early harvest/);
    expect(s89.original![0].text).toMatch(/^Akri ársǫnum/);
    expect(s89.originalNumber).toBe(88);
  });

  it('keeps well-known lines intact', () => {
    const havamal = getPoem('havamal')!;
    expect(getStanza(havamal, 77)!.original!.map((l) => l.text).join(' ')).toContain('deyr aldrigi');
    expect(getStanza(havamal, 139)!.original![0].text).toContain('vindga meiþi');
    const voluspa = getPoem('voluspa')!;
    expect(getStanza(voluspa, 19)!.original![0].text).toContain('Yggdrasils');
  });
});
