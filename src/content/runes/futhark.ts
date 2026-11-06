/**
 * The runic alphabets.
 *
 * Glyphs are Unicode code points from the Runic block; the long-branch and
 * short-twig forms follow their Unicode names (e.g. U+16BC LONG-BRANCH-HAGALL,
 * U+16BD SHORT-TWIG-HAGALL). Readable text (meanings, prompts) lives in the
 * locale files under `runes.younger.<id>` and `runes.elder.<id>`.
 */

export type YoungerRuneId =
  | 'fe'
  | 'ur'
  | 'thurs'
  | 'oss'
  | 'reid'
  | 'kaun'
  | 'hagall'
  | 'naudr'
  | 'iss'
  | 'ar'
  | 'sol'
  | 'tyr'
  | 'bjarkan'
  | 'madr'
  | 'logr'
  | 'yr';

export type ElderRuneId =
  | 'fehu'
  | 'uruz'
  | 'thurisaz'
  | 'ansuz'
  | 'raido'
  | 'kaunan'
  | 'gebo'
  | 'wunjo'
  | 'hagalaz'
  | 'naudiz'
  | 'isaz'
  | 'jera'
  | 'eihwaz'
  | 'pertho'
  | 'algiz'
  | 'sowilo'
  | 'tiwaz'
  | 'berkanan'
  | 'ehwaz'
  | 'mannaz'
  | 'laguz'
  | 'ingwaz'
  | 'dagaz'
  | 'othala';

export type RuneStyle = 'longBranch' | 'shortTwig';

export interface YoungerRune {
  id: YoungerRuneId;
  /** Normalized Old Norse name, as used in the rune poems. */
  name: string;
  glyph: Record<RuneStyle, string>;
  /** Sounds the rune wrote (transliteration). */
  sound: string;
  /** Stanza number in both the Norwegian and Icelandic rune poems. */
  stanza: number;
  /** The Elder Futhark rune it descends from. */
  ancestor?: ElderRuneId;
}

export interface ElderRune {
  id: ElderRuneId;
  /** Reconstructed Proto-Germanic name; the asterisk marks it as unattested. */
  name: string;
  glyph: string;
  sound: string;
  /** The name's meaning is disputed. */
  meaningUncertain?: boolean;
  /** The Younger Futhark rune that continues it. */
  descendant?: YoungerRuneId;
  /** For runes dropped from the Younger Futhark: the Younger rune that then wrote its sound. */
  writtenWith?: YoungerRuneId;
}

/** The sixteen runes of the Viking Age, in the order of the rune poems. */
export const YOUNGER_FUTHARK: YoungerRune[] = [
  { id: 'fe', name: 'fé', glyph: { longBranch: 'ᚠ', shortTwig: 'ᚠ' }, sound: 'f', stanza: 1, ancestor: 'fehu' },
  { id: 'ur', name: 'úr', glyph: { longBranch: 'ᚢ', shortTwig: 'ᚢ' }, sound: 'u, o, v', stanza: 2, ancestor: 'uruz' },
  { id: 'thurs', name: 'þurs', glyph: { longBranch: 'ᚦ', shortTwig: 'ᚦ' }, sound: 'þ, ð', stanza: 3, ancestor: 'thurisaz' },
  { id: 'oss', name: 'óss', glyph: { longBranch: 'ᚬ', shortTwig: 'ᚭ' }, sound: 'ą, o', stanza: 4, ancestor: 'ansuz' },
  { id: 'reid', name: 'reið', glyph: { longBranch: 'ᚱ', shortTwig: 'ᚱ' }, sound: 'r', stanza: 5, ancestor: 'raido' },
  { id: 'kaun', name: 'kaun', glyph: { longBranch: 'ᚴ', shortTwig: 'ᚴ' }, sound: 'k, g', stanza: 6, ancestor: 'kaunan' },
  { id: 'hagall', name: 'hagall', glyph: { longBranch: 'ᚼ', shortTwig: 'ᚽ' }, sound: 'h', stanza: 7, ancestor: 'hagalaz' },
  { id: 'naudr', name: 'nauðr', glyph: { longBranch: 'ᚾ', shortTwig: 'ᚿ' }, sound: 'n', stanza: 8, ancestor: 'naudiz' },
  { id: 'iss', name: 'íss', glyph: { longBranch: 'ᛁ', shortTwig: 'ᛁ' }, sound: 'i, e, j', stanza: 9, ancestor: 'isaz' },
  { id: 'ar', name: 'ár', glyph: { longBranch: 'ᛅ', shortTwig: 'ᛆ' }, sound: 'a, æ', stanza: 10, ancestor: 'jera' },
  { id: 'sol', name: 'sól', glyph: { longBranch: 'ᛋ', shortTwig: 'ᛌ' }, sound: 's', stanza: 11, ancestor: 'sowilo' },
  { id: 'tyr', name: 'týr', glyph: { longBranch: 'ᛏ', shortTwig: 'ᛐ' }, sound: 't, d', stanza: 12, ancestor: 'tiwaz' },
  { id: 'bjarkan', name: 'bjarkan', glyph: { longBranch: 'ᛒ', shortTwig: 'ᛓ' }, sound: 'b, p', stanza: 13, ancestor: 'berkanan' },
  { id: 'madr', name: 'maðr', glyph: { longBranch: 'ᛘ', shortTwig: 'ᛙ' }, sound: 'm', stanza: 14, ancestor: 'mannaz' },
  { id: 'logr', name: 'lǫgr', glyph: { longBranch: 'ᛚ', shortTwig: 'ᛚ' }, sound: 'l', stanza: 15, ancestor: 'laguz' },
  { id: 'yr', name: 'ýr', glyph: { longBranch: 'ᛦ', shortTwig: 'ᛧ' }, sound: 'ʀ (final r)', stanza: 16, ancestor: 'algiz' },
];

