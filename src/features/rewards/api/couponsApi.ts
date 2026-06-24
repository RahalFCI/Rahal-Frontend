/**
 * Coupons API. Coupon reads are `[Authorize]` (any authenticated role), so they go
 * through `apiClient` (which attaches the bearer token), not `publicApiClient`.
 * Responses are unwrapped from ApiResponse<T> and Zod-validated.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { couponEndpoints } from './endpoints';
import { couponSchema, pagedCouponsSchema, type Coupon, type PagedCoupons } from './schemas';

export interface GetCouponsParams {
  page?: number;
  pageSize?: number;
}

export async function getCoupons({
  page = 1,
  pageSize = 50,
}: GetCouponsParams = {}): Promise<PagedCoupons> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: couponEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedCouponsSchema, data);
}

export async function getCoupon(id: string): Promise<Coupon> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: couponEndpoints.byId(id),
  });
  return zodParse(couponSchema, data);
}
