/** useBadges — the full badge catalog. */
import { useQuery } from '@tanstack/react-query';
import { getBadges } from '../api/badgesApi';
import { gamificationKeys } from './keys';

export function useBadges() {
  return useQuery({
    queryKey: gamificationKeys.badges(),
    queryFn: () => getBadges(),
    staleTime: 5 * 60 * 1000,
  });
}
