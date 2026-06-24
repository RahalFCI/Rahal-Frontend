/**
 * useJournalFeed — the editorial "journal of exploration": the explorer's
 * check-ins and XP gains merged into one timeline, newest first. Feeds both the
 * Journal screen and the Profile recent-activity strip.
 */
import { useMemo } from 'react';
import { useCheckInHistory } from './useCheckInHistory';
import { useXpTransactions } from './useXpTransactions';
import type { CheckIn, XpTransaction } from '../api/schemas';

export type JournalEntry =
  | { id: string; kind: 'checkin'; timestamp: number; checkIn: CheckIn }
  | { id: string; kind: 'xp'; timestamp: number; xp: XpTransaction };

function toTime(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

export function useJournalFeed(explorerId: string | undefined) {
  const checkInsQuery = useCheckInHistory(explorerId);
  const xpQuery = useXpTransactions(explorerId);

  const entries = useMemo<JournalEntry[]>(() => {
    const checkIns = checkInsQuery.data?.items ?? [];
    const xp = xpQuery.data?.items ?? [];

    const merged: JournalEntry[] = [
      ...checkIns.map((c, i) => ({
        id: `checkin:${c.placeId ?? i}:${c.createdAt ?? i}`,
        kind: 'checkin' as const,
        timestamp: toTime(c.createdAt),
        checkIn: c,
      })),
      ...xp.map((x) => ({
        id: `xp:${x.id}`,
        kind: 'xp' as const,
        timestamp: toTime(x.createdAt),
        xp: x,
      })),
    ];

    return merged.sort((a, b) => b.timestamp - a.timestamp);
  }, [checkInsQuery.data, xpQuery.data]);

  return {
    entries,
    isLoading: checkInsQuery.isLoading || xpQuery.isLoading,
    isError: checkInsQuery.isError || xpQuery.isError,
    refetch: () => {
      checkInsQuery.refetch();
      xpQuery.refetch();
    },
  };
}
