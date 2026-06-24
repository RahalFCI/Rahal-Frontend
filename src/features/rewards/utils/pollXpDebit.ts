/**
 * Polls the explorer profile until the asynchronous XP debit lands (the spend is
 * applied by a backend MassTransit consumer a beat after the mutation returns),
 * writing each fresh profile into the query cache so XP-gated UI updates.
 *
 * Designed to be FIRE-AND-FORGET: callers must NOT `await` this inside a mutation
 * `onSuccess`, or react-query won't settle the mutation until polling finishes —
 * leaving the button stuck on its pending label and delaying any call-level
 * `onSuccess` (e.g. navigation) by up to ~5s. Kick it off with `void pollXpDebit(...)`.
 */
import type { QueryClient } from '@tanstack/react-query';
import { getExplorerProfile, type ExplorerProfileDto } from '../../auth/api/authApi';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function pollXpDebit(queryClient: QueryClient, explorerId: string): Promise<void> {
  const profileKey = ['profile', explorerId];
  const previous = queryClient.getQueryData<ExplorerProfileDto>(profileKey);
  const baselineXp = previous ? (previous.availableXp ?? 0) : null;

  try {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await delay(800);
      const fresh = await getExplorerProfile(explorerId);
      queryClient.setQueryData(profileKey, fresh);
      if (baselineXp == null) break;
      if ((fresh.availableXp ?? 0) < baselineXp) break;
    }
  } catch {
    // Swallow — the mutation itself succeeded; a failed profile refresh shouldn't surface.
  }
}
