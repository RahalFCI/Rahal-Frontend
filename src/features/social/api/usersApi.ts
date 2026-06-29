/**
 * Social users API — the "discover people" list and a single social profile (with
 * follower/following counters). The list includes the caller (backend gap #10);
 * callers should filter self client-side.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { socialUserEndpoints } from './endpoints';
import { socialUserSchema, pagedSocialUsersSchema, type SocialUser, type PagedSocialUsers } from './schemas';

export async function getSocialUsers(page = 1, pageSize = 20): Promise<PagedSocialUsers> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: socialUserEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedSocialUsersSchema, data);
}

export async function getSocialUser(userId: string): Promise<SocialUser> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: socialUserEndpoints.byId(userId),
  });
  return zodParse(socialUserSchema, data);
}
