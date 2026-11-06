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

/** A stanza's lines as plain text, one line per row, for sharing or screen readers. */
export function stanzaText(stanza: Stanza): string {
  return stanza.lines.map((l) => l.text.replace(/ /g, ' ')).join('\n');
}
