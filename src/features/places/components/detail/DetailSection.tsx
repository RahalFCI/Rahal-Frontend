/**
 * DetailSection — a label-caps eyebrow ("THE NARRATIVE" / "THE ARCHIVIST'S NOTE")
 * over editorial body copy. Whitespace-based hierarchy, no dividers (CLAUDE.md §3.3).
 */
import { View } from 'react-native';
import { LabelCaps, Text } from '../../../../shared/components';

interface DetailSectionProps {
  eyebrow: string;
  body?: string | null;
}

export function DetailSection({ eyebrow, body }: DetailSectionProps) {
  if (!body?.trim()) return null;
  return (
    <View>
      <LabelCaps className="text-on-surface-variant">{eyebrow}</LabelCaps>
      <Text variant="bodyLarge" className="text-on-surface mt-[12px]">
        {body}
      </Text>
    </View>
  );
}
