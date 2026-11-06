import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { getPoem, getStanza } from '@/content/poems';
import { useSettings } from '@/features/settings/SettingsContext';
import { StanzaPair } from '@/features/well/StanzaView';
import type { CalendarDate } from '@/features/wheel/types';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, spacing } from '@/theme/tokens';

import { dailyStanzaFor, promptKey } from './dailyStanza';

export function DailyStanzaCard({ today }: { today: CalendarDate }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const ref = dailyStanzaFor(today);
  const poem = getPoem(ref.poem);
  const stanza = poem && getStanza(poem, ref.n);
  if (!poem || !stanza) return null;

  return (
    <Card>
      <AppText variant="overline" color="textMuted">
        {t('daily.title')}
      </AppText>
      <StanzaPair english={stanza.lines} original={stanza.original} mode={settings.readerLanguage} size="card" />
      <AppText variant="caption" color="textMuted">
        {poem.title} {stanza.n} · {poem.translator}
      </AppText>
      <View style={[styles.prompt, { borderLeftColor: colors.accent }]}>
        <AppText variant="overline" color="accent">
          {t('daily.reflect')}
        </AppText>
        <AppText style={{ fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 24 }}>
          {t(promptKey(ref))}
        </AppText>
      </View>
      <Pressable
        onPress={() =>
          router.push({ pathname: '/well/[poem]', params: { poem: poem.id, stanza: String(stanza.n) } })
        }
        accessibilityRole="link"
        hitSlop={8}
        style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
      >
        <AppText variant="bodyStrong" color="accent">
          {t('daily.readInContext')} →
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  prompt: { borderLeftWidth: 2, paddingLeft: spacing.md, gap: 2, marginTop: spacing.xs },
  link: { alignSelf: 'flex-start', paddingTop: spacing.xs },
});
