/**
 * useToggleFollow — follow/unfollow a user. Optimistically bumps the target's
 * follower counter in the cached profile, then invalidates the lists + the caller's
 * feed (followee posts fan into the feed) on settle. Rolls back on error.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import { followUser, unfollowUser } from '../api/followApi';
import { socialErrorMessage } from '../utils/errorMessage';
import { socialKeys } from './keys';
import type { SocialUser } from '../api/schemas';

interface FollowVars {
  targetUserId: string;
  /** Whether the caller already follows the target BEFORE the tap. */
  following: boolean;
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const userId = useAuthStore((s) => s.user?.id);

  const bump = (targetUserId: string, delta: number) => {
    queryClient.setQueryData(socialKeys.socialUser(targetUserId), (old: SocialUser | undefined) =>
      old ? { ...old, followersCount: Math.max(0, old.followersCount + delta) } : old,
    );
  };

  return useMutation<void, unknown, FollowVars>({
    mutationFn: ({ targetUserId, following }) =>
      following ? unfollowUser(targetUserId) : followUser(targetUserId),
    onMutate: async ({ targetUserId, following }) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.socialUser(targetUserId) });
      bump(targetUserId, following ? -1 : 1);
    },
    onError: (error, { targetUserId, following }) => {
      bump(targetUserId, following ? 1 : -1);
      toast.show(socialErrorMessage(error, 'social:error.followFailed'));
    },
    onSettled: (_d, _e, { targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.socialUser(targetUserId) });
      queryClient.invalidateQueries({ queryKey: socialKeys.followers(targetUserId) });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: socialKeys.followees(userId) });
        queryClient.invalidateQueries({ queryKey: socialKeys.feed(userId) });
      }
    },
  });
}
