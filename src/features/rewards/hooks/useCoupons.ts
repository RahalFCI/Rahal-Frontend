/**
 * useCoupons — the active coupon catalog for the rewards screen. Inactive coupons
 * (admin-archived) are filtered out, mirroring `usePlanTiers`. Normalizes the paged
 * response to a flat `coupons` array so the screen is agnostic to the source.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCoupons } from '../api/couponsApi';
import { rewardsKeys } from './keys';

export function useCoupons() {
  const query = useQuery({
    queryKey: rewardsKeys.coupons.catalog,
    queryFn: async () => (await getCoupons()).items,
  });

  // Guard against a persisted cache restoring a non-array shape, then drop inactive.
  const coupons = useMemo(
    () => (Array.isArray(query.data) ? query.data : []).filter((coupon) => coupon.isActive),
    [query.data],
  );
  return { ...query, coupons };
}
