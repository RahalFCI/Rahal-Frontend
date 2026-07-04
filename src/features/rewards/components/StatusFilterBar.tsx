/**
 * StatusFilterBar — the wallet's status filter chips (All · Ready · Redeemed ·
 * Expired), adapting the places CategoryFilterBar chip idiom. "Ready" is the user's
 * "pending" — claimed with XP but not yet used at a store (backend `Claimed`).
 */
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../shared/theme';

export type WalletFilter = 'all' | 'ready' | 'redeemed' | 'expired';

export const WALLET_FILTERS: WalletFilter[] = ['all', 'ready', 'redeemed', 'expired'];

/** Map a UserCoupon.status to the filter bucket it belongs in. */
export function statusBucket(status: string | null | undefined): Exclude<WalletFilter, 'all'> {
  switch (status) {
    case 'Redeemed':
      return 'redeemed';
    case 'Expired':
    case 'Cancelled':
      return 'expired';
    // Pending + Claimed (and any unknown) read as "ready to use".
    default:
      return 'ready';
  }
}

export interface StatusFilterBarProps {
  selected: WalletFilter;
  onSelect: (filter: WalletFilter) => void;
}

export function StatusFilterBar({ selected, onSelect }: StatusFilterBarProps) {
  const theme = useTheme();
  const { t } = useTranslation('rewards');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {WALLET_FILTERS.map((filter) => {
        const isSelected = filter === selected;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(filter)}
            style={[
              styles.chip,
              theme.elevation.ambientShadow,
              {
                backgroundColor: isSelected
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceContainerLowest,
              },
            ]}
          >
            <Text
              variant="labelMedium"
              className={isSelected ? 'text-primary' : 'text-on-surface'}
            >
              {t(`wallet.filter.${filter}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 2,
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
  },
});
