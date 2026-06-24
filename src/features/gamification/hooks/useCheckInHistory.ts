/** useCheckInHistory — the explorer's check-in history (first page). */
import { useQuery } from '@tanstack/react-query';
import { getCheckInHistory } from '../api/checkInHistoryApi';
import { gamificationKeys } from './keys';

export function useCheckInHistory(explorerId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.checkInHistory(explorerId ?? ''),
    queryFn: () => getCheckInHistory(explorerId!),
    enabled: !!explorerId,
    staleTime: 60 * 1000,
  });
}
