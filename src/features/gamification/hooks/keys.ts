/** TanStack Query keys for the gamification feature. */
export const gamificationKeys = {
  xp: (explorerId: string) => ['gamification', 'xp', explorerId] as const,
  badges: () => ['gamification', 'badges'] as const,
  achievements: () => ['gamification', 'achievements'] as const,
  explorerAchievements: (explorerId: string) =>
    ['gamification', 'explorerAchievements', explorerId] as const,
  checkInHistory: (explorerId: string) =>
    ['gamification', 'checkInHistory', explorerId] as const,
};
