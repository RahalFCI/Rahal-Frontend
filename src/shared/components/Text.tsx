/**
 * Text — Typed typography component covering every design token variant.
 * All app text must go through this component (design.md §3).
 *
 * Variant names map 1:1 to tokens.typography keys.
 */
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

type TypographyVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'labelMedium'
  | 'labelSmall';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
}

const variantClasses: Record<TypographyVariant, string> = {
  displayLarge: 'font-space-grotesk text-[57px] leading-[64px] tracking-tighter text-on-surface',
  displayMedium: 'font-space-grotesk text-[45px] leading-[52px] tracking-tighter text-on-surface',
  displaySmall: 'font-space-grotesk text-[36px] leading-[44px] tracking-tighter text-on-surface',
  headlineLarge: 'font-space-grotesk text-[32px] leading-[40px] text-on-surface',
  headlineMedium: 'font-space-grotesk text-[28px] leading-[36px] text-on-surface',
  headlineSmall: 'font-space-grotesk text-[24px] leading-[32px] text-on-surface',
  bodyLarge: 'font-space-grotesk text-[16px] leading-[24px] text-on-surface',
  bodyMedium: 'font-space-grotesk text-[14px] leading-[20px] text-on-surface',
  labelMedium:
    'font-space-grotesk text-[12px] leading-[16px] tracking-wider text-on-surface-variant',
  labelSmall:
    'font-space-grotesk text-[11px] leading-[16px] tracking-wider text-on-surface-variant',
};

export function Text({ variant = 'bodyMedium', className, ...props }: TextProps) {
  const variantClass = variantClasses[variant];
  return <RNText className={`${variantClass} ${className ?? ''}`} {...props} />;
}
