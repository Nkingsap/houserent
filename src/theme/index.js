// ─── Academic Sanctuary Design System ────────────────────────────
// Palette and tokens aligned with DESIGN.md
// Slate Blue + Sage Green + Warm Ivory + Antique Gold

export const colors = {
  // Backgrounds
  background: '#FAF9F6',        // Warm Ivory
  card: 'rgba(255,255,255,0.88)', // Glass surface – more opaque
  elevated: '#F0EFEC',           // Subtle lift
  surface: '#E8E6E3',            // Input/chip fill – darker

  // Glass surfaces (cards, panels)
  glass: 'rgba(255,255,255,0.88)',
  glassBorder: 'rgba(255,255,255,0.45)',
  glassElevated: 'rgba(255,255,255,0.92)',

  // Listing cards – solid glass
  cardDark: 'rgba(255,255,255,0.90)',
  cardDarkElevated: '#F0EFEC',
  cardDarkBorder: 'rgba(0,0,0,0)',    // transparent – no borders
  cardDarkText: '#1A2530',
  cardDarkTextSecondary: '#3D5467',
  cardDarkTextMuted: '#6B7F8D',

  // Text – Dark Slate scale (sharper)
  text: '#1A2530',               // Near-black
  textSecondary: '#3D5467',      // Darker secondary
  textMuted: '#6B7F8D',          // Darker muted

  // Primary action – Deep Forest Green
  primary: '#2D6A4F',
  primaryDark: '#1B4332',
  accent: '#B8860B',             // Dark Goldenrod
  accentDim: 'rgba(184,134,11,0.14)',

  // Semantic
  danger: '#C0392B',
  success: '#1E8449',
  warning: '#B7950B',

  // Overlays
  overlay: 'rgba(26,37,48,0.60)',
  overlayLight: 'rgba(26,37,48,0.06)',
  transparent: 'transparent',

  // Borders – kept for dividers only
  border: 'rgba(26,37,48,0.10)',
  borderLight: 'rgba(26,37,48,0.05)',
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
    fontWeight: '500',           // Medium – sharper
    color: colors.text,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
};

export const shadows = {
  small: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  large: {
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 10,
  },
};

export default { colors, spacing, borderRadius, typography, shadows };
