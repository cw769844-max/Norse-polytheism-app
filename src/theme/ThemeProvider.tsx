import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings } from '@/features/settings/SettingsContext';

import { palettes, type ColorScheme, type Palette } from './tokens';

interface ThemeValue {
  scheme: ColorScheme;
  colors: Palette;
}

const ThemeContext = createContext<ThemeValue>({ scheme: 'dark', colors: palettes.dark });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const system = useColorScheme();

  const scheme: ColorScheme =
    settings.appearance === 'system' ? (system === 'light' ? 'light' : 'dark') : settings.appearance;

  const value = useMemo(() => ({ scheme, colors: palettes[scheme] }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
