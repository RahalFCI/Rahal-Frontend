/**
 * My Coupons route — the explorer's wallet of claimed coupons with their redeemable
 * codes/QRs, filterable by status (All · Ready · Redeemed · Expired). "Ready" is the
 * user's "pending" — claimed with XP but not yet used at a store. Reached from the
 * coupons header. Hidden from the tab bar via `href: null`.
 */
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { tokens } from '../../src/shared/theme';
import { useMyCoupons } from '../../src/features/rewards/hooks/useMyCoupons';
import { UserCouponCard } from '../../src/features/rewards/components/UserCouponCard';
import {
  StatusFilterBar,
  statusBucket,
  type WalletFilter,
} from '../../src/features/rewards/components/StatusFilterBar';
import { CouponRedeemedMoment } from '../../src/features/rewards/components/CouponRedeemedMoment';
import type { UserCoupon } from '../../src/features/rewards/api/schemas';

export default function MyCouponsScreen() {
  const router = useRouter();
  const { t } = useTranslation('rewards');
  const { userCoupons, isLoading } = useMyCoupons();

  const [filter, setFilter] = useState<WalletFilter>('all');
  const [enlarged, setEnlarged] = useState<UserCoupon | null>(null);

  const visible = useMemo(
    () =>
      filter === 'all'
        ? userCoupons
        : userCoupons.filter((c) => statusBucket(c.status) === filter),
    [userCoupons, filter],
  );

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-[16px] py-[12px]">
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/(explorer)/rewards')
            }
            className="p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('common.back')}
          >
            <ChevronLeft size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        <View className="px-[24px] gap-[16px]">
          <Text variant="headlineLarge" className="text-on-surface">
            {t('wallet.title')}
          </Text>
          <StatusFilterBar selected={filter} onSelect={setFilter} />
        </View>

        <ScrollView contentContainerClassName="px-[24px] pt-[16px] pb-[40px] gap-[16px]">
          {isLoading ? (
            <View className="items-center py-[48px]">
              <ActivityIndicator color={tokens.colors.primary} size="large" />
            </View>
          ) : visible.length === 0 ? (
            <Surface tone="lowest" className="p-[24px] rounded-lg">
              <LabelCaps className="text-on-surface-variant">
                {filter === 'all' ? t('wallet.empty') : t('wallet.emptyFilter')}
              </LabelCaps>
            </Surface>
          ) : (
            visible.map((userCoupon) => (
              <UserCouponCard
                key={userCoupon.id}
                userCoupon={userCoupon}
                onShowQr={setEnlarged}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {enlarged ? (
        <CouponRedeemedMoment
          code={enlarged.code}
          mode="wallet"
          onDismiss={() => setEnlarged(null)}
        />
      ) : null}
    </Surface>
  );
}
