/**
 * Badges API — `GET /Badge` (Bearer). The full badge catalog, paginated.
 * Earned state is derived client-side (a badge is earned iff it backs an
 * achievement the explorer owns — see useEarnedBadges).
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { badgeEndpoints } from './endpoints';
import { pagedBadgesSchema } from './schemas';
import type { PageParams } from './xpTransactionsApi';
import type { z } from 'zod';

export type PagedBadges = z.infer<typeof pagedBadgesSchema>;

export async function getBadges(
  { page = 1, pageSize = 50 }: PageParams = {},
): Promise<PagedBadges> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: badgeEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedBadgesSchema, data);
}
