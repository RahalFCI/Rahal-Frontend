/**
 * useCoupon — server state for a single coupon (the detail screen). Seeds itself
 * from any cached catalog/search entry so the screen paints instantly on navigation
 * (mirrors `usePlace`).
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoupon } from '../api/couponsApi';
import type { Coupon } from '../api/schemas';
import { rewardsKeys } from './keys';

export function useCoupon(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: rewardsKeys.coupons.detail(id),
    queryFn: () => getCoupon(id),
    enabled: !!id,
    placeholderData: () =>
      queryClient
        .getQueriesData<Coupon[] | { items?: Coupon[] }>({ queryKey: rewardsKeys.coupons.all })
        .flatMap(([, data]) => (Array.isArray(data) ? data : (data?.items ?? [])))
        .find((coupon) => coupon?.id === id),
  });
}
