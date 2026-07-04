/**
 * UserCouponCard — a claimed coupon in the wallet. Live entries (Claimed/Pending)
 * surface a compact QR of the redeemable code (tap to enlarge for scanning at the
 * vendor); spent entries (Redeemed/Expired/Cancelled) dim and drop the QR. The code
 * stays selectable as a fallback.
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { RelicCard } from '../../../shared/layout/RelicCard';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import type { UserCoupon } from '../api/schemas';
import { formatExpiry } from '../utils/format';

export interface UserCouponCardProps {
  userCoupon: UserCoupon;
  /** Enlarge the QR full-screen for scanning; only wired for live entries. */
  onShowQr?: (userCoupon: UserCoupon) => void;
}

/** Redeemed/expired/cancelled entries read as spent; only Claimed/Pending are "live". */
function isSpent(status: string | null | undefined): boolean {
  return status != null && status !== 'Claimed' && status !== 'Pending';
}

export function UserCouponCard({ userCoupon, onShowQr }: UserCouponCardProps) {
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

      <View className="flex-row items-center gap-[12px]">
        <View className="flex-1 bg-surface-container rounded-lg px-[12px] py-[10px]">
          <LabelCaps className="text-on-surface-variant">{t('wallet.codeLabel')}</LabelCaps>
          <Text
            variant="bodyLarge"
            selectable
            className="font-bold text-on-surface tracking-wider"
          >
            {userCoupon.code}
          </Text>
        </View>

        {!spent ? (
          <Pressable
            onPress={() => onShowQr?.(userCoupon)}
            accessibilityRole="button"
            accessibilityLabel={t('redeem.walletTitle')}
            className="bg-surface-container-lowest rounded-lg p-[8px]"
          >
            <QRCode
              value={userCoupon.code}
              size={64}
              color={tokens.colors.onSurface}
              backgroundColor={tokens.colors.surfaceContainerLowest}
            />
          </Pressable>
        ) : null}
      </View>

      <LabelCaps className="text-on-surface-variant">
        {formatExpiry(userCoupon.expiresAt)}
      </LabelCaps>
    </RelicCard>
  );
}
