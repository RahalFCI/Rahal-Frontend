/**
 * Coupon detail route — the claim flow (CLAUDE.md §1.4 #4). Shows the offering vendor,
 * the coupon's terms, and a claim BeaconButton gated client-side by XP balance +
 * availability (claimability), with the backend as the fallback check. On a successful
 * claim it raises the redeem celebration (QR the vendor scans) before routing to the
 * wallet. Hidden from the tab bar via `href: null`.
 */
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { BeaconButton } from '../../../src/shared/layout/BeaconButton';
import { tokens } from '../../../src/shared/theme';
import { useAuthStore } from '../../../src/features/auth/store/authStore';
import { useProfile } from '../../../src/features/auth/hooks/useProfile';
import { useCoupon } from '../../../src/features/rewards/hooks/useCoupon';
import { useClaimCoupon } from '../../../src/features/rewards/hooks/useClaimCoupon';
import { useMyCoupons } from '../../../src/features/rewards/hooks/useMyCoupons';
import { useVendor } from '../../../src/features/vendors/hooks/useVendor';
import { claimability } from '../../../src/features/rewards/utils/couponEligibility';
import { formatDiscount, formatExpiry } from '../../../src/features/rewards/utils/format';
import { CouponRedeemedMoment } from '../../../src/features/rewards/components/CouponRedeemedMoment';

export default function CouponDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation('rewards');
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: coupon, isLoading, isError } = useCoupon(id);
  const { data: profile } = useProfile(userId);
  const { data: vendor } = useVendor(coupon?.vendorId);
  const { userCoupons } = useMyCoupons();
  const claim = useClaimCoupon();

  // The backend rejects a second claim of the same coupon; reflect that in the UI
  // (any live wallet entry — Claimed/Pending/Redeemed — means it's already theirs).
  const alreadyClaimed = userCoupons.some(
    (uc) => uc.couponId === id && uc.status !== 'Cancelled' && uc.status !== 'Expired',
  );

  // The claimed code drives the celebration overlay; dismissing routes to the wallet.
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

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
      { onSuccess: (userCoupon) => setClaimedCode(userCoupon.code) },
    );
  };

  const dismissCelebration = () => {
    setClaimedCode(null);
    router.replace('/(explorer)/my-coupons');
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
          {/* Offering vendor — tap through to the vendor's location & other coupons */}
          {coupon.vendorId ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(explorer)/vendor/[id]',
                  params: { id: coupon.vendorId as string },
                })
              }
              className="flex-row items-center gap-[12px]"
              accessibilityRole="button"
              accessibilityLabel={vendor?.displayName ?? t('catalog.vendorFallback')}
            >
              {vendor?.profilePictureUrl ? (
                <Image
                  source={{ uri: vendor.profilePictureUrl }}
                  className="w-[36px] h-[36px] rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-[36px] h-[36px] rounded-lg items-center justify-center bg-surface-container-high">
                  <Store size={18} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
                </View>
              )}
              <LabelCaps className="flex-1 text-on-surface-variant">
                {vendor?.displayName ?? t('catalog.vendorFallback')}
              </LabelCaps>
              <ChevronRight size={18} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
            </Pressable>
          ) : null}

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
            {coupon.remainingClaims != null ? (
              <View className="flex-row items-center justify-between">
                <LabelCaps className="text-on-surface-variant">
                  {t('coupon.remainingLabel')}
                </LabelCaps>
                <LabelCaps className="text-on-surface-variant">
                  {t('coupon.remaining', { count: coupon.remainingClaims })}
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

          {/* Claim CTA — a disabled, grayed button once the coupon is in the wallet,
              with a secondary text link through to the wallet. */}
          {alreadyClaimed ? (
            <View className="gap-[12px]">
              <BeaconButton
                label={t('claim.alreadyClaimedCta')}
                disabled
                className="opacity-50"
              />
              <Pressable
                onPress={() => router.push('/(explorer)/my-coupons')}
                accessibilityRole="link"
              >
                <LabelCaps className="text-primary text-center">
                  {t('claim.viewInWallet')}
                </LabelCaps>
              </Pressable>
            </View>
          ) : (
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
          )}
        </ScrollView>
      </SafeAreaView>

      {claimedCode ? (
        <CouponRedeemedMoment
          code={claimedCode}
          vendorName={vendor?.displayName}
          onDismiss={dismissCelebration}
        />
      ) : null}
    </Surface>
  );
}
