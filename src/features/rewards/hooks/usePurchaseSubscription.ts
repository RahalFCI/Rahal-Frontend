/**
 * usePurchaseSubscription — buys a premium subscription with XP. Like claiming a
 * coupon, the XP debit and premium flag are applied asynchronously by a backend
 * consumer, so we poll the profile (fire-and-forget) until `availableXp` drops and
 * refresh the active-subscription query.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import i18n from '../../../shared/i18n';
import { purchaseSubscription } from '../api/subscriptionsApi';
import type { Subscription } from '../api/schemas';
import { rewardErrorMessage } from '../utils/errorMessage';
import { pollXpDebit } from '../utils/pollXpDebit';
import { rewardsKeys } from './keys';

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
    onSuccess: (subscription, { planTierName }) => {
      const name = planTierName?.trim() || subscription.planTierName?.trim();
      toast.show(
        name
          ? i18n.t('rewards:premium.purchaseSuccess', { name })
          : i18n.t('rewards:premium.purchaseSuccessGeneric'),
      );

      if (!explorerId) return;
      queryClient.invalidateQueries({ queryKey: rewardsKeys.activeSubscription(explorerId) });

      // XP debits asynchronously — poll in the background so the mutation settles now.
      void pollXpDebit(queryClient, explorerId);
    },
    onError: (error) => {
      toast.show(
        rewardErrorMessage(
          error,
          'rewards:premium.purchaseError',
          'rewards:premium.alreadySubscribed',
        ),
      );
    },
  });
}
