import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

interface RuneGlyphProps {
  glyph: string;
  size?: number;
  color?: 'text' | 'accent' | 'textMuted';
  style?: StyleProp<TextStyle>;
}

/** A rune drawn with the bundled Noto Sans Runic font, hidden from screen readers (labels carry the name). */
export function RuneGlyph({ glyph, size = 40, color = 'text', style }: RuneGlyphProps) {
  const { colors } = useTheme();
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      allowFontScaling={false}
      style={[
        { fontFamily: fonts.runic, fontSize: size, lineHeight: Math.round(size * 1.3), color: colors[color] },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}
