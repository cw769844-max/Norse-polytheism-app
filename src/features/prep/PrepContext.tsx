import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { dateKey } from '@/features/wheel/calendarDate';
import type { TideOccurrence } from '@/features/wheel/types';

const STORAGE_KEY = 'hearth.prep.v1';
/** Checklists for tides more than this many days old are forgotten. */
const KEEP_DAYS = 400;

/** occurrence key -> checked prep item keys */
type PrepState = Record<string, string[]>;

export function occurrenceKey(occ: TideOccurrence): string {
  return `${occ.tide.id}:${dateKey(occ.start)}`;
}

function prune(state: PrepState, now: Date): PrepState {
  const cutoff = new Date(now.getTime() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  return Object.fromEntries(
    Object.entries(state).filter(([key, items]) => items.length > 0 && key.split(':')[1] >= cutoff),
  );
}

interface PrepValue {
  isChecked: (occ: TideOccurrence, item: string) => boolean;
  toggle: (occ: TideOccurrence, item: string) => void;
  /** Number of the tide's prep items checked for this occurrence. */
  doneCount: (occ: TideOccurrence) => number;
}

const PrepContext = createContext<PrepValue | null>(null);

export function PrepProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrepState>({});

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!cancelled && raw) setState(prune(JSON.parse(raw) as PrepState, new Date()));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((occ: TideOccurrence, item: string) => {
    setState((current) => {
      const key = occurrenceKey(occ);
      const checked = current[key] ?? [];
      const nextItems = checked.includes(item) ? checked.filter((i) => i !== item) : [...checked, item];
      const next = { ...current, [key]: nextItems };
      if (nextItems.length === 0) delete next[key];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<PrepValue>(
    () => ({
      isChecked: (occ, item) => (state[occurrenceKey(occ)] ?? []).includes(item),
      toggle,
      doneCount: (occ) => (state[occurrenceKey(occ)] ?? []).filter((i) => occ.tide.prepKeys.includes(i)).length,
    }),
    [state, toggle],
  );

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}

export function usePrep(): PrepValue {
  const value = useContext(PrepContext);
  if (!value) throw new Error('usePrep must be used inside <PrepProvider>');
  return value;
}
