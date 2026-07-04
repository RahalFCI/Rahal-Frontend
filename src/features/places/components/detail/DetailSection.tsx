/**
 * DetailSection — a label-caps eyebrow ("THE NARRATIVE" / "THE ARCHIVIST'S NOTE")
 * over editorial body copy. Whitespace-based hierarchy, no dividers (CLAUDE.md §3.3).
 */
import { View } from 'react-native';
import type { ReactNode } from 'react';
import { LabelCaps, Text } from '../../../../shared/components';

interface DetailSectionProps {
  eyebrow: string;
  body?: string | null;
  children?: ReactNode;
}

export function DetailSection({ eyebrow, body, children }: DetailSectionProps) {
  if (!body?.trim() && !children) return null;
  return (
    <View>
      <LabelCaps className="text-on-surface-variant">{eyebrow}</LabelCaps>
      {body?.trim() ? (
        <Text variant="bodyLarge" className="text-on-surface mt-[12px]">
          {body}
        </Text>
      ) : null}
      {children ? <View className="mt-[12px]">{children}</View> : null}
    </View>
  );
}
