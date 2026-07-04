/**
 * Travel Plan screen (Phase — Travel Planner) — a hidden route reached from the Premium
 * tab. Premium-gated: non-subscribers see an upsell; subscribers get the generator, a
 * per-period quota line (used / maxTravelPlans), the freshly generated plan, and their
 * saved history. Generation is RAG-backed and can take several seconds — the button
 * reflects the pending state and a note sets the expectation. Editorial per §3.2.
 */
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { Surface, Text, LabelCaps, Icon } from '../../src/shared/components';
import { OffsetHeadline, RelicCard, BeaconButton } from '../../src/shared/layout';
import { tokens } from '../../src/shared/theme';
import { useActiveSubscription } from '../../src/features/rewards/hooks/useActiveSubscription';
import { usePlanTiers } from '../../src/features/rewards/hooks/usePlanTiers';
import { useMyTravelPlans } from '../../src/features/travel/hooks/useMyTravelPlans';
import { useCreateTravelPlan } from '../../src/features/travel/hooks/useCreateTravelPlan';
import { TravelPlanForm } from '../../src/features/travel/components/TravelPlanForm';
import { TravelPlanCard } from '../../src/features/travel/components/TravelPlanCard';
import { GeneratedPlanView } from '../../src/features/travel/components/GeneratedPlanView';

export default function TravelPlanScreen() {
  const { t } = useTranslation('travel');
  const router = useRouter();

  const { data: activeSubscription, isLoading: subLoading } = useActiveSubscription();
  const isPremium =
    activeSubscription?.status === 'Active' || activeSubscription?.status === 'Pending';

  const { planTiers } = usePlanTiers();
  const activeTier = planTiers.find((tier) => tier.id === activeSubscription?.planTierId);
  const maxPlans = activeTier?.maxTravelPlans ?? null;

  const { data: mine, isLoading: mineLoading } = useMyTravelPlans();
  const plans = mine?.items ?? [];
  const usedCount = mine?.totalCount ?? plans.length;
  const quotaReached = maxPlans != null && usedCount >= maxPlans;

  const create = useCreateTravelPlan();
  const latestGenerated = create.data;

  const back = (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/premium'))}
      accessibilityRole="button"
      accessibilityLabel={t('back')}
      hitSlop={8}
      className="pl-[24px] pt-[8px] flex-row items-center gap-[6px]"
    >
      <Icon icon={ArrowLeft} size={18} color={tokens.colors.onSurfaceVariant} />
      <LabelCaps className="text-on-surface-variant">{t('back')}</LabelCaps>
    </Pressable>
  );

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {back}
        <View className="pt-[12px]">
          <OffsetHeadline title={t('screen.title')} />
        </View>

        <ScrollView
          contentContainerClassName="pt-[16px] pb-[120px] gap-[16px]"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {subLoading ? (
            <View className="items-center py-[32px]">
              <ActivityIndicator color={tokens.colors.primary} />
            </View>
          ) : !isPremium ? (
            <Surface tone="lowest" className="mx-[24px] p-[24px] rounded-lg gap-[12px]">
              <LabelCaps className="text-primary">{t('upsell.eyebrow')}</LabelCaps>
              <Text variant="bodyLarge" className="text-on-surface font-bold">
                {t('upsell.title')}
              </Text>
              <Text variant="bodyMedium" className="text-on-surface-variant">
                {t('upsell.body')}
              </Text>
              <BeaconButton label={t('upsell.cta')} onPress={() => router.replace('/premium')} />
            </Surface>
          ) : (
            <>
              <Text variant="bodyMedium" className="px-[24px] text-on-surface-variant">
                {t('screen.subtitle')}
              </Text>

              <View className="px-[24px]">
                <LabelCaps className="text-primary">
                  {maxPlans != null
                    ? t('quota.used', { used: usedCount, max: maxPlans })
                    : t('quota.usedNoMax', { used: usedCount })}
                </LabelCaps>
              </View>

              <View className="px-[24px]">
                <TravelPlanForm
                  onGenerate={(input) => create.mutate(input)}
                  pending={create.isPending}
                  disabled={quotaReached}
                  submitLabel={quotaReached ? t('quota.reached') : undefined}
                />
              </View>

              {create.isPending ? (
                <View className="px-[24px] flex-row items-center gap-[10px]">
                  <ActivityIndicator color={tokens.colors.primary} />
                  <Text variant="bodyMedium" className="text-on-surface-variant flex-1">
                    {t('screen.generating')}
                  </Text>
                </View>
              ) : null}

              {latestGenerated ? (
                <View className="px-[24px]">
                  <RelicCard className="gap-[12px]">
                    <LabelCaps className="text-primary">{t('result.eyebrow')}</LabelCaps>
                    <Text variant="headlineSmall" className="text-on-surface font-bold">
                      {latestGenerated.prompt}
                    </Text>
                    <GeneratedPlanView text={latestGenerated.generatedPlanJson} />
                  </RelicCard>
                </View>
              ) : null}

              <View className="px-[24px] pt-[8px]">
                <LabelCaps className="text-on-surface-variant">{t('history.title')}</LabelCaps>
              </View>

              {mineLoading ? (
                <View className="items-center py-[16px]">
                  <ActivityIndicator color={tokens.colors.primary} />
                </View>
              ) : plans.length === 0 ? (
                <View className="px-[24px]">
                  <Text variant="bodyMedium" className="text-on-surface-variant">
                    {t('history.empty')}
                  </Text>
                </View>
              ) : (
                <View className="px-[24px] gap-[16px]">
                  {plans.map((plan) => (
                    <TravelPlanCard key={plan.id} plan={plan} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
