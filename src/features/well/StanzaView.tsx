import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { linesText, type PoemLine } from '@/content/poems';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, spacing } from '@/theme/tokens';

const GAP = '* * *';
const LOST = /^(\.{3,}|…+)$/;

function isLost(text: string): boolean {
  return text === GAP || LOST.test(text.trim());
}

interface LinesViewProps {
  lines: PoemLine[];
  /** Larger type for the reader; smaller for cards. */
  size?: 'reader' | 'card';
  /** Old Norse is set in italic so the two texts are easy to tell apart. */
  language?: 'en' | 'non';
  /** Prefix for the accessibility label, e.g. "Stanza 77". */
  label?: string;
}

/**
 * A stanza laid out as printed, with indented short lines and marked gaps.
 * Half-lines are separated by an em space (U+2003).
 */
export function LinesView({ lines, size = 'reader', language = 'en', label }: LinesViewProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const lineStyle = size === 'reader' ? styles.readerLine : styles.cardLine;
  const spoken = linesText(lines)
    .split('\n')
    .map((l) => (isLost(l) ? t('reader.gap') : l))
    .join('\n');

  return (
    <View
      accessible
      accessibilityLabel={label ? `${label}. ${spoken}` : spoken}
      accessibilityLanguage={language === 'non' ? 'is' : 'en'}
    >
      {lines.map((line, i) => {
        const lost = isLost(line.text);
        return (
          <AppText
            key={i}
            style={[
              lineStyle,
              language === 'non' && styles.oldNorse,
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

export type ReaderLanguage = 'en' | 'non' | 'both';

interface StanzaPairProps {
  english: PoemLine[];
  original?: PoemLine[];
  mode: ReaderLanguage;
  size?: 'reader' | 'card';
  label?: string;
}

/** English, Old Norse, or both one after the other (stacked works on every screen width). */
export function StanzaPair({ english, original, mode, size = 'reader', label }: StanzaPairProps) {
  const { colors } = useTheme();
  const showOriginal = original && (mode === 'non' || mode === 'both');
  const showEnglish = !showOriginal || mode !== 'non';

  return (
    <View style={styles.pair}>
      {showOriginal && <LinesView lines={original} size={size} language="non" label={label} />}
      {showOriginal && showEnglish && <View style={[styles.rule, { backgroundColor: colors.border }]} />}
      {showEnglish && <LinesView lines={english} size={size} label={showOriginal ? undefined : label} />}
    </View>
  );
}

const styles = StyleSheet.create({
  readerLine: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 28 },
  cardLine: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 25 },
  oldNorse: { fontFamily: fonts.displayItalic },
  indent: { paddingLeft: spacing.xl },
  pair: { gap: spacing.sm },
  rule: { height: StyleSheet.hairlineWidth, width: 48 },
});
