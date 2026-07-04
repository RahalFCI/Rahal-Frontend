/**
 * useCheckInChallenges — the explorer's challenge attempts tied to a check-in, so a
 * challenge card can reflect Completed (Approved) / In-review (Pending) states. Skips
 * when there's no check-in yet (no id to query against).
 */
import { useQuery } from '@tanstack/react-query';
import { getCheckInChallengesForCheckIn } from '../api/checkInChallengeApi';
import { gamificationKeys } from './keys';

export function useCheckInChallenges(checkInId: string | null | undefined) {
  return useQuery({
    queryKey: gamificationKeys.checkInChallenges(checkInId ?? ''),
    queryFn: () => getCheckInChallengesForCheckIn(checkInId!),
    enabled: !!checkInId,
  });
}
