/**
 * useMyTravelPlans — the current explorer's saved travel plans (newest first). Backs
 * both the history list and the plans-used-this-period count used for the quota line.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore';
import { getMyTravelPlans } from '../api/travelPlansApi';
import { travelKeys } from './keys';

export function useMyTravelPlans() {
  const explorerId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: travelKeys.mine(explorerId ?? ''),
    queryFn: () => getMyTravelPlans({ page: 1, pageSize: 20 }),
    enabled: !!explorerId,
  });
}
