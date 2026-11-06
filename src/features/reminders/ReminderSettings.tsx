import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { OptionGroup } from '@/components/OptionGroup';
import { ToggleRow } from '@/components/ToggleRow';
import { useSettings } from '@/features/settings/SettingsContext';
import { formatInstant } from '@/i18n/format';
import { spacing } from '@/theme/tokens';

import { hasReminderPermission, remindersSupported, requestReminderPermission } from './notifications';
import type { LeadDays } from './plan';

const LEAD_OPTIONS: LeadDays[] = [0, 1, 3, 7];
const HOURS = [7, 9, 12, 18];

function hourLabel(hour: number): string {
  return formatInstant(new Date(2001, 0, 1, hour), { hour: 'numeric', minute: '2-digit' });
}

export function ReminderSettings() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();
  const prefs = settings.reminders;
  const [blocked, setBlocked] = useState(false);

  // Reminders can be switched off in system settings while the app is closed.
  useEffect(() => {
    if (!remindersSupported || !prefs.enabled) return;
    hasReminderPermission()
      .then((granted) => setBlocked(!granted))
      .catch(() => {});
  }, [prefs.enabled]);

  async function onToggle(enabled: boolean) {
    if (!enabled) {
      update({ reminders: { ...prefs, enabled: false } });
      return;
    }
    const result = await requestReminderPermission(t);
    setBlocked(result !== 'granted');
    if (result === 'granted') update({ reminders: { ...prefs, enabled: true } });
  }

  return (
    <View style={styles.section}>
      <AppText variant="overline" color="textMuted">
        {t('reminders.title')}
      </AppText>
      <ToggleRow
        label={t('reminders.toggle')}
        description={remindersSupported ? t('reminders.toggleHelp') : t('reminders.unsupported')}
        value={prefs.enabled && remindersSupported}
        onValueChange={onToggle}
        disabled={!remindersSupported}
      />

      {blocked && (
        <View style={styles.notice}>
          <AppText variant="caption" color="ember">
            {t('reminders.denied')}
          </AppText>
          <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button" hitSlop={8}>
            <AppText variant="caption" color="accent">
              {t('reminders.openSettings')} →
            </AppText>
          </Pressable>
        </View>
      )}

      {prefs.enabled && remindersSupported && (
        <>
          <OptionGroup
            title={t('reminders.lead')}
            value={String(prefs.leadDays)}
            onChange={(value) => update({ reminders: { ...prefs, leadDays: Number(value) as LeadDays } })}
            options={LEAD_OPTIONS.map((days) => ({ value: String(days), label: t(`reminders.leadOption.${days}`) }))}
          />
          <OptionGroup
            title={t('reminders.time')}
            value={String(prefs.hour)}
            onChange={(value) => update({ reminders: { ...prefs, hour: Number(value) } })}
            options={HOURS.map((hour) => ({ value: String(hour), label: hourLabel(hour) }))}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  notice: { gap: spacing.xs },
});
