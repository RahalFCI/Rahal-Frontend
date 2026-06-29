/**
 * useFeed — the signed-in explorer's personalized feed (infinite). The backend
 * requires the path userId to equal the caller, so this is always the current user.
 * Cursor is a long (unix seconds); de-dupe happens at render via flattenPosts.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '../api/feedApi';
import { socialKeys } from './keys';

export function useFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: socialKeys.feed(userId ?? 'none'),
    queryFn: ({ pageParam }) => getFeed(userId!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!userId,
  });
}
