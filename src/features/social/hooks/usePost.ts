/**
 * usePost — a single post (detail screen header). Seeds nothing; the detail screen
 * relies on this as the source of truth for counts after optimistic like updates.
 */
import { useQuery } from '@tanstack/react-query';
import { getPost } from '../api/postApi';
import { socialKeys } from './keys';

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: socialKeys.post(postId ?? 'none'),
    queryFn: () => getPost(postId!),
    enabled: !!postId,
  });
}
