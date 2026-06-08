/**
 * Surface — View wrapper with a `tone` prop mapping to surface-container tokens.
 * Implements the tonal layering system from design.md §2 and §4.
 */
import { View, type ViewProps } from 'react-native';

type SurfaceTone = 'base' | 'low' | 'lowest' | 'high';

interface SurfaceProps extends ViewProps {
  tone?: SurfaceTone;
}

const toneClasses: Record<SurfaceTone, string> = {
  base: 'bg-surface',
  low: 'bg-surface-container-low',
  lowest: 'bg-surface-container-lowest',
  high: 'bg-surface-container-high',
};

export function Surface({ tone = 'base', className, ...props }: SurfaceProps) {
  return <View className={`${toneClasses[tone]} ${className ?? ''}`} {...props} />;
}
