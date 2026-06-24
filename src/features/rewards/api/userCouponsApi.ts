/**
 * User-coupon (wallet) API — Explorer-only endpoints. Claiming spends XP via a
 * backend MassTransit consumer (the POST returns the claimed coupon immediately,
 * but the XP balance updates a beat later — callers poll the profile, like check-in).
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { userCouponEndpoints } from './endpoints';
import {
  pagedUserCouponsSchema,
  userCouponSchema,
  type PagedUserCoupons,
  type UserCoupon,
} from './schemas';

export interface GetMyCouponsParams {
  page?: number;
  pageSize?: number;
}

/** Claims a coupon for the signed-in explorer. No body — the explorer id is read
 *  from the JWT server-side. Returns the newly created wallet entry (with its code). */
export async function claimCoupon(couponId: string): Promise<UserCoupon> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: userCouponEndpoints.claim(couponId),
  });
  return zodParse(userCouponSchema, data);
}

export async function getMyCoupons({
  page = 1,
  pageSize = 50,
}: GetMyCouponsParams = {}): Promise<PagedUserCoupons> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: userCouponEndpoints.mine,
    params: { page, pageSize },
  });
  return zodParse(pagedUserCouponsSchema, data);
}
