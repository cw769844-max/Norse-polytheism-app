import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/** A small interlace knot between two rules, used to separate sections. */
export function KnotDivider() {
  const { colors } = useTheme();
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
      <Svg width={36} height={20} viewBox="0 0 36 20">
        <Path
          d="M4 10 C 10 0, 16 0, 18 10 S 26 20, 32 10 M4 10 C 10 20, 16 20, 18 10 S 26 0, 32 10"
          stroke={colors.accent}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <Line x1={0} y1={10} x2={4} y2={10} stroke={colors.accent} strokeWidth={1.6} />
        <Line x1={32} y1={10} x2={36} y2={10} stroke={colors.accent} strokeWidth={1.6} />
      </Svg>
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
});
