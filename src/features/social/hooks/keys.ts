/**
 * Query-key namespace for the Social feature, under a single `social` root for
 * easy scoped invalidation (mirrors `rewardsKeys` / `gamificationKeys`).
 */
export const socialKeys = {
  all: ['social'] as const,
  feed: (userId: string) => ['social', 'feed', userId] as const,
  userPosts: (userId: string) => ['social', 'userPosts', userId] as const,
  post: (postId: string) => ['social', 'post', postId] as const,
  comments: (postId: string) => ['social', 'comments', postId] as const,
  replies: (commentId: string) => ['social', 'replies', commentId] as const,
  socialUser: (userId: string) => ['social', 'user', userId] as const,
  socialUsers: () => ['social', 'users'] as const,
  followers: (userId: string) => ['social', 'followers', userId] as const,
  followees: (userId: string) => ['social', 'followees', userId] as const,
};
