/**
 * useDeletePost — soft-deletes the explorer's own post and removes it from every
 * cached list optimistically.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';
import { useAuthStore } from '../../auth/store/authStore';
import { deletePost } from '../api/postApi';
import { removePostFromLists } from '../utils/postCache';
import { socialErrorMessage } from '../utils/errorMessage';
import { socialKeys } from './keys';

export function useDeletePost() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation<void, unknown, { postId: string }>({
    mutationFn: ({ postId }) => deletePost(postId),
    onSuccess: (_d, { postId }) => {
      removePostFromLists(queryClient, postId);
      toast.show(i18n.t('social:post.deleted'));
      if (userId) {
        queryClient.invalidateQueries({ queryKey: socialKeys.feed(userId) });
        queryClient.invalidateQueries({ queryKey: socialKeys.userPosts(userId) });
      }
    },
    onError: (error) => {
      toast.show(socialErrorMessage(error, 'social:post.deleteFailed'));
    },
  });
}
