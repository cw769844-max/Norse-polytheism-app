import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { KnotDivider } from '@/components/KnotDivider';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TierBadge } from '@/components/TierBadge';
import { ELDER_FUTHARK, YOUNGER_FUTHARK, type RuneStyle } from '@/content/runes/futhark';
import { RUNE_POEM_EDITION } from '@/content/runes/poems';
import { RuneDrawCard } from '@/features/runes/RuneDrawCard';
import { RuneGrid } from '@/features/runes/RuneGrid';
import { useSettings } from '@/features/settings/SettingsContext';
import { useToday } from '@/hooks/useToday';
import { spacing } from '@/theme/tokens';

type Row = 'younger' | 'elder';

export default function RunesScreen() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();
  const today = useToday();
  const [row, setRow] = useState<Row>('younger');

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">{t('runes.title')}</AppText>
        <AppText variant="callout" color="textMuted">
          {t('runes.intro')}
        </AppText>
      </View>

      <RuneDrawCard today={today} />

      <KnotDivider />

      <SegmentedControl<Row>
        label={t('runes.title')}
        value={row}
        onChange={setRow}
        options={[
          { value: 'younger', label: t('runes.younger') },
          { value: 'elder', label: t('runes.elder') },
        ]}
      />

      {row === 'younger' ? (
        <View style={styles.section}>
          <Card>
            <TierBadge tier="attested" />
            <AppText variant="bodyStrong">{t('runes.youngerCount')}</AppText>
            <AppText color="textMuted">{t('runes.youngerAbout')}</AppText>
          </Card>
          <SegmentedControl<RuneStyle>
            label={t('runes.style')}
            value={settings.runeStyle}
            onChange={(runeStyle) => update({ runeStyle })}
            options={[
              { value: 'longBranch', label: t('runes.styleOption.longBranch') },
              { value: 'shortTwig', label: t('runes.styleOption.shortTwig') },
            ]}
          />
          <AppText variant="caption" color="textMuted">
            {t('runes.styleHelp')}
          </AppText>
          <RuneGrid
            runes={YOUNGER_FUTHARK.map((r) => ({
              id: r.id,
              glyph: r.glyph[settings.runeStyle],
              name: r.name,
              sound: r.sound,
            }))}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Card>
            <TierBadge tier="scholarly" />
            <AppText variant="bodyStrong">{t('runes.elderCount')}</AppText>
            <AppText color="textMuted">{t('runes.elderAbout')}</AppText>
          </Card>
          <RuneGrid runes={ELDER_FUTHARK.map((r) => ({ id: r.id, glyph: r.glyph, name: r.name, sound: r.sound }))} />
        </View>
      )}

      <View style={styles.footer}>
        <AppText variant="caption" color="textMuted">
          {t('runes.modernNote')}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {t('runes.sourceNote', {
            editor: RUNE_POEM_EDITION.editor,
            title: RUNE_POEM_EDITION.title,
            year: RUNE_POEM_EDITION.year,
          })}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.sm },
  section: { gap: spacing.md },
  footer: { gap: spacing.sm, paddingTop: spacing.sm },
});
