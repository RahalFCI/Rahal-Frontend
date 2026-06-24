/**
 * Achievements API — `GET /Achievement` (Bearer). All achievement templates,
 * paginated. Earned state comes from explorerAchievementsApi.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { achievementEndpoints } from './endpoints';
import { pagedAchievementsSchema } from './schemas';
import type { PageParams } from './xpTransactionsApi';
import type { z } from 'zod';

export type PagedAchievements = z.infer<typeof pagedAchievementsSchema>;

export async function getAchievements(
  { page = 1, pageSize = 50 }: PageParams = {},
): Promise<PagedAchievements> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: achievementEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedAchievementsSchema, data);
}
