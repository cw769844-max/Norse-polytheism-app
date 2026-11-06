import {
  ELDER_FUTHARK,
  getElderRune,
  getYoungerRune,
  YOUNGER_FUTHARK,
} from '../../../content/runes/futhark';
import { RUNE_POEMS } from '../../../content/runes/poems';
import en from '../../../i18n/locales/en.json';
import { drawRune } from '../draw';

const isRunic = (s: string) => [...s].length === 1 && s.codePointAt(0)! >= 0x16a0 && s.codePointAt(0)! <= 0x16f8;

function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ǫö]/g, 'o')
    .replace(/æi/g, 'ei')
    .normalize('NFD')
    .replace(/[^\p{L}]/gu, '')
    .replace(/[̀-ͯ]/g, '');
}

describe('futhark data', () => {
  it('has 16 Younger and 24 Elder runes with unique ids', () => {
    expect(YOUNGER_FUTHARK).toHaveLength(16);
    expect(ELDER_FUTHARK).toHaveLength(24);
    const ids = [...YOUNGER_FUTHARK, ...ELDER_FUTHARK].map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses single runic code points for every glyph', () => {
    for (const r of YOUNGER_FUTHARK) {
      expect(isRunic(r.glyph.longBranch)).toBe(true);
      expect(isRunic(r.glyph.shortTwig)).toBe(true);
    }
    for (const r of ELDER_FUTHARK) expect(isRunic(r.glyph)).toBe(true);
  });

  it('distinguishes the nine runes that have short-twig forms', () => {
    const differ = YOUNGER_FUTHARK.filter((r) => r.glyph.longBranch !== r.glyph.shortTwig).map((r) => r.id);
    expect(differ).toEqual(['oss', 'hagall', 'naudr', 'ar', 'sol', 'tyr', 'bjarkan', 'madr', 'yr']);
  });

  it('links ancestors and descendants both ways', () => {
    for (const y of YOUNGER_FUTHARK) {
      expect(getElderRune(y.ancestor!)?.descendant).toBe(y.id);
    }
    for (const e of ELDER_FUTHARK) {
      if (e.descendant) expect(getYoungerRune(e.descendant)?.ancestor).toBe(e.id);
      if (e.writtenWith) expect(getYoungerRune(e.writtenWith)).toBeDefined();
    }
    expect(ELDER_FUTHARK.filter((e) => e.descendant)).toHaveLength(16);
  });

  it('marks every Elder name as reconstructed', () => {
    for (const e of ELDER_FUTHARK) expect(e.name.startsWith('*')).toBe(true);
  });

  it('has a meaning (and a prompt for Younger runes) for every rune', () => {
    const runes = (en as { runes: { youngerRunes: Record<string, { meaning: string; prompt: string }>; elderRunes: Record<string, { meaning: string }> } }).runes;
    for (const r of YOUNGER_FUTHARK) {
      expect(runes.youngerRunes[r.id].meaning).toEqual(expect.any(String));
      expect(runes.youngerRunes[r.id].prompt).toEqual(expect.any(String));
    }
    for (const r of ELDER_FUTHARK) expect(runes.elderRunes[r.id].meaning).toEqual(expect.any(String));
  });
});

/** Spellings the poems use besides the normalized name. */
const SPELLINGS: Record<string, string[]> = { iss: ['is'], naudr: ['nauð'] };

describe('rune poems', () => {
  it.each(['norwegian', 'icelandic'] as const)('the %s poem has a stanza per rune, in futhark order', (id) => {
    const poem = RUNE_POEMS[id];
    expect(poem.stanzas).toHaveLength(16);
    for (const rune of YOUNGER_FUTHARK) {
      const stanza = poem.stanzas[rune.stanza - 1];
      expect(stanza.n).toBe(rune.stanza);
      expect(stanza.english.length).toBeGreaterThan(0);
      // Each stanza opens with the rune's name, in that poem's spelling.
      const first = fold(stanza.original[0].text.split(/\s/)[0]);
      expect([fold(rune.name), ...(SPELLINGS[rune.id] ?? [])]).toContain(first);
    }
  });

  it('gives every Icelandic stanza its Latin gloss', () => {
    for (const s of RUNE_POEMS.icelandic.stanzas) {
      expect(s.gloss?.latin).toEqual(expect.any(String));
      expect(s.gloss?.king).toEqual(expect.any(String));
    }
    expect(RUNE_POEMS.icelandic.stanzas[0].gloss).toEqual({ latin: 'aurum', king: 'fylkir' });
  });
});

describe('drawRune', () => {
  it('maps the whole random range onto the sixteen runes', () => {
    expect(drawRune(() => 0)).toBe('fe');
    expect(drawRune(() => 0.999999)).toBe('yr');
    expect(drawRune(() => 1)).toBe('yr');
    const seen = new Set(Array.from({ length: 16 }, (_, i) => drawRune(() => (i + 0.5) / 16)));
    expect(seen.size).toBe(16);
  });
});
