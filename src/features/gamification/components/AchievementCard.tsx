/**
 * AchievementCard — a cataloged achievement (earned or in-progress). Earned cards
 * carry the amber accent; unearned ones stay tonal. A progress hint is shown only
 * when the criteria maps cleanly to a known stat (best-effort — CLAUDE.md §3.2).
 */
import { View } from 'react-native';
import { Award, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { RelicCard } from '../../../shared/layout/RelicCard';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import type { Achievement } from '../api/schemas';

export interface AchievementProgress {
  current: number;
  threshold: number;
}

export function AchievementCard({
  achievement,
  earned,
  progress,
}: {
  achievement: Achievement;
  earned: boolean;
  progress?: AchievementProgress;
}) {
  const { t } = useTranslation('gamification');
  const xpReward = achievement.xpReward ?? 0;
  const pct =
    progress && progress.threshold > 0
      ? Math.min(1, progress.current / progress.threshold)
      : null;

  return (
    <RelicCard className={`gap-[12px] ${earned ? '' : 'opacity-80'}`}>
      <View className="flex-row items-center gap-[16px]">
        <View
          className={`w-[48px] h-[48px] rounded-sm items-center justify-center ${
            earned ? 'bg-primary-container/20' : 'bg-surface-container'
          }`}
        >
          {earned ? (
            <Check size={20} color={tokens.colors.primary} strokeWidth={2.5} />
          ) : (
            <Award size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
          )}
        </View>

        <View className="flex-1 min-w-0">
          <Text variant="bodyMedium" className="font-bold text-on-surface" numberOfLines={2}>
            {achievement.title}
          </Text>
          <LabelCaps className={earned ? 'text-primary mt-[2px]' : 'text-on-surface-variant mt-[2px]'}>
            {earned ? t('achievements.earned') : t('achievements.xpReward', { xp: xpReward })}
          </LabelCaps>
        </View>
      </View>

      {achievement.description ? (
        <Text variant="bodyMedium" className="text-on-surface-variant" numberOfLines={3}>
          {achievement.description}
        </Text>
      ) : null}

      {!earned && pct != null ? (
        <View className="gap-[6px]">
          <View className="flex-row items-center justify-between">
            <LabelCaps className="text-on-surface-variant">{t('achievements.progress')}</LabelCaps>
            <Text variant="labelSmall" className="text-primary font-bold">
              {progress!.current} / {progress!.threshold}
            </Text>
          </View>
          <View className="h-[8px] rounded-xl overflow-hidden bg-surface-container">
            <View
              className="h-full rounded-xl bg-primary"
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </View>
        </View>
      ) : null}
    </RelicCard>
  );
}
