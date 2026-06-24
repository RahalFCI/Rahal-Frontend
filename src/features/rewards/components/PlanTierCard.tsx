/**
 * PlanTierCard — a premium subscription tier. Lists the tier's perks and a single
 * amber BeaconButton to purchase with XP (§3.3: at most one beacon per card). The
 * screen owns the disabled/already-premium state; the card renders the reason.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RelicCard } from '../../../shared/layout/RelicCard';
import { BeaconButton } from '../../../shared/layout/BeaconButton';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import type { PlanTier } from '../api/schemas';

export interface PlanTierCardProps {
  planTier: PlanTier;
  availableXp: number;
  /** True when the explorer already has an active subscription (any tier). */
  isCurrentPremium?: boolean;
  onPurchase: () => void;
  pending?: boolean;
}

export function PlanTierCard({
  planTier,
  availableXp,
  isCurrentPremium = false,
  onPurchase,
  pending = false,
}: PlanTierCardProps) {
  const { t } = useTranslation('rewards');
  const affordable = availableXp >= planTier.weeklyXpCost;
  const disabled = isCurrentPremium || !affordable || pending;

  return (
    <RelicCard className="gap-[16px]">
      <View className="gap-[4px]">
        <Text variant="headlineSmall" className="text-on-surface">
          {planTier.name}
        </Text>
        {planTier.description ? (
          <Text variant="bodyMedium" className="text-on-surface-variant">
            {planTier.description}
          </Text>
        ) : null}
      </View>

      <View className="gap-[6px]">
        {planTier.xpMultiplier != null && planTier.xpMultiplier > 1 ? (
          <LabelCaps className="text-primary">
            {t('premium.perkMultiplier', { value: planTier.xpMultiplier })}
          </LabelCaps>
        ) : null}
        {planTier.maxTravelPlans != null && planTier.maxTravelPlans > 0 ? (
          <LabelCaps className="text-on-surface-variant">
            {t('premium.perkTravelPlans', { count: planTier.maxTravelPlans })}
          </LabelCaps>
        ) : null}
        <LabelCaps className="text-on-surface-variant">
          {t('premium.priceXp', { value: planTier.weeklyXpCost })}
        </LabelCaps>
      </View>

      <BeaconButton
        label={
          isCurrentPremium
            ? t('premium.alreadyActive')
            : !affordable
              ? t('eligibility.INSUFFICIENT_XP')
              : t('premium.purchaseCta')
        }
        onPress={onPurchase}
        disabled={disabled}
        className={disabled ? 'opacity-50' : ''}
      />
    </RelicCard>
  );
}
