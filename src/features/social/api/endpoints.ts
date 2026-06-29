/**
 * Social endpoints (relative to env.API_BASE_URL, which already includes /api).
 * Mirrors the SocialMedia module controllers: PostsController, FeedController,
 * UserPostsController, FollowController, SocialUsersController, MediaController.
 * Routes are case-insensitive on the backend; see docs/social/02-backend-api-contract.md.
 */
export const postEndpoints = {
  create: '/posts',
  byId: (id: string) => `/posts/${id}`,
  delete: (id: string) => `/posts/${id}`,
  like: (id: string) => `/posts/${id}/like`,
  comments: (id: string) => `/posts/${id}/comments`,
} as const;

export const commentEndpoints = {
  edit: (commentId: string) => `/comments/${commentId}`,
  delete: (commentId: string) => `/comments/${commentId}`,
  replies: (commentId: string) => `/comments/${commentId}/replies`,
} as const;

export const feedEndpoints = {
  /** Personalized feed. The backend requires {userId} to equal the caller. */
  feed: (userId: string) => `/users/${userId}/feed`,
  /** A user's own authored posts (any user). */
  userPosts: (userId: string) => `/users/${userId}/posts`,
} as const;

export const followEndpoints = {
  followers: (userId: string) => `/users/${userId}/followers`,
  followees: (userId: string) => `/users/${userId}/followees`,
  follow: (targetUserId: string) => `/users/${targetUserId}/follow`,
} as const;

export const socialUserEndpoints = {
  list: '/social-media/users',
  byId: (userId: string) => `/social-media/users/${userId}`,
} as const;

export const mediaEndpoints = {
  signatures: '/Media/signatures',
} as const;
