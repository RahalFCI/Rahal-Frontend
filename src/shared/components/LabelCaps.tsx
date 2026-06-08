/**
 * LabelCaps — All-caps tracked-out metadata label (design.md §3, Label row).
 * Used for cataloging dates, locations, XP values in the editorial style.
 */
import { Text } from './Text';
import type { TextProps } from 'react-native';

interface LabelCapsProps extends Omit<TextProps, 'children'> {
  children: string;
}

export function LabelCaps({ children, className, ...props }: LabelCapsProps) {
  return (
    <Text variant="labelMedium" className={`uppercase ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
}
