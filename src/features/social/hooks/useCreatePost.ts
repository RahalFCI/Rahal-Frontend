/**
 * useCreatePost — uploads any local media to Cloudinary first (signed direct upload),
 * then creates the post. On success, invalidates the feed + the author's posts so the
 * new post appears. The screen handles navigation.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';
import { useAuthStore } from '../../auth/store/authStore';
import { createPost } from '../api/postApi';
import { uploadMediaBatch, type LocalMedia } from '../api/mediaApi';
import { socialErrorMessage } from '../utils/errorMessage';
import { socialKeys } from './keys';
import type { PostCreated } from '../api/schemas';

interface CreateVars {
  content: string;
  media?: LocalMedia[];
  isPublic?: boolean;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation<PostCreated, unknown, CreateVars>({
    mutationFn: async ({ content, media, isPublic }) => {
      const mediaIds = media && media.length > 0 ? await uploadMediaBatch(media) : [];
      return createPost({ content, mediaIds, isPublic });
    },
    onSuccess: () => {
      toast.show(i18n.t('social:post.created'));
      if (userId) {
        queryClient.invalidateQueries({ queryKey: socialKeys.feed(userId) });
        queryClient.invalidateQueries({ queryKey: socialKeys.userPosts(userId) });
      }
    },
    onError: (error) => {
      toast.show(socialErrorMessage(error, 'social:post.createFailed'));
    },
  });
}
