/**
 * Design tokens for Hearth & Well.
 *
 * Palette: soot, hearth amber, birch white, moss green, iron grey.
 * Dark is the default scheme. Every text/background pairing used for body
 * text has been checked against WCAG AA (4.5:1).
 */

export type ColorScheme = 'dark' | 'light';

export interface Palette {
  /** App background (soot / birch paper). */
  background: string;
  /** Cards and grouped content. */
  surface: string;
  /** Raised elements on top of a surface. */
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  /** Hearth amber: primary accent, links, highlights. */
  accent: string;
  /** Text/icon color on top of an `accent` fill. */
  onAccent: string;
  ember: string;
  moss: string;
  iron: string;
  frost: string;
  /** Moon surface and its shadow side. */
  moonLit: string;
  moonDark: string;
  /** Source-tier badge colors. */
  tier: {
    attested: string;
    scholarly: string;
    community: string;
    upg: string;
  };
  /** Season arcs on the Wheel. */
  season: {
    winter: string;
    spring: string;
    summer: string;
    autumn: string;
  };
}

export const palettes: Record<ColorScheme, Palette> = {
  dark: {
    background: '#14110F',
    surface: '#1E1A17',
    surfaceRaised: '#2A2420',
    border: '#3A322C',
    text: '#EDE6DA',
    textMuted: '#A89C8C',
    accent: '#E0A04B',
    onAccent: '#14110F',
    ember: '#D9693D',
    moss: '#8FAE78',
    iron: '#9AA3AB',
    frost: '#9FC2D6',
    moonLit: '#EFE7D4',
    moonDark: '#2E2823',
    tier: {
      attested: '#E0A04B',
      scholarly: '#9FC2D6',
      community: '#8FAE78',
      upg: '#B7A3E0',
    },
    season: {
      winter: '#6F8796',
      spring: '#6E8F5C',
      summer: '#C98E3A',
      autumn: '#A9532F',
    },
  },
  light: {
    background: '#F4EFE6',
    surface: '#FBF8F2',
    surfaceRaised: '#FFFFFF',
    border: '#DDD3C3',
    text: '#221C17',
    textMuted: '#6B5F52',
    accent: '#8F5414',
    onAccent: '#FBF8F2',
    ember: '#A63F1E',
    moss: '#4E6B3C',
    iron: '#5C646B',
    frost: '#3D6A85',
    moonLit: '#F6EFDD',
    moonDark: '#5A5047',
    tier: {
      attested: '#8F5414',
      scholarly: '#3D6A85',
      community: '#4E6B3C',
      upg: '#6A4F9E',
    },
    season: {
      winter: '#7C93A3',
      spring: '#7FA06A',
      summer: '#D6A04F',
      autumn: '#B8673F',
    },
  },
};

export const fonts = {
  display: 'EBGaramond_600SemiBold',
  displayItalic: 'EBGaramond_400Regular_Italic',
  serif: 'EBGaramond_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  runic: 'NotoSansRunic_400Regular',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typeScale = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 24 },
  callout: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 26 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypeVariant = keyof typeof typeScale;
