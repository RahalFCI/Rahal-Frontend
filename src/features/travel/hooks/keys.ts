/**
 * Query-key namespace for the Travel-plan feature. Single `travel` root so
 * invalidations are easy to scope (mirrors `gamificationKeys` / `rewardsKeys`).
 */
export const travelKeys = {
  all: ['travel'] as const,
  mine: (explorerId: string) => ['travel', 'mine', explorerId] as const,
  detail: (id: string) => ['travel', 'detail', id] as const,
};
