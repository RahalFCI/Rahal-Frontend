/**
 * Comment mutations: create (root or reply), edit, delete. Comment lists are
 * refetched (invalidated) rather than optimistically spliced — keyset pagination
 * makes in-place insertion fiddly, and the post's commentsCount is patched in the
 * post caches for an instant header update.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';
import { createComment, editComment, deleteComment } from '../api/commentApi';
import { applyPostPatch } from '../utils/postCache';
import { socialErrorMessage } from '../utils/errorMessage';
import { socialKeys } from './keys';
import type { Comment } from '../api/schemas';

function invalidateThread(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  parentCommentId?: string | null,
) {
  queryClient.invalidateQueries({ queryKey: socialKeys.comments(postId) });
  if (parentCommentId) {
    queryClient.invalidateQueries({ queryKey: socialKeys.replies(parentCommentId) });
  }
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<Comment, unknown, { content: string; parentCommentId?: string | null }>({
    mutationFn: ({ content, parentCommentId }) =>
      createComment(postId, { content, parentCommentId }),
    onSuccess: (_c, { parentCommentId }) => {
      applyPostPatch(queryClient, postId, (p) => ({ commentsCount: p.commentsCount + 1 }));
      invalidateThread(queryClient, postId, parentCommentId);
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) });
    },
    onError: (error) => toast.show(socialErrorMessage(error, 'social:comment.createFailed')),
  });
}

export function useEditComment(postId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<
    Comment,
    unknown,
    { commentId: string; content: string; parentCommentId?: string | null }
  >({
    mutationFn: ({ commentId, content }) => editComment(commentId, content),
    onSuccess: (_c, { parentCommentId }) => {
      toast.show(i18n.t('social:comment.edited'));
      invalidateThread(queryClient, postId, parentCommentId);
    },
    onError: (error) => toast.show(socialErrorMessage(error, 'social:comment.editFailed')),
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<void, unknown, { commentId: string; parentCommentId?: string | null }>({
    mutationFn: ({ commentId }) => deleteComment(commentId),
    onSuccess: (_d, { parentCommentId }) => {
      applyPostPatch(queryClient, postId, (p) => ({
        commentsCount: Math.max(0, p.commentsCount - 1),
      }));
      invalidateThread(queryClient, postId, parentCommentId);
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) });
    },
    onError: (error) => toast.show(socialErrorMessage(error, 'social:comment.deleteFailed')),
  });
}
