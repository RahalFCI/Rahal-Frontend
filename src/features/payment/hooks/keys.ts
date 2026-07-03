/**
 * Query-key namespace for the Payment feature, under a single `payment` root
 * (mirrors `rewardsKeys` / `notificationKeys`). The feature is mutation-only for now,
 * so this is thin — kept for convention and future payment-history queries.
 */
export const paymentKeys = {
  all: ['payment'] as const,
};
