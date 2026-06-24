/**
 * useMyCoupons — the signed-in explorer's claimed coupons (the wallet).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore';
import { getMyCoupons } from '../api/userCouponsApi';
import { rewardsKeys } from './keys';

export function useMyCoupons() {
  const explorerId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: rewardsKeys.myCoupons(explorerId ?? ''),
    queryFn: () => getMyCoupons(),
    enabled: !!explorerId,
  });

  const userCoupons = useMemo(() => query.data?.items ?? [], [query.data]);
  return { ...query, userCoupons };
}
