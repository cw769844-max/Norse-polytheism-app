import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { RuneStyle } from '@/content/runes/futhark';
import { DEFAULT_REMINDER_PREFS, type ReminderPrefs } from '@/features/reminders/plan';
import type { ReaderLanguage } from '@/features/well/StanzaView';
import type { Hemisphere, Reckoning } from '@/features/wheel/types';

import { guessHemisphere } from './hemisphere';

export type Appearance = 'dark' | 'light' | 'system';

export interface Settings {
  reckoning: Reckoning;
  hemisphere: Hemisphere;
  appearance: Appearance;
  reminders: ReminderPrefs;
  /** Which text the Edda reader shows. */
  readerLanguage: ReaderLanguage;
  /** Long-branch or short-twig forms of the Younger Futhark. */
  runeStyle: RuneStyle;
}

const STORAGE_KEY = 'hearth.settings.v1';

function defaultSettings(): Settings {
  let region: string | null = null;
  try {
    region = getLocales()[0]?.regionCode ?? null;
  } catch {
    region = null;
  }
  return {
    reckoning: 'solar',
    hemisphere: guessHemisphere(region),
    appearance: 'dark',
    reminders: DEFAULT_REMINDER_PREFS,
    readerLanguage: 'both',
    runeStyle: 'longBranch',
  };
}

interface SettingsValue {
  settings: Settings;
  /** False until stored settings have been read from disk. */
  loaded: boolean;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const stored = JSON.parse(raw) as Partial<Settings>;
        setSettings((current) => ({
          ...current,
          ...stored,
          reminders: { ...current.reminders, ...stored.reminders },
        }));
      })
      .catch(() => {
        // Corrupt or unavailable storage: keep defaults.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside <SettingsProvider>');
  return value;
}
