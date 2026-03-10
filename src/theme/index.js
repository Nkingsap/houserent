export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  card: '#FFFFFF',
  elevated: '#F2F2F4',
  surface: '#F0F0F2',

  // Listing cards (light, on white background)
  cardDark: '#FFFFFF',
  cardDarkElevated: '#F5F5F7',
  cardDarkBorder: '#E8E8EC',
  cardDarkText: '#1A1A2E',
  cardDarkTextSecondary: '#4A4A5A',
  cardDarkTextMuted: '#6B6B78',

  // Borders – subtle
  border: '#E4E4E7',
  borderLight: '#F0F0F2',

  // Text – rich dark scale
  text: '#0A0A0F',
  textSecondary: '#3A3A48',
  textMuted: '#6B6B78',

  // Primary action – deep black
  accent: '#0A0A0F',
  accentDim: 'rgba(10,10,15,0.07)',

  // Semantic
  danger: '#E63946',
  success: '#2D9B5A',
  warning: '#E0A800',

  // Overlays
  overlay: 'rgba(10,10,15,0.55)',
  overlayLight: 'rgba(10,10,15,0.04)',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
};

export const shadows = {
  small: {
    shadowColor: '#0A0A0F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#0A0A0F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  large: {
    shadowColor: '#0A0A0F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
};

export default { colors, spacing, borderRadius, typography, shadows };
