/**
 * Best-effort mapping from an achievement's criteria to a UserStats counter, so
 * unearned achievements can show progress. The backend's `criteriaCode` actually
 * carries the criteria *Name* (e.g. "Total Check-ins"), so we normalize and match
 * both the Name and the underlying Code. Returns null when no clean mapping exists
 * (CLAUDE.md §3.2: no progress bar rather than a misleading one).
 */

/** The subset of UserStats the progress mapping reads. */
export interface ProgressStats {
  cumulativeXp?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalCheckIns?: number;
  totalChallengesCompleted?: number;
  totalAchievementsEarned?: number;
  totalBadgesEarned?: number;
}

function normalize(value: string | null | undefined): string {
  return (value ?? '').toUpperCase().replace(/[^A-Z]/g, '');
}

export function statForCriteria(
  criteriaCode: string | null | undefined,
  stats: ProgressStats | undefined,
): number | null {
  if (!stats) return null;
  switch (normalize(criteriaCode)) {
    case 'TOTALCHECKINS':
      return stats.totalCheckIns ?? 0;
    case 'TOTALXP':
      return stats.cumulativeXp ?? 0;
    case 'LONGESTSTREAK':
      return stats.longestStreak ?? 0;
    case 'TOTALCHALLENGES':
      return stats.totalChallengesCompleted ?? 0;
    case 'TOTALBADGES':
      return stats.totalBadgesEarned ?? 0;
    case 'TOTALACHIEVEMENTS':
      return stats.totalAchievementsEarned ?? 0;
    default:
      return null;
  }
}
