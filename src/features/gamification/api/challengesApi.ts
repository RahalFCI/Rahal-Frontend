/**
 * Challenges API — `GET /Challenge/place/{placeId}` (Bearer). These are the
 * challenge templates attached to a place; attempting them is a separate backend
 * flow that currently needs a check-in id the check-in DTO does not expose.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { challengeEndpoints } from './endpoints';
import { pagedChallengesSchema, type Challenge } from './schemas';
import type { PageParams } from './xpTransactionsApi';

export async function getChallengesByPlace(
  placeId: string,
  { page = 1, pageSize = 20 }: PageParams = {},
): Promise<Challenge[]> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: challengeEndpoints.forPlace(placeId),
    params: { page, pageSize },
  });

  return zodParse(pagedChallengesSchema, data).items.filter((challenge) => challenge.isActive !== false);
}
