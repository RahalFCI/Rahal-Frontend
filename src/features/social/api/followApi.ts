/**
 * Follow API — follow/unfollow + paginated followers/followees. Follow & unfollow
 * return an ApiResponse<FollowResponse> we don't need, so the body is ignored.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { followEndpoints } from './endpoints';
import { pagedSocialUsersSchema, type PagedSocialUsers } from './schemas';

export async function followUser(targetUserId: string): Promise<void> {
  await apiClient<unknown>({ method: 'POST', url: followEndpoints.follow(targetUserId) });
}

export async function unfollowUser(targetUserId: string): Promise<void> {
  await apiClient<unknown>({ method: 'DELETE', url: followEndpoints.follow(targetUserId) });
}

export async function getFollowers(
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<PagedSocialUsers> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: followEndpoints.followers(userId),
    params: { page, pageSize },
  });
  return zodParse(pagedSocialUsersSchema, data);
}

export async function getFollowees(
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<PagedSocialUsers> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: followEndpoints.followees(userId),
    params: { page, pageSize },
  });
  return zodParse(pagedSocialUsersSchema, data);
}
