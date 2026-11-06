import Svg, { Circle, G, Path } from 'react-native-svg';

import type { Hemisphere } from '@/features/wheel/types';
import { useTheme } from '@/theme/ThemeProvider';

interface MoonGlyphProps {
  /** Phase angle: 0 new, 90 first quarter, 180 full, 270 last quarter. */
  angle: number;
  size?: number;
  hemisphere?: Hemisphere;
}

/**
 * Draws the moon's lit portion. Waxing moons are lit on the right as seen from
 * the northern hemisphere; the drawing is mirrored for the southern hemisphere.
 */
export function MoonGlyph({ angle, size = 48, hemisphere = 'north' }: MoonGlyphProps) {
  const { colors } = useTheme();
  const r = size / 2 - 1;
  const c = size / 2;
  const a = ((angle % 360) + 360) % 360;
  const rad = (a * Math.PI) / 180;
  const rx = Math.abs(Math.cos(rad)) * r;

  const waxing = a < 180;
  // Arc along the lit limb from top to bottom.
  const limbSweep = waxing ? 1 : 0;
  // Terminator from bottom back to top: bulges toward the lit side for crescents.
  const crescent = a < 90 || a > 270;
  const termSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;

  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 ${limbSweep} ${c} ${c + r} A ${rx} ${r} 0 0 ${termSweep} ${c} ${c - r} Z`;
  const showLit = a > 2 && a < 358;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G transform={hemisphere === 'south' ? `translate(${size} 0) scale(-1 1)` : undefined}>
        <Circle cx={c} cy={c} r={r} fill={colors.moonDark} stroke={colors.border} strokeWidth={1} />
        {showLit && <Path d={lit} fill={colors.moonLit} />}
      </G>
    </Svg>
  );
}
