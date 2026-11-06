import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { KnotDivider } from '@/components/KnotDivider';
import { Screen } from '@/components/Screen';
import { TierBadge } from '@/components/TierBadge';
import { POEMS } from '@/content/poems';
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

      <View style={styles.section}>
        <AppText variant="overline" color="textMuted">
          {t('well.library')}
        </AppText>
        {POEMS.map((poem) => (
          <Card
            key={poem.id}
            onPress={() => router.push({ pathname: '/well/[poem]', params: { poem: poem.id } })}
            accessibilityLabel={`${poem.title}, ${poem.englishTitle}`}
          >
            <AppText variant="overline" color="accent">
              {poem.englishTitle}
            </AppText>
            <AppText variant="title">{poem.title}</AppText>
            <AppText>{t(`well.poems.${poem.id}`)}</AppText>
            <AppText variant="caption" color="textMuted">
              {t('well.stanzas', { count: poem.stanzas.length })} ·{' '}
              {t('well.translatedBy', { translator: poem.translator, year: poem.year })}
            </AppText>
          </Card>
        ))}
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
