import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { RuneGlyph } from './RuneGlyph';

export interface RuneTile {
  id: string;
  glyph: string;
  name: string;
  sound: string;
}

export function RuneGrid({ runes }: { runes: RuneTile[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {runes.map((rune) => (
        <Pressable
          key={rune.id}
          onPress={() => router.push({ pathname: '/rune/[id]', params: { id: rune.id } })}
          accessibilityRole="button"
          accessibilityLabel={t('runes.tile', { name: rune.name, sound: rune.sound })}
          style={({ pressed }) => [
            styles.tile,
            { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceRaised : colors.surface },
          ]}
        >
          <RuneGlyph glyph={rune.glyph} size={34} color="accent" />
          <AppText variant="caption" numberOfLines={1} style={styles.name}>
            {rune.name}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '23%',
    flexGrow: 1,
    maxWidth: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  name: { fontFamily: 'Inter_500Medium' },
});
