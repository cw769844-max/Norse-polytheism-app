import havamal from './havamal.json';
import voluspa from './voluspa.json';

export interface PoemLine {
  /** Half-lines are separated by an em space (U+2003), as in Bellows' layout. */
  text: string;
  indent: boolean;
}

export interface Stanza {
  /** Stanza number in Bellows' edition. */
  n: number;
  lines: PoemLine[];
  /** Bellows' footnotes for this stanza (1923). */
  notes: string[];
  /** The Old Norse text Bellows translated (Hildebrand–Gering, 1904). */
  original?: PoemLine[];
  /** The stanza's number in the Old Norse edition, when it differs from Bellows'. */
  originalNumber?: number;
}

export interface OriginalEdition {
  /** ISO 639-3 code: "non" is Old Norse. */
  language: string;
  editors: string;
  title: string;
  year: number;
  license: string;
  source: string;
}

export interface Poem {
  id: PoemId;
  /** Old Norse title. */
  title: string;
  /** The translator's English title. */
  englishTitle: string;
  translator: string;
  year: number;
  license: string;
  source: string;
  /** The translator's introductory note, as paragraphs. */
  introduction: string[];
  stanzas: Stanza[];
  original?: OriginalEdition;
}

export type PoemId = 'havamal' | 'voluspa';

export const POEMS: Poem[] = [havamal as Poem, voluspa as Poem];

const BY_ID = new Map(POEMS.map((p) => [p.id, p]));

export function getPoem(id: string): Poem | undefined {
  return BY_ID.get(id as PoemId);
}

export function getStanza(poem: Poem, n: number): Stanza | undefined {
  return poem.stanzas.find((s) => s.n === n);
}

/** Lines as plain text, one per row, for sharing or screen readers. */
export function linesText(lines: PoemLine[]): string {
  return lines.map((l) => l.text.replace(/\u2003/g, ' ')).join('\n');
}

export function stanzaText(stanza: Stanza): string {
  return linesText(stanza.lines);
}
