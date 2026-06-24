/**
 * useClaimCoupon — the Phase 4 redemption flow. The explorer spends XP to claim a
 * coupon, receiving a redeemable code (CLAUDE.md §1.4 #4). XP is debited
 * ASYNCHRONOUSLY by a backend consumer (the POST returns the wallet entry before
 * the spend lands), so we poll the profile until `availableXp` reflects the debit.
 * The poll runs fire-and-forget so the mutation settles immediately — otherwise the
 * claim button stays on "Claiming…" and the success navigation stalls ~5s.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import i18n from '../../../shared/i18n';
import { claimCoupon } from '../api/userCouponsApi';
import type { UserCoupon } from '../api/schemas';
import { rewardErrorMessage } from '../utils/errorMessage';
import { pollXpDebit } from '../utils/pollXpDebit';
import { rewardsKeys } from './keys';

interface ClaimVars {
  couponId: string;
  /** Powers the success toast (the response carries `couponTitle`, kept as a fallback). */
  couponTitle?: string;
}

export function useClaimCoupon() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);

  return useMutation<UserCoupon, unknown, ClaimVars>({
    mutationFn: ({ couponId }: ClaimVars) => {
      if (!explorerId) throw new ApiError('UNAUTHORIZED', 'No explorer session', 401);
      return claimCoupon(couponId);
    },
    onSuccess: (userCoupon, { couponTitle }) => {
      const title = couponTitle?.trim() || userCoupon.couponTitle?.trim();
      toast.show(
        title ? i18n.t('rewards:claim.success', { title }) : i18n.t('rewards:claim.successGeneric'),
      );

      if (!explorerId) return;

      // The claimed coupon decremented stock; the wallet gained an entry.
      queryClient.invalidateQueries({ queryKey: rewardsKeys.coupons.all });
      queryClient.invalidateQueries({ queryKey: rewardsKeys.myCoupons(explorerId) });

      // XP is debited asynchronously — poll in the background so the mutation settles
      // now (button clears, success navigation runs) while the balance catches up.
      void pollXpDebit(queryClient, explorerId);
    },
    onError: (error) => {
      toast.show(rewardErrorMessage(error, 'rewards:claim.error', 'rewards:claim.alreadyClaimed'));
    },
  });
}
