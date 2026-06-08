/**
 * Icon — Thin wrapper over lucide-react-native with token-aware color/size props.
 * Uses Lucide icons per claude.md §9 (ISC license, editorial aesthetic fit).
 */
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../theme';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  icon: LucideIconComponent,
  size = 24,
  color,
  strokeWidth = 1.5,
}: IconProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.onSurface;

  return <LucideIconComponent size={size} color={resolvedColor} strokeWidth={strokeWidth} />;
}
