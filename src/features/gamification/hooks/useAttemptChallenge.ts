/**
 * useAttemptChallenge — submits one challenge attempt end to end.
 *
 * Orchestrates the two-call backend flow: reuse an existing `Pending` CheckInChallenge
 * for this (challenge, check-in) if the caller has one, else create it; then upload the
 * proof photo to validate. On an approved verdict the backend awards XP asynchronously,
 * so — like `useCheckIn` — we poll the profile for the XP delta and fire the editorial
 * reward beacon / Relic Title moment (CLAUDE.md §3.2), never a slot-machine payout.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, errorMap } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import { getExplorerProfile, type ExplorerProfileDto } from '../../auth/api/authApi';
import i18n from '../../../shared/i18n';
import { didLevelUp, levelFromXp } from '../../../shared/gamification/leveling';
import {
  createCheckInChallenge,
  validateCheckInChallenge,
  type AttemptMedia,
} from '../api/checkInChallengeApi';
import { useRewardOverlay } from '../components/RewardOverlay';
import { gamificationKeys } from './keys';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface AttemptChallengeVars {
  challengeId: string;
  checkInId: string;
  media: AttemptMedia;
  /** Reuse this Pending CheckInChallenge id instead of creating a new link. */
  existingAttemptId?: string | null;
}

function messageForError(error: unknown): string {
  if (error instanceof ApiError) {
    return i18n.t(errorMap[error.code].messageKey);
  }
  return i18n.t('common:error.unknown');
}

export function useAttemptChallenge() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);
  const showReward = useRewardOverlay();

  return useMutation<boolean, unknown, AttemptChallengeVars>({
    mutationFn: async ({ challengeId, checkInId, media, existingAttemptId }) => {
      if (!explorerId) throw new ApiError('UNAUTHORIZED', 'No explorer session', 401);
      const attemptId =
        existingAttemptId ??
        (await createCheckInChallenge({ challengeId, checkInId })).id;
      return validateCheckInChallenge(attemptId, media);
    },
    onSuccess: async (approved, { checkInId }) => {
      // Reflect the new attempt status (Approved / Rejected) on the card.
      queryClient.invalidateQueries({
        queryKey: gamificationKeys.checkInChallenges(checkInId),
      });

      if (!approved) {
        toast.show(i18n.t('places:challenges.rejectedToast'));
        return;
      }

      toast.show(i18n.t('places:challenges.approvedToast'));
      if (!explorerId) return;

      // XP is awarded ASYNCHRONOUSLY by a backend consumer (the same pattern as a
      // check-in), so poll the profile until cumulativeXp reflects the award, then
      // drive the beacon / level-up from the observed delta.
      const profileKey = ['profile', explorerId];
      const previous = queryClient.getQueryData<ExplorerProfileDto>(profileKey);
      const baselineXp = previous ? (previous.cumulativeXp ?? 0) : null;

      let fresh: ExplorerProfileDto | null = null;
      try {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          await delay(800);
          fresh = await getExplorerProfile(explorerId);
          queryClient.setQueryData(profileKey, fresh);
          if (baselineXp == null) break;
          if ((fresh.cumulativeXp ?? 0) > baselineXp) break;
        }
      } catch {
        // A failed profile refresh shouldn't surface — the attempt itself succeeded.
      }

      queryClient.invalidateQueries({ queryKey: gamificationKeys.xp(explorerId) });
      queryClient.invalidateQueries({
        queryKey: gamificationKeys.explorerAchievements(explorerId),
      });

      if (fresh && baselineXp != null) {
        const nextXp = fresh.cumulativeXp ?? 0;
        if (nextXp > baselineXp) {
          showReward({
            xpGained: nextXp - baselineXp,
            leveledUp: didLevelUp(baselineXp, nextXp),
            newLevel: levelFromXp(nextXp).level,
          });
        }
      }
    },
    onError: (error) => {
      toast.show(messageForError(error));
    },
  });
}