/**
 * The twenty-four runes of the earliest inscriptions (c. 2nd–8th centuries),
 * in the order of Dickins' table of the runic alphabet (1915). Early
 * inscriptions differ slightly in the order of the last runes.
 */
export const ELDER_FUTHARK: ElderRune[] = [
  { id: 'fehu', name: '*fehu', glyph: 'ᚠ', sound: 'f', descendant: 'fe' },
  { id: 'uruz', name: '*ūruz', glyph: 'ᚢ', sound: 'u', descendant: 'ur' },
  { id: 'thurisaz', name: '*þurisaz', glyph: 'ᚦ', sound: 'þ', descendant: 'thurs' },
  { id: 'ansuz', name: '*ansuz', glyph: 'ᚨ', sound: 'a', descendant: 'oss' },
  { id: 'raido', name: '*raidō', glyph: 'ᚱ', sound: 'r', descendant: 'reid' },
  { id: 'kaunan', name: '*kaunan', glyph: 'ᚲ', sound: 'k', meaningUncertain: true, descendant: 'kaun' },
  { id: 'gebo', name: '*gebō', glyph: 'ᚷ', sound: 'g', writtenWith: 'kaun' },
  { id: 'wunjo', name: '*wunjō', glyph: 'ᚹ', sound: 'w', writtenWith: 'ur' },
  { id: 'hagalaz', name: '*hagalaz', glyph: 'ᚺ', sound: 'h', descendant: 'hagall' },
  { id: 'naudiz', name: '*naudiz', glyph: 'ᚾ', sound: 'n', descendant: 'naudr' },
  { id: 'isaz', name: '*īsaz', glyph: 'ᛁ', sound: 'i', descendant: 'iss' },
  { id: 'jera', name: '*jēra', glyph: 'ᛃ', sound: 'j', descendant: 'ar' },
  { id: 'eihwaz', name: '*eihwaz', glyph: 'ᛇ', sound: 'ï (uncertain)' },
  { id: 'pertho', name: '*perþō', glyph: 'ᛈ', sound: 'p', meaningUncertain: true, writtenWith: 'bjarkan' },
  { id: 'algiz', name: '*algiz', glyph: 'ᛉ', sound: 'z', meaningUncertain: true, descendant: 'yr' },
  { id: 'sowilo', name: '*sōwilō', glyph: 'ᛊ', sound: 's', descendant: 'sol' },
  { id: 'tiwaz', name: '*tīwaz', glyph: 'ᛏ', sound: 't', descendant: 'tyr' },
  { id: 'berkanan', name: '*berkanan', glyph: 'ᛒ', sound: 'b', descendant: 'bjarkan' },
  { id: 'ehwaz', name: '*ehwaz', glyph: 'ᛖ', sound: 'e', writtenWith: 'iss' },
  { id: 'mannaz', name: '*mannaz', glyph: 'ᛗ', sound: 'm', descendant: 'madr' },
  { id: 'laguz', name: '*laguz', glyph: 'ᛚ', sound: 'l', meaningUncertain: true, descendant: 'logr' },
  { id: 'ingwaz', name: '*ingwaz', glyph: 'ᛜ', sound: 'ŋ (ng)' },
  { id: 'dagaz', name: '*dagaz', glyph: 'ᛞ', sound: 'd', writtenWith: 'tyr' },
  { id: 'othala', name: '*ōþalan', glyph: 'ᛟ', sound: 'o' },
];

const YOUNGER = new Map(YOUNGER_FUTHARK.map((r) => [r.id, r]));
const ELDER = new Map(ELDER_FUTHARK.map((r) => [r.id, r]));

export function getYoungerRune(id: string): YoungerRune | undefined {
  return YOUNGER.get(id as YoungerRuneId);
}

export function getElderRune(id: string): ElderRune | undefined {
  return ELDER.get(id as ElderRuneId);
}
