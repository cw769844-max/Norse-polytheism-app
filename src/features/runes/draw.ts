import { YOUNGER_FUTHARK, type YoungerRuneId } from '@/content/runes/futhark';

/** Pick a Younger Futhark rune. `random` is injectable so the choice can be tested. */
export function drawRune(random: () => number = Math.random): YoungerRuneId {
  const index = Math.min(YOUNGER_FUTHARK.length - 1, Math.floor(random() * YOUNGER_FUTHARK.length));
  return YOUNGER_FUTHARK[index].id;
}
