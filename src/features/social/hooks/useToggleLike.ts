/**
 * useToggleLike — optimistic like/unlike. Patches the post across every cache (feed,
 * user-posts, detail) immediately, then reconciles the authoritative count by
 * invalidating the post detail on settle. Rolls back on error.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import { likePost, unlikePost } from '../api/postApi';
import { applyPostPatch } from '../utils/postCache';
import { socialErrorMessage } from '../utils/errorMessage';
import { socialKeys } from './keys';

interface ToggleVars {
  postId: string;
  /** The post's like state BEFORE the tap. */
  liked: boolean;
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<void, unknown, ToggleVars>({
    mutationFn: ({ postId, liked }) => (liked ? unlikePost(postId) : likePost(postId)),
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.all });
      applyPostPatch(queryClient, postId, (p) => ({
        isLikedByThisUser: !liked,
        likesCount: Math.max(0, p.likesCount + (liked ? -1 : 1)),
      }));
    },
    onError: (error, { postId, liked }) => {
      // Roll back the optimistic toggle.
      applyPostPatch(queryClient, postId, (p) => ({
        isLikedByThisUser: liked,
        likesCount: Math.max(0, p.likesCount + (liked ? 1 : -1)),
      }));
      toast.show(socialErrorMessage(error, 'social:error.likeFailed'));
    },
    onSettled: (_d, _e, { postId }) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) });
    },
  });
}
