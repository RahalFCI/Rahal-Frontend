/**
 * TravelPlanCard — a saved travel plan in the history list. Collapsed it shows the
 * prompt, duration and date; tapping expands the full generated plan inline (no
 * separate detail route needed). Editorial: a catalogued journal entry.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RelicCard } from '../../../shared/layout';
import { LabelCaps, Text } from '../../../shared/components';
import { GeneratedPlanView } from './GeneratedPlanView';
import type { TravelPlan } from '../api/schemas';

interface TravelPlanCardProps {
  plan: TravelPlan;
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function TravelPlanCard({ plan }: TravelPlanCardProps) {
  const { t } = useTranslation('travel');
  const [expanded, setExpanded] = useState(false);
  const date = formatDate(plan.createdAt);

  return (
    <RelicCard className="gap-[12px]">
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? t('history.collapse') : t('history.expand')}
        className="gap-[8px]"
      >
        <View className="flex-row items-center justify-between gap-[12px]">
          <LabelCaps className="text-primary">
            {t('history.durationMeta', { count: plan.stayDurationDays ?? 0 })}
          </LabelCaps>
          {date ? <LabelCaps className="text-on-surface-variant">{date}</LabelCaps> : null}
        </View>
        <Text
          variant="bodyLarge"
          className="text-on-surface font-bold"
          numberOfLines={expanded ? undefined : 2}
        >
          {plan.prompt}
        </Text>
        {!expanded ? (
          <LabelCaps className="text-on-surface-variant">{t('history.tapToExpand')}</LabelCaps>
        ) : null}
      </Pressable>

      {expanded ? <GeneratedPlanView text={plan.generatedPlanJson} /> : null}
    </RelicCard>
  );
}
