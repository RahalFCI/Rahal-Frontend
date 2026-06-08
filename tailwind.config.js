/**
 * Tailwind CSS Configuration — Generated from src/shared/theme/tokens.ts
 *
 * NO-LINE RULE (design.md §2): Do not use Tailwind `border` utilities in
 * shared/layout components. Separation is achieved through background shifts,
 * negative space, and tonal transitions — never 1px solid borders.
 */
const { tokens } = require('./src/shared/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        'primary-container': tokens.colors.primaryContainer,
        'on-primary': tokens.colors.onPrimary,

        surface: tokens.colors.surface,
        'surface-container-lowest': tokens.colors.surfaceContainerLowest,
        'surface-container-low': tokens.colors.surfaceContainerLow,
        'surface-container': tokens.colors.surfaceContainer,
        'surface-container-high': tokens.colors.surfaceContainerHigh,
        'on-surface': tokens.colors.onSurface,
        'on-surface-variant': tokens.colors.onSurfaceVariant,

        'outline-variant': tokens.colors.outlineVariant,
      },
      spacing: {
        1: `${tokens.spacing['1']}px`,
        2: `${tokens.spacing['2']}px`,
        3: `${tokens.spacing['3']}px`,
        4: `${tokens.spacing['4']}px`,
        6: `${tokens.spacing['6']}px`,
        8: `${tokens.spacing['8']}px`,
        10: `${tokens.spacing['10']}px`,
        16: `${tokens.spacing['16']}px`,
      },
      borderRadius: {
        sm: `${tokens.radii.sm}px`,
        lg: `${tokens.radii.lg}px`,
        xl: `${tokens.radii.xl}px`,
      },
      fontFamily: {
        'space-grotesk': [tokens.typography.fontFamily],
      },
    },
  },
  plugins: [],
};
