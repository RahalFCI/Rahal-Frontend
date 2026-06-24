/**
 * useCancelSubscription — cancels the explorer's active premium subscription and
 * refreshes the active-subscription + profile (premium flag) state.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import i18n from '../../../shared/i18n';
import { cancelSubscription } from '../api/subscriptionsApi';
import { rewardErrorMessage } from '../utils/errorMessage';
import { rewardsKeys } from './keys';

export function useCancelSubscription() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);

  return useMutation<string, unknown, void>({
    mutationFn: () => cancelSubscription(),
    onSuccess: () => {
      toast.show(i18n.t('rewards:premium.cancelSuccess'));
      if (!explorerId) return;
      queryClient.invalidateQueries({ queryKey: rewardsKeys.activeSubscription(explorerId) });
      queryClient.invalidateQueries({ queryKey: ['profile', explorerId] });
    },
    onError: (error) => {
      toast.show(rewardErrorMessage(error, 'rewards:premium.cancelError'));
    },
  });
}
