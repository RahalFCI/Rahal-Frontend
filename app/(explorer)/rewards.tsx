/**
 * Coupons screen (Phase 4) — the vendor catalog. Coupons are grouped under the vendor
 * that offers them (logo, name, location) with their redemption rules; claiming spends
 * XP for a redeemable code (see coupon detail + the redeem celebration). Premium lives
 * in its own tab now. Editorial treatment per CLAUDE.md §3.2 — a journal of relics to
 * claim, not a storefront.
 */
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { tokens } from '../../src/shared/theme';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { useCouponsByVendor } from '../../src/features/rewards/hooks/useCouponsByVendor';
import { VendorCouponGroup } from '../../src/features/rewards/components/VendorCouponGroup';

export default function CouponsScreen() {
  const router = useRouter();
  const { t } = useTranslation('rewards');
  const userId = useAuthStore((s) => s.user?.id);

  const { data: profile } = useProfile(userId);
  const availableXp = profile?.availableXp ?? 0;

  const { groups, isLoading } = useCouponsByVendor();

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header: title + XP balance + wallet link */}
        <View className="flex-row items-end justify-between pt-[16px] pr-[16px]">
          <View className="flex-1">
            <OffsetHeadline title={t('screen.coupons.title')} />
            <LabelCaps className="pl-[24px] mt-[4px] text-primary">
              {t('screen.rewards.balance', { value: availableXp })}
            </LabelCaps>
          </View>
          <Pressable
            onPress={() => router.push('/(explorer)/my-coupons')}
            className="flex-row items-center gap-[6px] p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('wallet.title')}
          >
            <Wallet size={18} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
            <LabelCaps className="text-on-surface-variant">{t('wallet.link')}</LabelCaps>
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="pt-[24px] pb-[120px] gap-[32px]"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="items-center py-[48px]">
              <ActivityIndicator color={tokens.colors.primary} size="large" />
            </View>
          ) : groups.length === 0 ? (
            <Surface tone="lowest" className="mx-[24px] p-[24px] rounded-lg">
              <LabelCaps className="text-on-surface-variant">{t('coupon.empty')}</LabelCaps>
            </Surface>
          ) : (
            groups.map((group) => (
              <VendorCouponGroup
                key={group.vendorId ?? '__rahal__'}
                group={group}
                onSelectCoupon={(id) =>
                  router.push({ pathname: '/(explorer)/coupon/[id]', params: { id } })
                }
                onSelectVendor={(vendorId) =>
                  router.push({ pathname: '/(explorer)/vendor/[id]', params: { id: vendorId } })
                }
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
