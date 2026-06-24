/**
 * Query-key namespace for the Rewards feature. Kept under a single `rewards` root
 * so invalidations are easy to scope (mirrors `gamificationKeys`).
 *
 * `catalog` caches a flat `Coupon[]`; `detail` caches a single `Coupon`. They share
 * the `coupons.all` prefix (used for bulk invalidation + detail seeding) but never
 * the same key, so a persisted cache can't restore the wrong shape under a shared
 * key (the bug the places `discover` namespace guards against).
 */
export const rewardsKeys = {
  all: ['rewards'] as const,
  coupons: {
    all: ['rewards', 'coupons'] as const,
    catalog: ['rewards', 'coupons', 'catalog'] as const,
    detail: (id: string) => ['rewards', 'coupons', 'detail', id] as const,
  },
  myCoupons: (explorerId: string) => ['rewards', 'myCoupons', explorerId] as const,
  planTiers: () => ['rewards', 'planTiers'] as const,
  activeSubscription: (explorerId: string) =>
    ['rewards', 'activeSubscription', explorerId] as const,
};
