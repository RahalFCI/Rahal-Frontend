/**
 * Rahal Design Tokens — Single Source of Truth
 *
 * Ported from design.md (Solar Minimalist system).
 * All values here drive both the Tailwind config and the useTheme() hook.
 *
 * Color derivation notes:
 * - primary (#755700): sophisticated amber-gold (design.md §2)
 * - surface (#F5F6F7): airy off-white canvas
 * - onSurface (#2C2F30): deep slate charcoal
 * - surfaceContainerLowest (#FFFFFF): pure white, interactive cards "pop"
 * - surfaceContainerLow (#EFF1F2): sectional grouping
 * - surfaceContainer (#E7E9EA): derived midpoint between surfaceContainerLow and surfaceContainerHigh
 * - surfaceContainerHigh (#DFE1E3): input field fills, higher tonal weight
 * - onSurfaceVariant (#5C5F61): derived ~50% between surface and onSurface, for secondary text
 * - outlineVariant (#C4C7C9): derived light tone for ghost borders at 15% opacity
 * - primaryContainer (#FFDEA0): soft amber for secondary buttons / radial gradients
 * - onPrimary (#FFFFFF): text on primary amber backgrounds
 */

export const tokens = {
  colors: {
    primary: '#755700',
    primaryContainer: '#FFDEA0',
    onPrimary: '#FFFFFF',

    surface: '#F5F6F7',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#EFF1F2',
    surfaceContainer: '#E7E9EA',
    surfaceContainerHigh: '#DFE1E3',
    onSurface: '#2C2F30',
    onSurfaceVariant: '#5C5F61',

    outlineVariant: '#C4C7C9',
  },

  spacing: {
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '6': 24,
    '8': 32,
    '10': 40,
    '16': 64,
  } as const,

  radii: {
    sm: 4,
    lg: 8,
    xl: 12,
  } as const,

  typography: {
    fontFamily: 'SpaceGrotesk',

    displayLarge: { fontSize: 57, lineHeight: 64, letterSpacing: -1.14 },
    displayMedium: { fontSize: 45, lineHeight: 52, letterSpacing: -0.9 },
    displaySmall: { fontSize: 36, lineHeight: 44, letterSpacing: -0.72 },

    headlineLarge: { fontSize: 32, lineHeight: 40, letterSpacing: 0 },
    headlineMedium: { fontSize: 28, lineHeight: 36, letterSpacing: 0 },
    headlineSmall: { fontSize: 24, lineHeight: 32, letterSpacing: 0 },

    bodyLarge: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
    bodyMedium: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },

    labelMedium: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
    labelSmall: { fontSize: 11, lineHeight: 16, letterSpacing: 0.55 },
  } as const,

  elevation: {
    /** Tonal layering is the primary depth mechanism. Use shadows as a last resort. */
    ambientShadow: {
      shadowColor: '#2C2F30',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.06,
      shadowRadius: 40,
      elevation: 8,
    },
  } as const,

  glass: {
    /** Glassmorphism: surface at 80% opacity + 20px backdrop blur */
    backdropBlur: 20,
    surfaceOpacity: 0.8,
  } as const,
} as const;

export type Tokens = typeof tokens;
