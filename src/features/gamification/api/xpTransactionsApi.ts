/**
 * XP transactions API — `GET /XpTransaction/explorer/{explorerId}` (Bearer).
 * The explorer's XP ledger, paginated and Zod-validated at the boundary.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { xpTransactionEndpoints } from './endpoints';
import { pagedXpTransactionsSchema } from './schemas';
import type { z } from 'zod';

export type PagedXpTransactions = z.infer<typeof pagedXpTransactionsSchema>;

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export async function getXpTransactions(
  explorerId: string,
  { page = 1, pageSize = 20 }: PageParams = {},
): Promise<PagedXpTransactions> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: xpTransactionEndpoints.forExplorer(explorerId),
    params: { page, pageSize },
  });
  return zodParse(pagedXpTransactionsSchema, data);
}
