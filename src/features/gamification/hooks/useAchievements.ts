/** useAchievements — all achievement templates. */
import { useQuery } from '@tanstack/react-query';
import { getAchievements } from '../api/achievementsApi';
import { gamificationKeys } from './keys';

export function useAchievements() {
  return useQuery({
    queryKey: gamificationKeys.achievements(),
    queryFn: () => getAchievements(),
    staleTime: 5 * 60 * 1000,
  });
}
