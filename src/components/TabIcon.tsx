import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export type TabIconName = 'hearth' | 'wheel' | 'well' | 'settings';

/** Hand-drawn line icons for the tab bar. */
export function TabIcon({ name, color, size = 26 }: { name: TabIconName; color: ColorValue; size?: number }) {
  const common = { stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'hearth' && (
        <>
          <Path d="M12 3c2.5 3 5 5.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-2.5.5-5 1-7.5z" {...common} />
          <Line x1={5} y1={21} x2={19} y2={21} {...common} />
        </>
      )}
      {name === 'wheel' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Circle cx={12} cy={12} r={2} {...common} />
          {[0, 45, 90, 135].map((deg) => {
            const r = (deg * Math.PI) / 180;
            return (
              <Line
                key={deg}
                x1={12 + 9 * Math.cos(r)}
                y1={12 + 9 * Math.sin(r)}
                x2={12 - 9 * Math.cos(r)}
                y2={12 - 9 * Math.sin(r)}
                {...common}
                strokeWidth={1.2}
              />
            );
          })}
        </>
      )}
      {name === 'well' && (
        <>
          <Path d="M4 10h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" {...common} />
          <Path d="M7 14c1.5 1 3.5 1 5 0s3.5-1 5 0" {...common} />
          <Path d="M12 10V4M8 4h8" {...common} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Line x1={4} y1={7} x2={20} y2={7} {...common} />
          <Line x1={4} y1={12} x2={20} y2={12} {...common} />
          <Line x1={4} y1={17} x2={20} y2={17} {...common} />
          <Circle cx={9} cy={7} r={2} {...common} fill={color} />
          <Circle cx={15} cy={12} r={2} {...common} fill={color} />
          <Circle cx={7} cy={17} r={2} {...common} fill={color} />
        </>
      )}
    </Svg>
  );
}
