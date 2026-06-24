/**
 * Coupon detail route — the redemption flow (CLAUDE.md §1.4 #4). Shows the coupon's
 * terms and a claim BeaconButton gated client-side by XP balance + availability
 * (claimability), with the backend as the fallback check. Hidden from the tab bar
 * via `href: null`.
 */
import { ActivityIndicator, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { BeaconButton } from '../../../src/shared/layout/BeaconButton';
import { tokens } from '../../../src/shared/theme';
import { useAuthStore } from '../../../src/features/auth/store/authStore';
import { useProfile } from '../../../src/features/auth/hooks/useProfile';
import { useCoupon } from '../../../src/features/rewards/hooks/useCoupon';
import { useClaimCoupon } from '../../../src/features/rewards/hooks/useClaimCoupon';
import { claimability } from '../../../src/features/rewards/utils/couponEligibility';
import { formatDiscount, formatExpiry } from '../../../src/features/rewards/utils/format';

export default function CouponDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation('rewards');
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: coupon, isLoading, isError } = useCoupon(id);
  const { data: profile } = useProfile(userId);
  const claim = useClaimCoupon();

  const availableXp = profile?.availableXp ?? 0;

  if (isLoading && !coupon) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={tokens.colors.primary} />
      </View>
    );
  }

  if (isError || !coupon) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-[24px]">
        <Text variant="bodyLarge" className="text-on-surface-variant text-center">
          {t('coupon.notFound')}
        </Text>
      </View>
    );
  }

  const { claimable, reason } = claimability(coupon, availableXp);

  const onClaim = () => {
    claim.mutate(
      { couponId: coupon.id, couponTitle: coupon.title },
      { onSuccess: () => router.push('/(explorer)/my-coupons') },
    );
  };

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

        <ScrollView contentContainerClassName="px-[24px] pb-[40px] gap-[24px]">
          <View className="gap-[8px]">
            <LabelCaps className="text-primary">{formatDiscount(coupon)}</LabelCaps>
            <Text variant="displaySmall" className="text-on-surface">
              {coupon.title}
            </Text>
          </View>

          {coupon.description ? (
            <Text variant="bodyLarge" className="text-on-surface-variant">
              {coupon.description}
            </Text>
          ) : null}

          {/* Terms */}
          <Surface tone="lowest" className="p-[20px] rounded-lg gap-[14px]">
            <View className="flex-row items-center justify-between">
              <LabelCaps className="text-on-surface-variant">{t('coupon.costLabel')}</LabelCaps>
              <LabelCaps className="text-primary">
                {t('coupon.xpCost', { value: coupon.xpCost })}
              </LabelCaps>
            </View>
            {coupon.minimumCharge != null && coupon.minimumCharge > 0 ? (
              <View className="flex-row items-center justify-between">
                <LabelCaps className="text-on-surface-variant">
                  {t('coupon.minimumLabel')}
                </LabelCaps>
                <LabelCaps className="text-on-surface-variant">
                  {t('coupon.minimumValue', { value: coupon.minimumCharge })}
                </LabelCaps>
              </View>
            ) : null}
            <View className="flex-row items-center justify-between">
              <LabelCaps className="text-on-surface-variant">{t('coupon.expiryLabel')}</LabelCaps>
              <LabelCaps className="text-on-surface-variant">
                {formatExpiry(coupon.expiresAt)}
              </LabelCaps>
            </View>
            <View className="flex-row items-center justify-between">
              <LabelCaps className="text-on-surface-variant">{t('coupon.balanceLabel')}</LabelCaps>
              <LabelCaps className="text-on-surface-variant">
                {t('coupon.xpCost', { value: availableXp })}
              </LabelCaps>
            </View>
          </Surface>

          {/* Claim CTA + inline block reason */}
          <View className="gap-[8px]">
            <BeaconButton
              label={claim.isPending ? t('claim.claiming') : t('claim.cta')}
              onPress={onClaim}
              disabled={!claimable || claim.isPending}
              className={!claimable || claim.isPending ? 'opacity-50' : ''}
            />
            {!claimable && reason ? (
              <LabelCaps className="text-on-surface-variant text-center">
                {t(`eligibility.${reason}`)}
              </LabelCaps>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
