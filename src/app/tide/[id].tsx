import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CheckboxRow } from '@/components/Checkbox';
import { KnotDivider } from '@/components/KnotDivider';
import { Screen } from '@/components/Screen';
import { TierBadge } from '@/components/TierBadge';
import { usePrep } from '@/features/prep/PrepContext';
import { useSettings } from '@/features/settings/SettingsContext';
import { daysBetween } from '@/features/wheel/calendarDate';
import { isOngoing, ruleFor } from '@/features/wheel/reckoning';
import { getTide } from '@/features/wheel/tides';
import { useNextOccurrences } from '@/features/wheel/useWheel';
import { useToday } from '@/hooks/useToday';
import { describeRule, formatDate, relativeDay } from '@/i18n/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, spacing } from '@/theme/tokens';

export default function TideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const today = useToday();
  const prep = usePrep();
  const tide = getTide(id);
  const [current, after] = useNextOccurrences(tide, today);

  if (!tide) {
    return (
      <Screen edges={['bottom']}>
        <AppText>{t('common.notFound')}</AppText>
      </Screen>
    );
  }

  const key = `tides.${tide.id}`;
  const name = t(`${key}.name`);
  const ongoing = current ? isOngoing(current, today) : false;

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: name }} />

      <View style={styles.header}>
        <AppText variant="overline" color="accent">
          {tide.oldNorse}
        </AppText>
        <AppText variant="hero">{name}</AppText>
        <AppText variant="callout" color="textMuted" style={{ fontFamily: fonts.displayItalic }}>
          {t(`${key}.summary`)}
        </AppText>
      </View>

      <Card>
        <AppText variant="overline" color="textMuted">
          {t('tide.when')}
        </AppText>
        {current && (
          <View style={styles.whenRow}>
            <View style={styles.flex}>
              <AppText variant="caption" color="textMuted">
                {t('tide.thisTime')}
              </AppText>
              <AppText variant="bodyStrong">{formatDate(current.start, 'long')}</AppText>
            </View>
            <AppText variant="heading" color="accent">
              {ongoing
                ? t('common.dayOf', { day: daysBetween(current.start, today) + 1, total: tide.durationDays })
                : relativeDay(t, today, current.start)}
            </AppText>
          </View>
        )}
        {after && (
          <View>
            <AppText variant="caption" color="textMuted">
              {t('tide.nextTime')}
            </AppText>
            <AppText>{formatDate(after.start, 'long')}</AppText>
          </View>
        )}
        {tide.durationDays > 1 && (
          <AppText variant="caption" color="textMuted">
            {t('tide.lasts', { count: tide.durationDays })}
          </AppText>
        )}
        <View style={[styles.rule, { borderTopColor: colors.border }]}>
          <AppText variant="caption" color="textMuted">
            {t('tide.howDated', { reckoning: t(`settings.reckoningOption.${settings.reckoning}`) })}
          </AppText>
          <AppText>{describeRule(t, ruleFor(tide, settings.reckoning), settings.hemisphere)}</AppText>
        </View>
      </Card>

      <KnotDivider />

      <Section title={t('tide.about')}>
        <AppText>{t(`${key}.about`)}</AppText>
      </Section>

      <Section title={t('tide.observance')}>
        <AppText>{t(`${key}.observance`)}</AppText>
      </Section>

      {current && (
        <Section title={t('tide.prepare')}>
          <AppText variant="caption" color="textMuted">
            {prep.doneCount(current) === tide.prepKeys.length
              ? t('tide.prepDone')
              : t('tide.prepProgress', { done: prep.doneCount(current), total: tide.prepKeys.length })}
          </AppText>
          {tide.prepKeys.map((item) => (
            <CheckboxRow
              key={item}
              label={t(`${key}.prep.${item}`)}
              checked={prep.isChecked(current, item)}
              onToggle={() => prep.toggle(current, item)}
            />
          ))}
          <AppText variant="caption" color="textMuted">
            {t('tide.prepHelp', { name })}
          </AppText>
        </Section>
      )}

      <Section title={t('tide.sources')}>
        {tide.sources.map((source) => (
          <Card key={source.noteKey}>
            <TierBadge tier={source.tier} />
            <AppText variant="callout" style={{ fontFamily: fonts.displayItalic }}>
              {source.citation}
            </AppText>
            <AppText color="textMuted">{t(`${key}.sources.${source.noteKey}`)}</AppText>
          </Card>
        ))}
        <AppText variant="caption" color="textMuted">
          {t('tide.sourcesNote')}
        </AppText>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  whenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.sm, marginTop: spacing.xs, gap: 2 },
  section: { gap: spacing.sm },
});
