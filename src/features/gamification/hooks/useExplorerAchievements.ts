/** useExplorerAchievements — achievements the explorer has earned. */
import { useQuery } from '@tanstack/react-query';
import { getExplorerAchievements } from '../api/explorerAchievementsApi';
import { gamificationKeys } from './keys';

export function useExplorerAchievements(explorerId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.explorerAchievements(explorerId ?? ''),
    queryFn: () => getExplorerAchievements(explorerId!),
    enabled: !!explorerId,
    staleTime: 60 * 1000,
  });
}
