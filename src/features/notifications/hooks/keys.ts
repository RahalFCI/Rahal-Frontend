/**
 * Query-key namespace for the Notifications feature, under a single `notifications`
 * root for easy scoped invalidation (mirrors `socialKeys` / `rewardsKeys`).
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => ['notifications', 'list'] as const,
  unread: () => ['notifications', 'unread'] as const,
};
