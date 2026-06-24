/**
 * usePlanTiers — the premium subscription tier catalog. Only active tiers are
 * surfaced (inactive ones are admin-archived).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlanTiers } from '../api/subscriptionsApi';
import { rewardsKeys } from './keys';

export function usePlanTiers() {
  const query = useQuery({
    queryKey: rewardsKeys.planTiers(),
    queryFn: () => getPlanTiers(),
  });

  const planTiers = useMemo(
    () => (query.data?.items ?? []).filter((tier) => tier.isActive),
    [query.data],
  );
  return { ...query, planTiers };
}
