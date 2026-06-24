/**
 * useEarnedBadges — there is no "earned badges" endpoint; a badge is earned iff
 * it backs an achievement the explorer owns. Joins the badge catalog, the
 * achievement templates (for the badge↔achievement link), and the explorer's
 * earned achievements (for the awarded date).
 */
import { useMemo } from 'react';
import { useBadges } from './useBadges';
import { useAchievements } from './useAchievements';
import { useExplorerAchievements } from './useExplorerAchievements';
import type { Badge } from '../api/schemas';

export interface BadgeEntry {
  badge: Badge;
  earned: boolean;
  /** When the backing achievement was awarded (cataloging date), if earned. */
  awardedAt?: string;
}

export function useEarnedBadges(explorerId: string | undefined) {
  const badgesQuery = useBadges();
  const achievementsQuery = useAchievements();
  const earnedQuery = useExplorerAchievements(explorerId);

  const entries = useMemo<BadgeEntry[]>(() => {
    const badges = badgesQuery.data?.items ?? [];
    const achievements = achievementsQuery.data?.items ?? [];
    const earned = earnedQuery.data?.items ?? [];

    // achievementId → earnedAt for the explorer's earned achievements.
    const awardedByAchievement = new Map<string, string | undefined>();
    for (const ea of earned) awardedByAchievement.set(ea.achievementId, ea.earnedAt ?? undefined);

    // badgeId → earliest awardedAt, via the achievement that backs the badge.
    const awardedByBadge = new Map<string, string | undefined>();
    for (const a of achievements) {
      if (a.badgeId && awardedByAchievement.has(a.id)) {
        if (!awardedByBadge.has(a.badgeId)) {
          awardedByBadge.set(a.badgeId, awardedByAchievement.get(a.id));
        }
      }
    }

    return badges.map((badge) => ({
      badge,
      earned: awardedByBadge.has(badge.id),
      awardedAt: awardedByBadge.get(badge.id),
    }));
  }, [badgesQuery.data, achievementsQuery.data, earnedQuery.data]);

  return {
    entries,
    isLoading: badgesQuery.isLoading || achievementsQuery.isLoading || earnedQuery.isLoading,
    isError: badgesQuery.isError || achievementsQuery.isError || earnedQuery.isError,
    refetch: () => {
      badgesQuery.refetch();
      achievementsQuery.refetch();
      earnedQuery.refetch();
    },
  };
}
