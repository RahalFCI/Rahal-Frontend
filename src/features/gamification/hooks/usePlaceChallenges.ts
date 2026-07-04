/** usePlaceChallenges — active challenge templates attached to a place. */
import { useQuery } from '@tanstack/react-query';
import { getChallengesByPlace } from '../api/challengesApi';
import { gamificationKeys } from './keys';

export function usePlaceChallenges(placeId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.placeChallenges(placeId ?? ''),
    queryFn: () => getChallengesByPlace(placeId!),
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000,
  });
}
