/**
 * useComments — root comments for a post (infinite, newest-first, DateTime cursor).
 * useReplies — nested replies for a comment (infinite, chronological).
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { getRootComments, getReplies } from '../api/commentApi';
import { socialKeys } from './keys';

export function useComments(postId: string | undefined) {
  return useInfiniteQuery({
    queryKey: socialKeys.comments(postId ?? 'none'),
    queryFn: ({ pageParam }) => getRootComments(postId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!postId,
  });
}

export function useReplies(commentId: string | undefined, enabled = true) {
  return useInfiniteQuery({
    queryKey: socialKeys.replies(commentId ?? 'none'),
    queryFn: ({ pageParam }) => getReplies(commentId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!commentId && enabled,
  });
}
