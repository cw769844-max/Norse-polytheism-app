import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { monthInitials } from '@/i18n/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

import { SEASON_ORDER, seasonInstant } from './astronomy';
import { compareDates, dayOfYear, daysInYear, fromDate } from './calendarDate';
import type { CalendarDate, Hemisphere, SeasonEvent, TideOccurrence } from './types';

interface WheelDialProps {
  year: number;
  size: number;
  occurrences: TideOccurrence[];
  hemisphere: Hemisphere;
  /** Today's date; the pointer is drawn only when it falls in `year`. */
  today: CalendarDate;
  /** The occurrence to highlight (the next or ongoing tide). */
  highlight?: TideOccurrence;
  centerTitle: string;
  centerValue: string;
  centerCaption: string;
  accessibilityLabel: string;
}

const SEASON_COLOR_KEY: Record<SeasonEvent, 'winter' | 'spring' | 'summer' | 'autumn'> = {
  winterSolstice: 'winter',
  springEquinox: 'spring',
  summerSolstice: 'summer',
  autumnEquinox: 'autumn',
};

function polar(cx: number, cy: number, r: number, degrees: number) {
  const rad = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/** Angle on the dial (0° at the top, clockwise) for a date in the given year. */
function angleOf(date: CalendarDate, year: number): number {
  return ((dayOfYear(date) + 0.5) / daysInYear(year)) * 360;
}

export function WheelDial(props: WheelDialProps) {
  const { year, size, occurrences, hemisphere, today, highlight } = props;
  const { colors } = useTheme();
  const c = size / 2;
  const ringR = c - 14;
  const ringWidth = 10;

  const seasonArcs = useMemo(() => {
    const events = SEASON_ORDER.map((event) => ({
      event,
      angle: angleOf(fromDate(seasonInstant(event, year, hemisphere)), year),
    })).sort((a, b) => a.angle - b.angle);
    // The season running into January is the one that began with the last event of the year.
    const last = events[events.length - 1];
    const arcs = [{ event: last.event, start: 0, end: events[0].angle }];
    events.forEach((e, i) => {
      arcs.push({ event: e.event, start: e.angle, end: i + 1 < events.length ? events[i + 1].angle : 360 });
    });
    return arcs;
  }, [year, hemisphere]);

  const initials = useMemo(() => monthInitials(), []);
  const showToday = today.year === year;
  const todayAngle = showToday ? angleOf(today, year) : 0;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={props.accessibilityLabel}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={ringR - ringWidth / 2 - 2} fill={colors.surface} />

        {seasonArcs.map((arc, i) => (
          <Path
            key={`${arc.event}-${i}`}
            d={arcPath(c, c, ringR, arc.start, arc.end)}
            stroke={colors.season[SEASON_COLOR_KEY[arc.event]]}
            strokeWidth={ringWidth}
            fill="none"
            opacity={0.85}
          />
        ))}

        {initials.map((label, m) => {
          const startAngle = (dayOfYear({ year, month: m + 1, day: 1 }) / daysInYear(year)) * 360;
          const tickIn = polar(c, c, ringR - ringWidth / 2, startAngle);
          const tickOut = polar(c, c, ringR + ringWidth / 2, startAngle);
          const mid = (dayOfYear({ year, month: m + 1, day: 15 }) / daysInYear(year)) * 360;
          const p = polar(c, c, ringR - ringWidth - 12, mid);
          return (
            <G key={m}>
              <Line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y} stroke={colors.background} strokeWidth={2} />
              <SvgText
                x={p.x}
                y={p.y + 4}
                fill={colors.textMuted}
                fontSize={11}
                fontFamily={fonts.bodyMedium}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            </G>
          );
        })}

        {showToday && (
          <G>
            <Line
              x1={polar(c, c, ringR - ringWidth - 26, todayAngle).x}
              y1={polar(c, c, ringR - ringWidth - 26, todayAngle).y}
              x2={polar(c, c, ringR + ringWidth / 2 + 4, todayAngle).x}
              y2={polar(c, c, ringR + ringWidth / 2 + 4, todayAngle).y}
              stroke={colors.ember}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        )}

        {occurrences.map((occ) => {
          const p = polar(c, c, ringR, angleOf(occ.start, year));
          const isHighlight =
            highlight && highlight.tide.id === occ.tide.id && compareDates(highlight.start, occ.start) === 0;
          const isPast = showToday && compareDates(occ.end, today) < 0;
          return (
            <Circle
              key={`${occ.tide.id}-${occ.start.month}-${occ.start.day}`}
              cx={p.x}
              cy={p.y}
              r={isHighlight ? 9 : 6}
              fill={isHighlight ? colors.accent : colors.surfaceRaised}
              stroke={isHighlight ? colors.background : colors.text}
              strokeWidth={isHighlight ? 2.5 : 1.5}
              opacity={isPast ? 0.45 : 1}
            />
          );
        })}

        {showToday && (
          <Circle
            cx={polar(c, c, ringR + ringWidth / 2 + 6, todayAngle).x}
            cy={polar(c, c, ringR + ringWidth / 2 + 6, todayAngle).y}
            r={4}
            fill={colors.ember}
          />
        )}
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <AppText variant="overline" color="textMuted" style={styles.centerText}>
          {props.centerCaption}
        </AppText>
        <AppText variant="hero" color="accent" style={styles.centerText}>
          {props.centerValue}
        </AppText>
        <AppText variant="heading" style={[styles.centerText, { maxWidth: size * 0.5 }]} numberOfLines={2}>
          {props.centerTitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  centerText: { textAlign: 'center' },
});
