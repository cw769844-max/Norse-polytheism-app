import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { getYoungerRune, type YoungerRuneId } from '@/content/runes/futhark';
import { dateKey } from '@/features/wheel/calendarDate';
import type { CalendarDate } from '@/features/wheel/types';

import { drawRune } from './draw';

const STORAGE_KEY = 'hearth.runeDraw.v1';

interface StoredDraw {
  date: string;
  rune: YoungerRuneId;
}

/** One rune a day: drawn on request, kept until local midnight. */
export function useRuneDraw(today: CalendarDate) {
  const key = dateKey(today);
  const [stored, setStored] = useState<StoredDraw | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const value = JSON.parse(raw) as StoredDraw;
        if (getYoungerRune(value.rune)) setStored(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const draw = useCallback(() => {
    const value: StoredDraw = { date: key, rune: drawRune() };
    setStored(value);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)).catch(() => {});
  }, [key]);

  const todays = stored?.date === key ? stored.rune : null;
  return { rune: todays, draw };
}
