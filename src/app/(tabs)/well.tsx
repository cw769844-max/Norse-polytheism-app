import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { KnotDivider } from '@/components/KnotDivider';
import { Screen } from '@/components/Screen';
import { TierBadge } from '@/components/TierBadge';
import type { SourceTier } from '@/features/wheel/types';
import { spacing } from '@/theme/tokens';

const TIERS: SourceTier[] = ['attested', 'scholarly', 'community', 'upg'];

export default function WellScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">{t('well.title')}</AppText>
        <AppText variant="callout" color="textMuted">
          {t('well.intro')}
        </AppText>
      </View>

      <KnotDivider />

      <View style={styles.section}>
        <AppText variant="heading">{t('well.tiersTitle')}</AppText>
        <AppText>{t('well.tiersIntro')}</AppText>
        {TIERS.map((tier) => (
          <Card key={tier}>
            <TierBadge tier={tier} />
            <AppText>{t(`tier.description.${tier}`)}</AppText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.sm },
  section: { gap: spacing.md },
});
