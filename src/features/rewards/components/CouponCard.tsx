/**
 * CouponCard — a cataloged coupon in the rewards list (CLAUDE.md §3.2: rewards are
 * cataloged, not celebrated). Composes RelicCard + Text + LabelCaps. Unclaimable
 * coupons (sold out / expired) desaturate, mirroring the locked BadgeCard treatment.
 */
import { View, Pressable } from 'react-native';
import { Ticket } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import type { Coupon } from '../api/schemas';
import { formatDiscount, formatExpiry } from '../utils/format';
import { claimability } from '../utils/couponEligibility';

export interface CouponCardProps {
  coupon: Coupon;
  onPress?: () => void;
}

export function CouponCard({ coupon, onPress }: CouponCardProps) {
  const { t } = useTranslation('rewards');
  // XP balance isn't needed here — only availability gates the card's dimmed state.
  const { reason } = claimability(coupon, Number.POSITIVE_INFINITY);
  const unavailable = reason === 'SOLD_OUT' || reason === 'EXPIRED' || reason === 'INACTIVE';

  const body = (
    <View
      className={`p-[16px] rounded-lg gap-[12px] ${
        unavailable ? 'bg-surface-container-low opacity-60' : 'bg-surface-container-lowest'
      }`}
      style={
        !unavailable
          ? {
              shadowColor: tokens.colors.onSurface,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 20,
              elevation: 2,
            }
          : undefined
      }
    >
      <View className="flex-row items-start gap-[12px]">
        <View
          className={`w-[44px] h-[44px] rounded-xl items-center justify-center ${
            unavailable ? 'bg-surface-container' : 'bg-primary-container/20'
          }`}
        >
          <Ticket
            size={22}
            color={unavailable ? tokens.colors.onSurfaceVariant : tokens.colors.primary}
            strokeWidth={1.5}
          />
        </View>
        <View className="flex-1 gap-[2px]">
          <Text variant="bodyLarge" className="font-bold text-on-surface">
            {coupon.title}
          </Text>
          <LabelCaps className="text-on-surface-variant">{formatDiscount(coupon)}</LabelCaps>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <LabelCaps className={unavailable ? 'text-on-surface-variant' : 'text-primary'}>
          {unavailable ? t(`eligibility.${reason}`) : t('coupon.xpCost', { value: coupon.xpCost })}
        </LabelCaps>
        <LabelCaps className="text-on-surface-variant">{formatExpiry(coupon.expiresAt)}</LabelCaps>
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={coupon.title}>
      {body}
    </Pressable>
  );
}
