/**
 * Check-in history API — `GET /CheckIn/explorer/{explorerId}` (Bearer).
 * Paginated record of an explorer's check-ins, for the Journal feed.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { checkInEndpoints } from './endpoints';
import { pagedCheckInsSchema } from './schemas';
import type { PageParams } from './xpTransactionsApi';
import type { z } from 'zod';

export type PagedCheckIns = z.infer<typeof pagedCheckInsSchema>;

export async function getCheckInHistory(
  explorerId: string,
  { page = 1, pageSize = 20 }: PageParams = {},
): Promise<PagedCheckIns> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: checkInEndpoints.historyForExplorer(explorerId),
    params: { page, pageSize },
  });
  return zodParse(pagedCheckInsSchema, data);
}
