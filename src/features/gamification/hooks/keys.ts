/** TanStack Query keys for the gamification feature. */
export const gamificationKeys = {
  xp: (explorerId: string) => ['gamification', 'xp', explorerId] as const,
  badges: () => ['gamification', 'badges'] as const,
  achievements: () => ['gamification', 'achievements'] as const,
  placeChallenges: (placeId: string) => ['gamification', 'placeChallenges', placeId] as const,
  checkInForPlace: (explorerId: string, placeId: string) =>
    ['gamification', 'checkInForPlace', explorerId, placeId] as const,
  checkInChallenges: (checkInId: string) =>
    ['gamification', 'checkInChallenges', checkInId] as const,
  explorerAchievements: (explorerId: string) =>
    ['gamification', 'explorerAchievements', explorerId] as const,
  checkInHistory: (explorerId: string) =>
    ['gamification', 'checkInHistory', explorerId] as const,
};
