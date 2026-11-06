import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { OptionGroup } from '@/components/OptionGroup';
import { Screen } from '@/components/Screen';
import { ReminderSettings } from '@/features/reminders/ReminderSettings';
import { useSettings, type Appearance } from '@/features/settings/SettingsContext';
import type { Hemisphere, Reckoning } from '@/features/wheel/types';
import { spacing } from '@/theme/tokens';

const RECKONINGS: Reckoning[] = ['solar', 'lunar', 'icelandic'];
const HEMISPHERES: Hemisphere[] = ['north', 'south'];
const APPEARANCES: Appearance[] = ['dark', 'light', 'system'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();

  return (
    <Screen>
      <AppText variant="title" style={styles.title}>
        {t('settings.title')}
      </AppText>

      <OptionGroup
        title={t('settings.reckoning')}
        help={t('settings.reckoningHelp')}
        value={settings.reckoning}
        onChange={(reckoning) => update({ reckoning })}
        options={RECKONINGS.map((value) => ({
          value,
          label: t(`settings.reckoningOption.${value}`),
          description: t(`settings.reckoningDescription.${value}`),
        }))}
      />

      <OptionGroup
        title={t('settings.hemisphere')}
        help={t('settings.hemisphereHelp')}
        value={settings.hemisphere}
        onChange={(hemisphere) => update({ hemisphere })}
        options={HEMISPHERES.map((value) => ({ value, label: t(`settings.hemisphereOption.${value}`) }))}
      />

      <ReminderSettings />

      <OptionGroup
        title={t('settings.readerLanguage')}
        help={t('settings.readerLanguageHelp')}
        value={settings.readerLanguage}
        onChange={(readerLanguage) => update({ readerLanguage })}
        options={(['both', 'non', 'en'] as const).map((value) => ({
          value,
          label: t(`reader.languageOption.${value}`),
        }))}
      />

      <OptionGroup
        title={t('settings.appearance')}
        value={settings.appearance}
        onChange={(appearance) => update({ appearance })}
        options={APPEARANCES.map((value) => ({ value, label: t(`settings.appearanceOption.${value}`) }))}
      />

      <Card>
        <AppText variant="heading">{t('settings.values')}</AppText>
        <AppText>{t('settings.valuesBody')}</AppText>
      </Card>

      <Card>
        <AppText variant="heading">{t('settings.free')}</AppText>
        <AppText>{t('settings.freeBody')}</AppText>
      </Card>

      <View style={styles.footer}>
        <AppText variant="caption" color="textMuted">
          {t('app.name')} · {t('settings.version', { version: Constants.expoConfig?.version ?? '0.0.0' })}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingTop: spacing.sm },
  footer: { alignItems: 'center', paddingVertical: spacing.lg },
});
