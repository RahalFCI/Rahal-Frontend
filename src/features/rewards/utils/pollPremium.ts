/**
 * Polls the explorer profile until the premium flag lands. Premium is flipped by a
 * backend consumer a beat after `Subscription/purchase` returns (the SetPremium
 * request travels over the message bus), so we refetch a few times and write each
 * fresh profile into the query cache so `profile.isPremium`-gated UI updates.
 *
 * FIRE-AND-FORGET, like `pollXpDebit`: callers must NOT `await` this inside a mutation
 * `onSuccess`, or react-query won't settle the mutation until polling finishes.
 */
import type { QueryClient } from '@tanstack/react-query';
import { getExplorerProfile, type ExplorerProfileDto } from '../../auth/api/authApi';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function pollPremium(queryClient: QueryClient, explorerId: string): Promise<void> {
  const profileKey = ['profile', explorerId];

  try {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await delay(800);
      const fresh = await getExplorerProfile(explorerId);
      queryClient.setQueryData<ExplorerProfileDto>(profileKey, fresh);
      if (fresh.isPremium) break;
    }
  } catch {
    // Swallow — the purchase itself succeeded; a failed profile refresh shouldn't surface.
  }
}
