/**
 * Zod schemas for the Rewards module — validated at the client boundary
 * (CLAUDE.md §2.3 rule 5). Mirror the backend DTOs:
 *   GetCouponDto, GetUserCouponDto, GetPlanTierDto, GetSubscriptionDto.
 *
 * The backend serializes enums as their string name (JsonStringEnumConverter is
 * configured globally), so `discountType`, `status`, and `paymentMethod` arrive as
 * strings (e.g. "Percentage", "Claimed", "Xp"). Optional/nullable fields use
 * `.nullish()` defensively, matching the places/gamification schemas.
 */
import { z } from 'zod';
import { pagedSchema } from '../../gamification/api/schemas';

export { pagedSchema };

/** GetCouponDto — a vendor discount an explorer can claim by spending XP. */
export const couponSchema = z.object({
  id: z.string(),
  vendorId: z.string().nullish(),
  title: z.string(),
  description: z.string().nullish(),
  xpCost: z.number(),
  /** Stringified CouponDiscountType: "FixedAmount" | "Percentage". */
  discountType: z.string().nullish(),
  discountValue: z.number(),
  maxDiscountValue: z.number().nullish(),
  minimumCharge: z.number().nullish(),
  maxClaims: z.number(),
  currentClaims: z.number().nullish(),
  /** Server-computed: max(0, MaxClaims - CurrentClaims). */
  remainingClaims: z.number().nullish(),
  expiresAt: z.string(),
  isActive: z.boolean(),
});
export const pagedCouponsSchema = pagedSchema(couponSchema);

/** GetUserCouponDto — a coupon the explorer has claimed (a wallet entry). */
export const userCouponSchema = z.object({
  id: z.string(),
  explorerId: z.string().nullish(),
  couponId: z.string().nullish(),
  /** Unique redeemable code, format `CPN-{guid}`. */
  code: z.string(),
  isRedeemed: z.boolean().nullish(),
  /** Stringified UserCouponStatus: Pending | Claimed | Redeemed | Expired | Cancelled. */
  status: z.string().nullish(),
  claimedAt: z.string().nullish(),
  redeemedAt: z.string().nullish(),
  expiresAt: z.string().nullish(),
  couponTitle: z.string().nullish(),
});
export const pagedUserCouponsSchema = pagedSchema(userCouponSchema);

/** GetPlanTierDto — a premium subscription tier. */
export const planTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  weeklyPrice: z.number().nullish(),
  weeklyXpCost: z.number(),
  xpMultiplier: z.number().nullish(),
  maxTravelPlans: z.number().nullish(),
  isActive: z.boolean(),
});
export const pagedPlanTiersSchema = pagedSchema(planTierSchema);

/** GetSubscriptionDto — the explorer's premium subscription. */
export const subscriptionSchema = z.object({
  id: z.string(),
  explorerId: z.string().nullish(),
  planTierId: z.string().nullish(),
  planTierName: z.string().nullish(),
  /** Stringified SubscriptionPaymentMethod: "Xp" | "Visa". */
  paymentMethod: z.string().nullish(),
  /** Stringified SubscriptionStatus: Pending | Active | Expired | Cancelled. */
  status: z.string().nullish(),
  startedAt: z.string().nullish(),
  expiresAt: z.string().nullish(),
  cancelledAt: z.string().nullish(),
});

/**
 * SearchResult<GetCouponDto> — the `/Coupon/search` envelope differs from
 * `PagedResult`: hits live under `hits`, the count under `totalHits`.
 */
export const couponSearchResultSchema = z.object({
  hits: z.array(couponSchema),
  totalHits: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

export type Coupon = z.infer<typeof couponSchema>;
export type UserCoupon = z.infer<typeof userCouponSchema>;
export type PlanTier = z.infer<typeof planTierSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type PagedCoupons = z.infer<typeof pagedCouponsSchema>;
export type PagedUserCoupons = z.infer<typeof pagedUserCouponsSchema>;
export type PagedPlanTiers = z.infer<typeof pagedPlanTiersSchema>;
