import type { Hemisphere } from '@/features/wheel/types';

/** Regions whose population lives mostly in the southern hemisphere. */
const SOUTHERN_REGIONS = new Set([
  'AR', 'AU', 'BO', 'BR', 'BW', 'CL', 'FJ', 'LS', 'MG', 'MU', 'MW', 'MZ', 'NA', 'NZ',
  'PE', 'PY', 'SZ', 'TO', 'UY', 'WS', 'ZA', 'ZM', 'ZW',
]);

/** A first guess at the user's hemisphere from their region; they can change it in settings. */
export function guessHemisphere(regionCode: string | null | undefined): Hemisphere {
  return regionCode && SOUTHERN_REGIONS.has(regionCode.toUpperCase()) ? 'south' : 'north';
}
