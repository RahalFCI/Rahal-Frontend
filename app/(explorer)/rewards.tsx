/**
 * Rewards screen (Phase 4) — the cataloged rewards desk. Two sections: the coupon
 * catalog (claim with XP → a redeemable code) and premium subscription tiers
 * (buy with XP). Editorial treatment per CLAUDE.md §3.2 — a journal of rewards,
 * not a storefront.
 */
import { View, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { tokens } from '../../src/shared/theme';
import { flags } from '../../src/config/flags';
import { env } from '../../src/config/env';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { useCoupons } from '../../src/features/rewards/hooks/useCoupons';
import { usePlanTiers } from '../../src/features/rewards/hooks/usePlanTiers';
import { useActiveSubscription } from '../../src/features/rewards/hooks/useActiveSubscription';
import { usePurchaseSubscription } from '../../src/features/rewards/hooks/usePurchaseSubscription';
import { useActivatePremiumWithCard } from '../../src/features/rewards/hooks/useActivatePremiumWithCard';
import { useCancelSubscription } from '../../src/features/rewards/hooks/useCancelSubscription';
import { useCardCheckout } from '../../src/features/payment/hooks/useCardCheckout';
import { CouponCard } from '../../src/features/rewards/components/CouponCard';
import { PlanTierCard } from '../../src/features/rewards/components/PlanTierCard';
import type { PlanTier } from '../../src/features/rewards/api/schemas';

export default function RewardsScreen() {
  const router = useRouter();
  const { t } = useTranslation('rewards');
  const userId = useAuthStore((s) => s.user?.id);

  const { data: profile } = useProfile(userId);
  const availableXp = profile?.availableXp ?? 0;

  const { coupons, isLoading: couponsLoading } = useCoupons();
  const { planTiers, isLoading: tiersLoading } = usePlanTiers();
  const { data: activeSubscription } = useActiveSubscription();
  const purchase = usePurchaseSubscription();
  const cancel = useCancelSubscription();
  const cardCheckout = useCardCheckout();
  const activatePremiumWithCard = useActivatePremiumWithCard();

  const isPremium =
    activeSubscription?.status === 'Active' || activeSubscription?.status === 'Pending';

  const cardPending = cardCheckout.isPending || activatePremiumWithCard.isPending;

  // Collect a card payment via Stripe (using the tier's cash price), then — on a
  // successful charge — activate premium. The backend doesn't link the two, so the
  // Rewards screen composes them: charge, then grant. See the payment feature.
  const payWithCard = async (tier: PlanTier) => {
    if (!userId || tier.weeklyPrice == null) return;
    const result = await cardCheckout
      .mutateAsync({
        userId,
        amount: tier.weeklyPrice,
        currency: env.PAYMENT_CURRENCY,
        referenceId: tier.id,
      })
      .catch(() => 'failed' as const);
    if (result === 'succeeded') {
      activatePremiumWithCard.mutate({ planTierId: tier.id, planTierName: tier.name });
    }
  };

  const cardPriceLabel = (tier: PlanTier) =>
    tier.weeklyPrice != null
      ? t('payment:card.priceLabel', {
          value: tier.weeklyPrice,
          currency: env.PAYMENT_CURRENCY.toUpperCase(),
        })
      : undefined;

  const confirmCancel = () => {
    Alert.alert(t('premium.cancelConfirmTitle'), t('premium.cancelConfirmBody'), [
      { text: t('premium.cancelConfirmDismiss'), style: 'cancel' },
      {
        text: t('premium.cancelConfirmConfirm'),
        style: 'destructive',
        onPress: () => cancel.mutate(),
      },
    ]);
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header: title + XP balance + wallet link */}
        <View className="flex-row items-end justify-between pt-[16px] pr-[16px]">
          <View className="flex-1">
            <OffsetHeadline title={t('screen.rewards.title')} />
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
          contentContainerClassName="pt-[24px] pb-[40px] gap-[32px]"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Coupons ── */}
          <View className="gap-[16px]">
            <Text variant="headlineSmall" className="px-[24px]">
              {t('coupon.sectionTitle')}
            </Text>
            {couponsLoading ? (
              <View className="items-center py-[32px]">
                <ActivityIndicator color={tokens.colors.primary} />
              </View>
            ) : coupons.length === 0 ? (
              <Surface tone="lowest" className="mx-[24px] p-[24px] rounded-lg">
                <LabelCaps className="text-on-surface-variant">{t('coupon.empty')}</LabelCaps>
              </Surface>
            ) : (
              <View className="px-[24px] gap-[12px]">
                {coupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onPress={() =>
                      router.push({
                        pathname: '/(explorer)/coupon/[id]',
                        params: { id: coupon.id },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Premium ── */}
          <View className="gap-[16px]">
            <Text variant="headlineSmall" className="px-[24px]">
              {t('premium.sectionTitle')}
            </Text>

            {isPremium ? (
              <Surface tone="lowest" className="mx-[24px] p-[20px] rounded-lg gap-[12px]">
                <LabelCaps className="text-primary">{t('premium.activeBadge')}</LabelCaps>
                <Text variant="bodyLarge" className="font-bold text-on-surface">
                  {activeSubscription?.planTierName || t('premium.activeGeneric')}
                </Text>
                <Pressable
                  onPress={confirmCancel}
                  disabled={cancel.isPending}
                  accessibilityRole="button"
                >
                  <LabelCaps className="text-on-surface-variant">
                    {t('premium.cancelCta')}
                  </LabelCaps>
                </Pressable>
              </Surface>
            ) : null}

            {tiersLoading ? (
              <View className="items-center py-[32px]">
                <ActivityIndicator color={tokens.colors.primary} />
              </View>
            ) : planTiers.length === 0 ? (
              <Surface tone="lowest" className="mx-[24px] p-[24px] rounded-lg">
                <LabelCaps className="text-on-surface-variant">{t('premium.empty')}</LabelCaps>
              </Surface>
            ) : (
              <View className="px-[24px] gap-[16px]">
                {planTiers.map((tier) => {
                  const cardEnabled = flags.payment && tier.weeklyPrice != null;
                  return (
                    <PlanTierCard
                      key={tier.id}
                      planTier={tier}
                      availableXp={availableXp}
                      isCurrentPremium={isPremium}
                      pending={purchase.isPending}
                      onPurchase={() =>
                        purchase.mutate({ planTierId: tier.id, planTierName: tier.name })
                      }
                      onPayWithCard={cardEnabled ? () => payWithCard(tier) : undefined}
                      cardPriceLabel={cardEnabled ? cardPriceLabel(tier) : undefined}
                      cardPending={cardPending}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
