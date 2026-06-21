/**
 * RatingPill — compact star + average rating, with an optional count label
 * (image copy*.png). Greys out when a place has no reviews yet.
 */
import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Icon, Text } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface RatingPillProps {
  average: number;
  count: number;
  /** Optional suffix after the count, e.g. "explorers" or "Historical Reviews". */
  countLabel?: string;
}

export function RatingPill({ average, count, countLabel }: RatingPillProps) {
  const theme = useTheme();
  const hasReviews = count > 0;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.pill,
          { backgroundColor: theme.colors.surfaceContainerLow, opacity: hasReviews ? 1 : 0.5 },
        ]}
      >
        <Icon icon={Star} size={14} color={theme.colors.primary} strokeWidth={2} />
        <Text variant="labelMedium" className="text-on-surface" style={{ marginLeft: 4 }}>
          {hasReviews ? average.toFixed(1) : '—'}
        </Text>
      </View>
      {hasReviews ? (
        <Text variant="labelMedium" className="text-on-surface-variant" style={{ marginLeft: 8 }}>
          {countLabel ? `${count} ${countLabel}` : String(count)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
});
