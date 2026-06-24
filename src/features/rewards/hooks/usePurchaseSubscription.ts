/**
 * usePurchaseSubscription — buys a premium subscription with XP. Like claiming a
 * coupon, the XP debit and premium flag are applied asynchronously by a backend
 * consumer, so we poll the profile until `availableXp` drops, then refresh the
 * active-subscription query.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import { getExplorerProfile, type ExplorerProfileDto } from '../../auth/api/authApi';
import i18n from '../../../shared/i18n';
import { purchaseSubscription } from '../api/subscriptionsApi';
import type { Subscription } from '../api/schemas';
import { rewardErrorMessage } from '../utils/errorMessage';
import { rewardsKeys } from './keys';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface PurchaseVars {
  planTierId: string;
  /** Powers the success toast. */
  planTierName?: string;
}

export function usePurchaseSubscription() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);

  return useMutation<Subscription, unknown, PurchaseVars>({
    mutationFn: ({ planTierId }: PurchaseVars) => {
      if (!explorerId) throw new ApiError('UNAUTHORIZED', 'No explorer session', 401);
      return purchaseSubscription({ planTierId });
    },
    onSuccess: async (subscription, { planTierName }) => {
      const name = planTierName?.trim() || subscription.planTierName?.trim();
      toast.show(
        name
          ? i18n.t('rewards:premium.purchaseSuccess', { name })
          : i18n.t('rewards:premium.purchaseSuccessGeneric'),
      );

      if (!explorerId) return;
      queryClient.invalidateQueries({ queryKey: rewardsKeys.activeSubscription(explorerId) });

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
        // Swallow — the purchase itself succeeded.
      }
    },
    onError: (error) => {
      toast.show(rewardErrorMessage(error, 'rewards:premium.purchaseError'));
    },
  });
}
