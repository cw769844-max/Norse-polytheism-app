import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { formatDate, relativeDay } from '@/i18n/format';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { compareDates, daysBetween } from './calendarDate';
import { isOngoing } from './reckoning';
import type { CalendarDate, TideOccurrence } from './types';

export function TideRow({ occurrence, today }: { occurrence: TideOccurrence; today: CalendarDate }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { tide, start } = occurrence;
  const ongoing = isOngoing(occurrence, today);
  const past = compareDates(occurrence.end, today) < 0;
  const name = t(`tides.${tide.id}.name`);
  const when = ongoing
    ? t('common.happeningNow')
    : past
      ? formatDate(start, 'medium')
      : relativeDay(t, today, start);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/tide/[id]', params: { id: tide.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatDate(start, 'weekdayLong')}, ${when}`}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceRaised : colors.surface },
        past && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.dateBox, { backgroundColor: ongoing ? colors.accent : colors.surfaceRaised }]}>
        <AppText variant="overline" color={ongoing ? 'onAccent' : 'textMuted'}>
          {formatDate(start, 'monthShort')}
        </AppText>
        <AppText variant="heading" color={ongoing ? 'onAccent' : 'text'}>
          {start.day}
        </AppText>
      </View>
      <View style={styles.body}>
        <AppText variant="heading">{name}</AppText>
        <AppText variant="caption" color="textMuted">
          {tide.oldNorse !== name ? `${tide.oldNorse} · ` : ''}
          {when}
        </AppText>
      </View>
      {!past && !ongoing && daysBetween(today, start) <= 14 && (
        <View style={[styles.soon, { backgroundColor: colors.ember }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateBox: {
    width: 56,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  body: { flex: 1, gap: 2 },
  soon: { width: 8, height: 8, borderRadius: 4 },
});
