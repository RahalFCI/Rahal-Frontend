/**
 * Posts API — create/read/delete + like/unlike. Like/unlike return an
 * ApiResponse<string>; delete returns 204 (apiClientNoContent). Create accepts
 * pre-signed Cloudinary `mediaIds` (see mediaApi).
 */
import { apiClient, apiClientNoContent } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { postEndpoints } from './endpoints';
import { postSchema, postCreatedSchema, type Post, type PostCreated } from './schemas';

export interface CreatePostInput {
  content: string;
  mediaIds?: string[];
  isPublic?: boolean;
}

export async function getPost(id: string): Promise<Post> {
  const data = await apiClient<unknown>({ method: 'GET', url: postEndpoints.byId(id) });
  return zodParse(postSchema, data);
}

export async function createPost(input: CreatePostInput): Promise<PostCreated> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: postEndpoints.create,
    data: {
      content: input.content,
      mediaIds: input.mediaIds ?? [],
      isPublic: input.isPublic ?? true,
    },
  });
  return zodParse(postCreatedSchema, data);
}

export async function deletePost(id: string): Promise<void> {
  await apiClientNoContent({ method: 'DELETE', url: postEndpoints.delete(id) });
}

export async function likePost(id: string): Promise<void> {
  await apiClient<unknown>({ method: 'POST', url: postEndpoints.like(id) });
}

export async function unlikePost(id: string): Promise<void> {
  await apiClient<unknown>({ method: 'DELETE', url: postEndpoints.like(id) });
}
