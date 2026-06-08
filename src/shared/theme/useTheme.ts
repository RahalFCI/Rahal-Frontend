/**
 * useTheme() — returns the typed design tokens object.
 * Use for cases where NativeWind classes aren't ergonomic
 * (e.g., passing color values to SVG props, shadow configs, animations).
 */
import { tokens } from './tokens';
import type { Tokens } from './tokens';

export function useTheme(): Tokens {
  return tokens;
}
