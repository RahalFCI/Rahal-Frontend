/**
 * Comments API. Root comments + replies use keyset pagination with an ISO DateTime
 * cursor (root = newest-first; replies = chronological). Create/edit return a
 * CommentResponse (whose userDisplayName may be null — the FE fills it in locally).
 * Delete returns 204.
 */
import { apiClient, apiClientNoContent } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { postEndpoints, commentEndpoints } from './endpoints';
import { commentSchema, commentPageSchema, type Comment, type CommentPage } from './schemas';

export async function getRootComments(
  postId: string,
  cursor?: string,
  limit = 20,
): Promise<CommentPage> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: postEndpoints.comments(postId),
    params: { cursor, limit },
  });
  return zodParse(commentPageSchema, data);
}

export async function getReplies(
  commentId: string,
  cursor?: string,
  limit = 20,
): Promise<CommentPage> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: commentEndpoints.replies(commentId),
    params: { cursor, limit },
  });
  return zodParse(commentPageSchema, data);
}

export async function createComment(
  postId: string,
  input: { content: string; parentCommentId?: string | null },
): Promise<Comment> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: postEndpoints.comments(postId),
    data: { content: input.content, parentCommentId: input.parentCommentId ?? null },
  });
  return zodParse(commentSchema, data);
}

export async function editComment(commentId: string, content: string): Promise<Comment> {
  const data = await apiClient<unknown>({
    method: 'PUT',
    url: commentEndpoints.edit(commentId),
    data: { content },
  });
  return zodParse(commentSchema, data);
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClientNoContent({ method: 'DELETE', url: commentEndpoints.delete(commentId) });
}
