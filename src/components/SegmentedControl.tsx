import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** A compact row of mutually exclusive options. */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            aria-checked={selected}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: colors.accent },
              pressed && !selected && { backgroundColor: colors.surfaceRaised },
            ]}
          >
            <AppText variant="bodyStrong" color={selected ? 'onAccent' : 'text'} style={styles.text}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  text: { fontSize: 14, textAlign: 'center' },
});
