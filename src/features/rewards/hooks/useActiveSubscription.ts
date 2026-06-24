/**
 * useActiveSubscription — the explorer's current premium subscription, or `null`
 * when they have none. Backing the premium-status banner on the rewards screen.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore';
import { getActiveSubscription } from '../api/subscriptionsApi';
import { rewardsKeys } from './keys';

export function useActiveSubscription() {
  const explorerId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: rewardsKeys.activeSubscription(explorerId ?? ''),
    queryFn: () => getActiveSubscription(),
    enabled: !!explorerId,
  });
}
