/** useXpTransactions — the explorer's XP ledger (first page). */
import { useQuery } from '@tanstack/react-query';
import { getXpTransactions } from '../api/xpTransactionsApi';
import { gamificationKeys } from './keys';

export function useXpTransactions(explorerId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.xp(explorerId ?? ''),
    queryFn: () => getXpTransactions(explorerId!),
    enabled: !!explorerId,
    staleTime: 60 * 1000,
  });
}
