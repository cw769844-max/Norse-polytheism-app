import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { KnotDivider } from '@/components/KnotDivider';
import { MoonGlyph } from '@/components/MoonGlyph';
import { Screen } from '@/components/Screen';
import { useSettings } from '@/features/settings/SettingsContext';
import { daysBetween, fromDate } from '@/features/wheel/calendarDate';
import { isOngoing } from '@/features/wheel/reckoning';
import { TideRow } from '@/features/wheel/TideRow';
import { useMoon, useUpcomingTides } from '@/features/wheel/useWheel';
import { useToday } from '@/hooks/useToday';
import { formatDate, relativeDay } from '@/i18n/format';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

export default function HearthScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const today = useToday();
  const upcoming = useUpcomingTides(today);
  const moon = useMoon(today);

  const [next, ...rest] = upcoming;
  const ongoing = next ? isOngoing(next, today) : false;
  const nextName = next ? t(`tides.${next.tide.id}.name`) : '';

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="overline" color="textMuted">
          {formatDate(today, 'long')}
        </AppText>
        <AppText variant="hero">{t('hearth.greeting')}</AppText>
      </View>

      <KnotDivider />

      {next && (
        <Card
          highlight
          onPress={() => router.push({ pathname: '/tide/[id]', params: { id: next.tide.id } })}
          accessibilityLabel={`${ongoing ? t('hearth.ongoingTide') : t('hearth.nextTide')}: ${nextName}, ${formatDate(next.start, 'weekdayLong')}`}
        >
          <AppText variant="overline" color="accent">
            {ongoing ? t('hearth.ongoingTide') : t('hearth.nextTide')}
          </AppText>
          <View style={styles.tideTitle}>
            <AppText variant="title" style={styles.flex}>
              {nextName}
            </AppText>
            <AppText variant="heading" color="accent">
              {ongoing
                ? t('common.dayOf', { day: daysBetween(next.start, today) + 1, total: next.tide.durationDays })
                : relativeDay(t, today, next.start)}
            </AppText>
          </View>
          <AppText variant="caption" color="textMuted">
            {next.tide.oldNorse !== nextName ? `${next.tide.oldNorse} · ` : ''}
            {formatDate(next.start, 'weekdayLong')}
          </AppText>
          <AppText variant="callout">{t(`tides.${next.tide.id}.summary`)}</AppText>
        </Card>
      )}

      <Card>
        <AppText variant="overline" color="textMuted">
          {t('moon.title')}
        </AppText>
        <View style={styles.moonRow}>
          <MoonGlyph angle={moon.angle} size={64} hemisphere={settings.hemisphere} />
          <View style={styles.flex}>
            <AppText variant="heading">{t(`moon.phase.${moon.phase}`)}</AppText>
            <AppText variant="caption" color="textMuted">
              {t('moon.illumination', { percent: Math.round(moon.illumination * 100) })}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('moon.nextFull', { when: relativeDay(t, today, fromDate(moon.nextFull)).toLowerCase() })}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('moon.nextNew', { when: relativeDay(t, today, fromDate(moon.nextNew)).toLowerCase() })}
            </AppText>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <AppText variant="overline" color="textMuted">
          {t('hearth.comingUp')}
        </AppText>
        {rest.slice(0, 3).map((occ) => (
          <TideRow key={`${occ.tide.id}-${occ.start.year}-${occ.start.month}-${occ.start.day}`} occurrence={occ} today={today} />
        ))}
        <Pressable
          onPress={() => router.navigate('/wheel')}
          accessibilityRole="link"
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
        >
          <AppText variant="bodyStrong" style={{ color: colors.accent }}>
            {t('hearth.seeWheel')} →
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  tideTitle: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  flex: { flex: 1 },
  moonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  section: { gap: spacing.sm },
  link: { paddingVertical: spacing.sm, alignSelf: 'flex-start' },
});
