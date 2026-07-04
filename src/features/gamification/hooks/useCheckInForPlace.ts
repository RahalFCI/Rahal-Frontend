/**
 * useCheckInForPlace — the current explorer's check-in at a place (or null when they
 * haven't checked in there). Exposes the `checkInId` the challenge-attempt flow links
 * against, so a challenge card can gate "Attempt" behind a completed check-in.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore';
import { getCheckInForPlace } from '../api/checkInApi';
import { gamificationKeys } from './keys';

export function useCheckInForPlace(placeId: string | undefined) {
  const explorerId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: gamificationKeys.checkInForPlace(explorerId ?? '', placeId ?? ''),
    queryFn: () => getCheckInForPlace(explorerId!, placeId!),
    enabled: !!explorerId && !!placeId,
  });
}
