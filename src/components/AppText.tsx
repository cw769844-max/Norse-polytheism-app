import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { typeScale, type Palette, type TypeVariant } from '@/theme/tokens';

type ColorName = Exclude<keyof Palette, 'tier' | 'season'>;

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  color?: ColorName;
}

/** Text using the design system's type scale and palette. */
export function AppText({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const isHeading = variant === 'hero' || variant === 'title' || variant === 'heading';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      style={[typeScale[variant], { color: colors[color] }, style]}
      {...rest}
    />
  );
}
