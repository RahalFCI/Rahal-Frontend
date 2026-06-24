/**
 * useClaimCoupon — the Phase 4 redemption flow. The explorer spends XP to claim a
 * coupon, receiving a redeemable code (CLAUDE.md §1.4 #4). XP is debited
 * ASYNCHRONOUSLY by a backend consumer (the POST returns the wallet entry before
 * the spend lands), so — exactly like check-in — we poll the profile until
 * `availableXp` reflects the debit, then refresh the wallet + catalog.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import { getExplorerProfile, type ExplorerProfileDto } from '../../auth/api/authApi';
import i18n from '../../../shared/i18n';
import { claimCoupon } from '../api/userCouponsApi';
import type { UserCoupon } from '../api/schemas';
import { rewardErrorMessage } from '../utils/errorMessage';
import { rewardsKeys } from './keys';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
    onSuccess: async (userCoupon, { couponTitle }) => {
      const title = couponTitle?.trim() || userCoupon.couponTitle?.trim();
      toast.show(
        title ? i18n.t('rewards:claim.success', { title }) : i18n.t('rewards:claim.successGeneric'),
      );

      if (!explorerId) return;

      // The claimed coupon decremented stock; the wallet gained an entry.
      queryClient.invalidateQueries({ queryKey: rewardsKeys.coupons.all });
      queryClient.invalidateQueries({ queryKey: rewardsKeys.myCoupons(explorerId) });

      // XP is debited asynchronously — poll the profile until availableXp drops,
      // then write it back so the catalog's balance gating updates.
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
        // A failed profile refresh shouldn't surface — the claim itself succeeded.
      }
    },
    onError: (error) => {
      toast.show(rewardErrorMessage(error, 'rewards:claim.error'));
    },
  });
}
