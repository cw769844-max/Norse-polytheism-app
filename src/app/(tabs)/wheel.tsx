import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useSettings } from '@/features/settings/SettingsContext';
import { daysBetween } from '@/features/wheel/calendarDate';
import { isOngoing } from '@/features/wheel/reckoning';
import { TideRow } from '@/features/wheel/TideRow';
import { useTidesInYear, useUpcomingTides } from '@/features/wheel/useWheel';
import { WheelDial } from '@/features/wheel/WheelDial';
import { useToday } from '@/hooks/useToday';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

export default function WheelScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { width } = useWindowDimensions();
  const today = useToday();
  const [year, setYear] = useState(today.year);

  const occurrences = useTidesInYear(year);
  const [next] = useUpcomingTides(today);
  const reckoningName = t(`settings.reckoningOption.${settings.reckoning}`);
  const nextName = next ? t(`tides.${next.tide.id}.name`) : '';

  let caption = '';
  let value = String(year);
  let title = reckoningName;
  if (next && year === today.year) {
    if (isOngoing(next, today)) {
      caption = t('common.happeningNow');
      value = nextName;
      title = t('common.dayOf', { day: daysBetween(next.start, today) + 1, total: next.tide.durationDays });
    } else {
      const days = daysBetween(today, next.start);
      caption = t('wheel.daysUntil', { count: days });
      value = String(days);
      title = nextName;
    }
  }

  const dialSize = Math.min(width - spacing.lg * 2, 380);

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">{t('wheel.title')}</AppText>
        <AppText variant="caption" color="textMuted">
          {t('wheel.subtitle', { reckoning: reckoningName })}
        </AppText>
      </View>

      <View style={styles.yearRow}>
        <YearButton label="‹" a11y={t('wheel.previousYear')} onPress={() => setYear((y) => y - 1)} />
        <AppText variant="heading" accessibilityLiveRegion="polite">
          {year}
        </AppText>
        <YearButton label="›" a11y={t('wheel.nextYear')} onPress={() => setYear((y) => y + 1)} />
      </View>

      <View style={styles.dialWrap}>
        <WheelDial
          year={year}
          size={dialSize}
          occurrences={occurrences}
          hemisphere={settings.hemisphere}
          today={today}
          highlight={next}
          centerCaption={caption}
          centerValue={value}
          centerTitle={title}
          accessibilityLabel={t('wheel.dialLabel', { year, next: nextName })}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="overline" color="textMuted">
          {t('wheel.tidesThisYear', { year })}
        </AppText>
        {occurrences.map((occ) => (
          <TideRow key={`${occ.tide.id}-${occ.start.month}-${occ.start.day}`} occurrence={occ} today={today} />
        ))}
      </View>

      <Pressable onPress={() => router.navigate('/settings')} accessibilityRole="link" style={styles.link}>
        <AppText variant="caption" style={{ color: colors.accent }}>
          {t('wheel.changeReckoning')} →
        </AppText>
      </Pressable>
    </Screen>
  );
}

function YearButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={8}
      style={({ pressed }) => [
        styles.yearButton,
        { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceRaised : colors.surface },
      ]}
    >
      <AppText variant="heading" color="accent">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  yearButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialWrap: { alignItems: 'center' },
  section: { gap: spacing.sm },
  link: { alignSelf: 'center', paddingVertical: spacing.sm },
});
