import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { stanzaText, type Stanza } from '@/content/poems';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, spacing } from '@/theme/tokens';

const GAP = '* * *';
const LOST = /^\.{3,}$/;

interface StanzaViewProps {
  stanza: Stanza;
  /** Larger type for the reader; smaller for cards. */
  size?: 'reader' | 'card';
}

/** A stanza laid out as Bellows printed it, with indented short lines and marked gaps. */
export function StanzaView({ stanza, size = 'reader' }: StanzaViewProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const lineStyle = size === 'reader' ? styles.readerLine : styles.cardLine;

  return (
    <View
      accessible
      accessibilityLabel={`${t('reader.stanza', { n: stanza.n })}. ${stanzaText(stanza)
        .split('\n')
        .map((l) => (l === GAP || LOST.test(l) ? t('reader.gap') : l))
        .join('\n')}`}
    >
      {stanza.lines.map((line, i) => {
        const lost = line.text === GAP || LOST.test(line.text);
        return (
          <AppText
            key={i}
            style={[
              lineStyle,
              line.indent && styles.indent,
              lost && { color: colors.textMuted, letterSpacing: 2 },
            ]}
          >
            {line.text}
          </AppText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  readerLine: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 28 },
  cardLine: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 25 },
  indent: { paddingLeft: spacing.xl },
});
