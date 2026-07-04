/**
 * Premium screen (Phase 6) — its own tab, split out of the coupons catalog. Lists
 * the premium subscription tiers (subscribe with XP, or pay with card via Stripe)
 * and the active-subscription banner with cancel. Editorial treatment per
 * CLAUDE.md §3.2 — a considered upgrade, not a hard-sell storefront.
 */
import { View, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Map } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { Icon } from '../../src/shared/components/Icon';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { RelicCard } from '../../src/shared/layout/RelicCard';
import { tokens } from '../../src/shared/theme';
import { flags } from '../../src/config/flags';
import { env } from '../../src/config/env';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { usePlanTiers } from '../../src/features/rewards/hooks/usePlanTiers';
import { useActiveSubscription } from '../../src/features/rewards/hooks/useActiveSubscription';
import { usePurchaseSubscription } from '../../src/features/rewards/hooks/usePurchaseSubscription';
import { useActivatePremiumWithCard } from '../../src/features/rewards/hooks/useActivatePremiumWithCard';
import { useCancelSubscription } from '../../src/features/rewards/hooks/useCancelSubscription';
import { useCardCheckout } from '../../src/features/payment/hooks/useCardCheckout';
import { PlanTierCard } from '../../src/features/rewards/components/PlanTierCard';
import type { PlanTier } from '../../src/features/rewards/api/schemas';

export default function PremiumScreen() {
  const { t } = useTranslation('rewards');
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: profile } = useProfile(userId);
  const availableXp = profile?.availableXp ?? 0;

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
  // successful charge — activate premium. The backend doesn't link the two, so this
  // screen composes them: charge, then grant. See the payment feature.
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
        <View className="pt-[16px]">
          <OffsetHeadline title={t('screen.premium.title')} />
          <LabelCaps className="pl-[24px] mt-[4px] text-primary">
            {t('screen.rewards.balance', { value: availableXp })}
          </LabelCaps>
        </View>

        <ScrollView
          contentContainerClassName="pt-[24px] pb-[120px] gap-[16px]"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="bodyMedium" className="px-[24px] text-on-surface-variant">
            {t('screen.premium.subtitle')}
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

          {/* Travel Planner entry — the marquee premium perk. Routes to the gated
              generator; the screen itself upsells if the explorer isn't premium. */}
          <View className="px-[24px]">
            <Pressable
              onPress={() => router.push('/travel-plan')}
              accessibilityRole="button"
              accessibilityLabel={t('travel:entry.cta')}
            >
              <RelicCard className="gap-[8px]">
                <View className="flex-row items-center gap-[10px]">
                  <Icon icon={Map} size={20} color={tokens.colors.primary} strokeWidth={2} />
                  <LabelCaps className="text-primary">{t('travel:entry.eyebrow')}</LabelCaps>
                </View>
                <Text variant="bodyLarge" className="text-on-surface font-bold">
                  {t('travel:entry.title')}
                </Text>
                <Text variant="bodyMedium" className="text-on-surface-variant">
                  {t('travel:entry.body')}
                </Text>
                <LabelCaps className="text-primary mt-[4px]">{t('travel:entry.cta')}</LabelCaps>
              </RelicCard>
            </Pressable>
          </View>

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
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
