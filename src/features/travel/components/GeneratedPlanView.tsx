/**
 * GeneratedPlanView — renders a plan's `generatedPlanJson`. The backend stores the RAG
 * `answer` verbatim, which is usually free text but occasionally a JSON blob, so we
 * pretty-print when it parses to an object and otherwise show the text as-is (newlines
 * preserved). Editorial treatment: a calm archival passage, not a data dump.
 */
import { View } from 'react-native';
import { Text } from '../../../shared/components';

interface GeneratedPlanViewProps {
  text?: string | null;
}

function formatPlan(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function GeneratedPlanView({ text }: GeneratedPlanViewProps) {
  const content = formatPlan(text ?? '');
  if (!content) return null;

  return (
    <View>
      <Text variant="bodyMedium" className="text-on-surface">
        {content}
      </Text>
    </View>
  );
}
