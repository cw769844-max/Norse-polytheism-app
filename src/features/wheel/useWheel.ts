import { useMemo } from 'react';

import { useSettings } from '@/features/settings/SettingsContext';

import { moonInfo, type MoonInfo } from './astronomy';
import { nextOccurrencesOf, occurrencesInYear, upcomingTides, type ReckoningOptions } from './reckoning';
import type { CalendarDate, TideDefinition, TideOccurrence } from './types';

export function useReckoningOptions(): ReckoningOptions {
  const { settings } = useSettings();
  return useMemo(
    () => ({ reckoning: settings.reckoning, hemisphere: settings.hemisphere }),
    [settings.reckoning, settings.hemisphere],
  );
}

export function useUpcomingTides(today: CalendarDate): TideOccurrence[] {
  const options = useReckoningOptions();
  return useMemo(() => upcomingTides(today, options), [today, options]);
}

export function useTidesInYear(year: number): TideOccurrence[] {
  const options = useReckoningOptions();
  return useMemo(() => occurrencesInYear(year, options), [year, options]);
}

export function useNextOccurrences(tide: TideDefinition | undefined, today: CalendarDate): TideOccurrence[] {
  const options = useReckoningOptions();
  return useMemo(() => (tide ? nextOccurrencesOf(tide, today, options) : []), [tide, today, options]);
}

/** Moon information for today; recomputed when the date changes. */
export function useMoon(today: CalendarDate): MoonInfo {
  return useMemo(() => {
    const now = new Date();
    // `today` is the dependency that keeps this fresh across midnight.
    void today;
    return moonInfo(now);
  }, [today]);
}
