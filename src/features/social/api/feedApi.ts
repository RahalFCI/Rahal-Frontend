/**
 * Feed API. `GET /users/{userId}/feed` — the backend requires {userId} to equal the
 * caller (else 403). Cursor is a long (unix seconds); omit for the first page.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { feedEndpoints } from './endpoints';
import { feedPageSchema, type FeedPage } from './schemas';

export async function getFeed(
  userId: string,
  cursor?: number,
  limit = 20,
): Promise<FeedPage> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: feedEndpoints.feed(userId),
    params: { cursor, limit },
  });
  return zodParse(feedPageSchema, data);
}

export async function getUserPosts(
  userId: string,
  cursor?: number,
  limit = 20,
): Promise<FeedPage> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: feedEndpoints.userPosts(userId),
    params: { cursor, limit },
  });
  return zodParse(feedPageSchema, data);
}
