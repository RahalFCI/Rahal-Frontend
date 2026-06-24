/**
 * Rewards endpoints (relative to env.API_BASE_URL, which already includes /api).
 * Mirrors the Rewards module controllers: CouponController, UserCouponController,
 * PlanTierController, SubscriptionController. Routes are case-insensitive on the
 * backend; PascalCase matches the rest of the front-end (see places/api/endpoints).
 */
export const couponEndpoints = {
  list: '/Coupon',
  byId: (id: string) => `/Coupon/${id}`,
} as const;

export const userCouponEndpoints = {
  /** Explorer claims a coupon (spends XP). Explorer id comes from the JWT — no body. */
  claim: (couponId: string) => `/UserCoupon/claim/${couponId}`,
  /** The signed-in explorer's claimed coupons (the wallet). */
  mine: '/UserCoupon/mine',
} as const;

export const planTierEndpoints = {
  list: '/PlanTier',
  byId: (id: string) => `/PlanTier/${id}`,
} as const;

export const subscriptionEndpoints = {
  purchase: '/Subscription/purchase',
  /** Returns 404 when the explorer has no active subscription. */
  active: '/Subscription/active',
  cancel: '/Subscription/cancel',
} as const;
