import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import type { SourceTier } from '@/features/wheel/types';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

const SYMBOL: Record<SourceTier, string> = {
  attested: '📜',
  scholarly: '🔬',
  community: '🔥',
  upg: '🌙',
};

export function TierBadge({ tier }: { tier: SourceTier }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const color = colors.tier[tier];
  return (
    <View
      style={[styles.badge, { borderColor: color }]}
      accessible
      accessibilityLabel={t(`tier.${tier}`)}
    >
      <AppText variant="caption" importantForAccessibility="no-hide-descendants">
        {SYMBOL[tier]}
      </AppText>
      <AppText variant="caption" style={{ color, fontFamily: 'Inter_600SemiBold' }}>
        {t(`tier.${tier}`)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
