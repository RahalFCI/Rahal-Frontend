/**
 * UserCouponCard — a claimed coupon in the wallet. Surfaces the redeemable code
 * (selectable so it can be read out / copied at the vendor) plus a status line.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RelicCard } from '../../../shared/layout/RelicCard';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import type { UserCoupon } from '../api/schemas';
import { formatExpiry } from '../utils/format';

export interface UserCouponCardProps {
  userCoupon: UserCoupon;
}

/** Redeemed/expired/cancelled entries read as spent; only Claimed is "live". */
function isSpent(status: string | null | undefined): boolean {
  return status != null && status !== 'Claimed' && status !== 'Pending';
}

export function UserCouponCard({ userCoupon }: UserCouponCardProps) {
  const { t } = useTranslation('rewards');
  const spent = isSpent(userCoupon.status);
  const statusKey = `wallet.status.${(userCoupon.status ?? 'claimed').toLowerCase()}`;

  return (
    <RelicCard className={`gap-[12px] ${spent ? 'opacity-60' : ''}`}>
      <View className="flex-row items-start justify-between gap-[12px]">
        <Text variant="bodyLarge" className="font-bold text-on-surface flex-1">
          {userCoupon.couponTitle || t('wallet.untitled')}
        </Text>
        <LabelCaps className={spent ? 'text-on-surface-variant' : 'text-primary'}>
          {t(statusKey)}
        </LabelCaps>
      </View>

      <View className="bg-surface-container rounded-lg px-[12px] py-[10px]">
        <LabelCaps className="text-on-surface-variant">{t('wallet.codeLabel')}</LabelCaps>
        <Text variant="bodyLarge" selectable className="font-bold text-on-surface tracking-wider">
          {userCoupon.code}
        </Text>
      </View>

      <LabelCaps className="text-on-surface-variant">
        {formatExpiry(userCoupon.expiresAt)}
      </LabelCaps>
    </RelicCard>
  );
}
