import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { fromDate, sameDate } from '@/features/wheel/calendarDate';
import type { CalendarDate } from '@/features/wheel/types';

/** Today's local date, updating at midnight and when the app returns to the foreground. */
export function useToday(): CalendarDate {
  const [today, setToday] = useState(() => fromDate(new Date()));

  useEffect(() => {
    const refresh = () => {
      const now = fromDate(new Date());
      setToday((prev) => (sameDate(prev, now) ? prev : now));
    };

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    const timer = setTimeout(refresh, midnight.getTime() - now.getTime());
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [today]);

  return today;
}
