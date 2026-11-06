import '@/i18n';

import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_600SemiBold,
} from '@expo-google-fonts/eb-garamond';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
  type Theme,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrepProvider } from '@/features/prep/PrepContext';
import { useNotificationObserver, useReminderSync } from '@/features/reminders/useReminders';
import { SettingsProvider, useSettings } from '@/features/settings/SettingsContext';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PrepProvider>
          <ThemeProvider>
            <RootNavigator fontsReady={fontsLoaded || fontError != null} />
          </ThemeProvider>
        </PrepProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { loaded: settingsReady } = useSettings();
  const { scheme, colors } = useTheme();
  const ready = fontsReady && settingsReady;
  useReminderSync();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.ember,
      },
    };
  }, [scheme, colors]);

  if (!ready) return null;

  return <ReadyNavigator scheme={scheme} colors={colors} navigationTheme={navigationTheme} />;
}

function ReadyNavigator({
  scheme,
  colors,
  navigationTheme,
}: {
  scheme: ReturnType<typeof useTheme>['scheme'];
  colors: ReturnType<typeof useTheme>['colors'];
  navigationTheme: Theme;
}) {
  // Navigation must be mounted before a tapped reminder can open its screen.
  useNotificationObserver();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: { fontFamily: fonts.display, color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tide/[id]" options={{ title: '' }} />
        <Stack.Screen name="well/[poem]" options={{ title: '' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
