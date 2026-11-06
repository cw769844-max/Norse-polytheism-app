import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radii, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface OptionGroupProps<T extends string> {
  title: string;
  help?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A labelled group of radio options, each with an optional description. */
export function OptionGroup<T extends string>({ title, help, options, value, onChange }: OptionGroupProps<T>) {
  const { colors } = useTheme();
  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={title}>
      <AppText variant="overline" color="textMuted">
        {title}
      </AppText>
      {help ? (
        <AppText variant="caption" color="textMuted">
          {help}
        </AppText>
      ) : null}
      <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {options.map((option, i) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              style={({ pressed }) => [
                styles.option,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                pressed && { backgroundColor: colors.surfaceRaised },
              ]}
            >
              <View style={[styles.radio, { borderColor: selected ? colors.accent : colors.textMuted }]}>
                {selected && <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />}
              </View>
              <View style={styles.optionText}>
                <AppText variant="bodyStrong">{option.label}</AppText>
                {option.description ? (
                  <AppText variant="caption" color="textMuted">
                    {option.description}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  list: { borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { flex: 1, gap: 2 },
});
