import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function CheckboxRow({ label, checked, onToggle }: CheckboxRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.box,
          { borderColor: checked ? colors.accent : colors.textMuted, backgroundColor: checked ? colors.accent : 'transparent' },
        ]}
      >
        {checked && (
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M2.5 7.5l3 3 6-7" stroke={colors.onAccent} strokeWidth={2} fill="none" strokeLinecap="round" />
          </Svg>
        )}
      </View>
      <AppText
        style={[styles.label, checked && { textDecorationLine: 'line-through' }]}
        color={checked ? 'textMuted' : 'text'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.xs, minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: { flex: 1 },
});
