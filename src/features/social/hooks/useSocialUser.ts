/**
 * Social user reads: a single profile (with counters), the discover list, and the
 * paginated followers/followees lists.
 */
import { useQuery } from '@tanstack/react-query';
import { getSocialUser, getSocialUsers } from '../api/usersApi';
import { getFollowers, getFollowees } from '../api/followApi';
import { socialKeys } from './keys';

export function useSocialUser(userId: string | undefined) {
  return useQuery({
    queryKey: socialKeys.socialUser(userId ?? 'none'),
    queryFn: () => getSocialUser(userId!),
    enabled: !!userId,
  });
}

export function useSocialUsers() {
  return useQuery({
    queryKey: socialKeys.socialUsers(),
    queryFn: async () => (await getSocialUsers(1, 50)).items,
  });
}

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: socialKeys.followers(userId ?? 'none'),
    queryFn: async () => (await getFollowers(userId!, 1, 50)).items,
    enabled: !!userId,
  });
}

export function useFollowees(userId: string | undefined) {
  return useQuery({
    queryKey: socialKeys.followees(userId ?? 'none'),
    queryFn: async () => (await getFollowees(userId!, 1, 50)).items,
    enabled: !!userId,
  });
}
