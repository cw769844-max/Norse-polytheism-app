import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { getYoungerRune } from '@/content/runes/futhark';
import { useSettings } from '@/features/settings/SettingsContext';
import type { CalendarDate } from '@/features/wheel/types';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { RuneGlyph } from './RuneGlyph';
import { useRuneDraw } from './useRuneDraw';

export function RuneDrawCard({ today }: { today: CalendarDate }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { rune: drawnId, draw } = useRuneDraw(today);
  const rune = drawnId ? getYoungerRune(drawnId) : undefined;

  return (
    <Card>
      <AppText variant="overline" color="textMuted">
        {t('runes.draw.title')}
      </AppText>
      {!rune ? (
        <>
          <AppText>{t('runes.draw.prompt')}</AppText>
          <Pressable
            onPress={draw}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}
          >
            <AppText variant="bodyStrong" color="onAccent">
              {t('runes.draw.button')}
            </AppText>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.drawn} accessible accessibilityLabel={`${rune.name}: ${t(`runes.youngerRunes.${rune.id}.meaning`)}`}>
            <RuneGlyph glyph={rune.glyph[settings.runeStyle]} size={64} color="accent" />
            <View style={styles.flex}>
              <AppText variant="title">{rune.name}</AppText>
              <AppText color="textMuted">{t(`runes.youngerRunes.${rune.id}.meaning`)}</AppText>
            </View>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/rune/[id]', params: { id: rune.id } })}
            accessibilityRole="link"
            hitSlop={8}
            style={styles.link}
          >
            <AppText variant="bodyStrong" color="accent">
              {t('runes.draw.open')} →
            </AppText>
          </Pressable>
          <AppText variant="caption" color="textMuted">
            {t('runes.draw.again')}
          </AppText>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  drawn: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  flex: { flex: 1, gap: 2 },
  link: { alignSelf: 'flex-start', paddingTop: spacing.xs },
});
