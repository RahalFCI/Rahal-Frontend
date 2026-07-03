/**
 * useActivatePremiumWithCard — activates a premium subscription via the "Visa"
 * payment method AFTER a card charge has been collected on the client (Stripe
 * PaymentSheet, see `payment/hooks/useCardCheckout`). The backend grants premium
 * synchronously on this call — it does not itself take the card — so we bridge the
 * two: charge first, then activate.
 *
 * Unlike `usePurchaseSubscription` (XP), there is no XP debit to poll; instead we
 * invalidate the active-subscription query (flips the Rewards UI immediately) and
 * background-poll the profile until `isPremium` lands (the SetPremium request is
 * applied by a backend consumer over the bus).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import i18n from '../../../shared/i18n';
import { purchaseSubscription, SubscriptionPaymentMethod } from '../api/subscriptionsApi';
import type { Subscription } from '../api/schemas';
import { rewardErrorMessage } from '../utils/errorMessage';
import { pollPremium } from '../utils/pollPremium';
import { rewardsKeys } from './keys';

interface ActivateVars {
  planTierId: string;
  /** Powers the success toast. */
  planTierName?: string;
}

export function useActivatePremiumWithCard() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);

  return useMutation<Subscription, unknown, ActivateVars>({
    mutationFn: ({ planTierId }: ActivateVars) => {
      if (!explorerId) throw new ApiError('UNAUTHORIZED', 'No explorer session', 401);
      return purchaseSubscription({ planTierId, paymentMethod: SubscriptionPaymentMethod.Visa });
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
      // Premium flag flips asynchronously over the bus — poll so profile-gated UI updates.
      void pollPremium(queryClient, explorerId);
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
