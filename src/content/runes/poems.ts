import type { PoemLine } from '@/content/poems';

import data from './poems.json';

export type RunePoemId = 'norwegian' | 'icelandic';

export interface RunePoemStanza {
  n: number;
  original: PoemLine[];
  english: PoemLine[];
  /** Icelandic poem only: a Latin gloss of the rune's name and an alliterating word for "king". */
  gloss?: { latin: string; king: string };
}

export interface RunePoem {
  id: RunePoemId;
  title: string;
  stanzas: RunePoemStanza[];
}

export interface RunePoemEdition {
  editor: string;
  title: string;
  publisher: string;
  year: number;
  license: string;
  source: string;
}

export const RUNE_POEM_EDITION: RunePoemEdition = data.edition;

export const RUNE_POEMS: Record<RunePoemId, RunePoem> = data.poems as Record<RunePoemId, RunePoem>;

export function runePoemStanza(poem: RunePoemId, n: number): RunePoemStanza | undefined {
  return RUNE_POEMS[poem].stanzas.find((s) => s.n === n);
}
