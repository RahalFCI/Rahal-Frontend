/**
 * useCoupons — the coupon catalog for the rewards screen. A non-empty query runs
 * full-text search; otherwise the default paged list. Both normalize to a flat
 * `coupons` array so the screen is agnostic to the source (mirrors
 * `useDiscoverPlaces`).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCoupons, searchCoupons } from '../api/couponsApi';
import type { Coupon } from '../api/schemas';
import { rewardsKeys } from './keys';

export function useCoupons(query = '') {
  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const result = useQuery({
    queryKey: isSearching ? rewardsKeys.coupons.search(trimmed) : rewardsKeys.coupons.catalog,
    queryFn: async (): Promise<Coupon[]> => {
      if (isSearching) return searchCoupons(trimmed);
      return (await getCoupons()).items;
    },
  });

  // Guard against a persisted cache restoring a non-array shape under this key.
  const coupons = useMemo(() => (Array.isArray(result.data) ? result.data : []), [result.data]);
  return { ...result, coupons };
}
