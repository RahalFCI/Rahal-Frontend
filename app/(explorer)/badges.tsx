/**
 * Badges & Achievements catalog (Phase 3). The badge wall (earned vs. unearned,
 * earned = backs an owned achievement) plus the achievement ledger with progress
 * hints. Reached from the Profile "view all" link.
 */
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { useEarnedBadges } from '../../src/features/gamification/hooks/useEarnedBadges';
import { useAchievements } from '../../src/features/gamification/hooks/useAchievements';
import { useExplorerAchievements } from '../../src/features/gamification/hooks/useExplorerAchievements';
import { BadgeCard } from '../../src/features/gamification/components/BadgeCard';
import { AchievementCard } from '../../src/features/gamification/components/AchievementCard';
import { formatCatalogDate } from '../../src/features/gamification/utils/format';
import { statForCriteria } from '../../src/features/gamification/utils/achievementProgress';
import { resolveMediaUrl } from '../../src/shared/utils/mediaUrl';
import { tokens } from '../../src/shared/theme';

export default function BadgesScreen() {
  const router = useRouter();
  const { t } = useTranslation('gamification');
  const userId = useAuthStore((s) => s.user?.id);

  const { entries: badgeEntries, isLoading: badgesLoading } = useEarnedBadges(userId);
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: earned } = useExplorerAchievements(userId);
  const { data: profile } = useProfile(userId);

  const earnedIds = new Set((earned?.items ?? []).map((e) => e.achievementId));
  const isLoading = badgesLoading || achievementsLoading;

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Back row */}
        <View className="flex-row items-center px-[16px] py-[12px]">
          <Pressable
            onPress={() => router.back()}
            className="p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('common.back')}
          >
            <ChevronLeft size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="pb-[40px] gap-[32px]"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="items-center py-[48px]">
              <ActivityIndicator color={tokens.colors.primary} size="large" />
            </View>
          ) : (
            <>
              {/* ── Badges ── */}
              <View className="gap-[20px]">
                <Text variant="headlineLarge" className="px-[24px]">
                  {t('badges.title')}
                </Text>
                {badgeEntries.length === 0 ? (
                  <Surface tone="lowest" className="mx-[24px] p-[24px] rounded-lg">
                    <LabelCaps className="text-on-surface-variant">{t('badges.empty')}</LabelCaps>
                  </Surface>
                ) : (
                  <View className="px-[24px] flex-row flex-wrap gap-[16px]">
                    {badgeEntries.map((entry) => (
                      <View key={entry.badge.id} className="w-[47%]">
                        <BadgeCard
                          name={entry.badge.name}
                          subtitle={
                            entry.earned
                              ? formatCatalogDate(entry.awardedAt) || t('badges.earned')
                              : t('badges.locked')
                          }
                          locked={!entry.earned}
                          imageUrl={resolveMediaUrl(entry.badge.imageUrl)}
                          onPress={() =>
                            router.push({
                              pathname: '/(explorer)/badge/[id]',
                              params: { id: entry.badge.id },
                            })
                          }
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* ── Achievements ── */}
              <View className="gap-[20px]">
                <Text variant="headlineLarge" className="px-[24px]">
                  {t('achievements.title')}
                </Text>
                {(achievements?.items ?? []).length === 0 ? (
                  <Surface tone="lowest" className="mx-[24px] p-[24px] rounded-lg">
                    <LabelCaps className="text-on-surface-variant">
                      {t('achievements.empty')}
                    </LabelCaps>
                  </Surface>
                ) : (
                  <View className="px-[24px] gap-[16px]">
                    {(achievements?.items ?? []).map((achievement) => {
                      const isEarned = earnedIds.has(achievement.id);
                      const current = statForCriteria(achievement.criteriaCode, profile?.stats);
                      const threshold = achievement.criteriaThreshold ?? 0;
                      return (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          earned={isEarned}
                          progress={
                            !isEarned && current != null && threshold > 0
                              ? { current, threshold }
                              : undefined
                          }
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
