/**
 * Explorer achievements API — `GET /ExplorerAchievement/explorer/{explorerId}`
 * (Bearer). The achievements an explorer has earned, paginated.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { explorerAchievementEndpoints } from './endpoints';
import { pagedExplorerAchievementsSchema } from './schemas';
import type { PageParams } from './xpTransactionsApi';
import type { z } from 'zod';

export type PagedExplorerAchievements = z.infer<typeof pagedExplorerAchievementsSchema>;

export async function getExplorerAchievements(
  explorerId: string,
  { page = 1, pageSize = 100 }: PageParams = {},
): Promise<PagedExplorerAchievements> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: explorerAchievementEndpoints.forExplorer(explorerId),
    params: { page, pageSize },
  });
  return zodParse(pagedExplorerAchievementsSchema, data);
}
