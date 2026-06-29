/**
 * useUserPosts — a single user's authored posts (infinite), for profile screens.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserPosts } from '../api/feedApi';
import { socialKeys } from './keys';

export function useUserPosts(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: socialKeys.userPosts(userId ?? 'none'),
    queryFn: ({ pageParam }) => getUserPosts(userId!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!userId,
  });
}
